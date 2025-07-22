import {
  getOrSet,
  delByPattern,
  getJsonFromCache,
  setJsonInCache,
} from "@/libs/redis";
import { z } from "zod";
import { getCacheKey } from "@/libs/utils";
import { HTTPException } from "hono/http-exception";
import { createRouter } from "@/utils/router.utils";
import { zValidator } from "@hono/zod-validator";
import { followers, following, profiles } from "@hexagano/backend";
import { db } from "@hexagano/backend";
import { and, eq, ilike, ne, sql } from "drizzle-orm";
import { genCharacters } from "@hexagano/backend";
import unidecode from "unidecode";

const router = createRouter();

const EditableUserFieldsSchema = z
  .object({
    name: z.string().min(1).max(100).trim().optional(),
    picture: z.string().url().optional(),
    bio: z.string().max(500).trim().optional(),
    banner: z.string().url().optional(),
    social_media: z
      .object({
        twitter: z.string().url().optional().or(z.literal("")),
        instagram: z.string().url().optional().or(z.literal("")),
        linkedin: z.string().url().optional().or(z.literal("")),
        github: z.string().url().optional().or(z.literal("")),
        website: z.string().url().optional().or(z.literal("")),
      })
      .strict()
      .optional(),
    genre: z.string().min(3).max(17).trim().optional(),
    preferences: z
      .object({
        privacy: z
          .object({
            profile_visibility: z.enum(["public", "private"]).optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .optional(),
  })
  .passthrough();

const USER_PROFILE_CACHE_TTL = 300;
const FOLLOWERS_CACHE_TTL = 600;

const getUserProfileCacheKey = (userId: string) =>
  getCacheKey(`user:profile:${userId}`);

async function fetchUserProfileFromDB(userId: string) {
  const baseCacheKey = `profile:${userId}`;
  const cachedProfile =
    await getJsonFromCache<typeof profiles.$inferSelect>(baseCacheKey);
  if (cachedProfile) return cachedProfile;

  const user = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1)
    .then((res) => res[0]);
  if (!user) throw new HTTPException(404, { message: "Perfil não encontrado" });

  await setJsonInCache(baseCacheKey, user, 3600);
  return user;
}
// Pegar seguidores do usuário
router.get(
  "/followers",
  zValidator("query", z.object({ userId: z.string() })),
  async (c) => {
    const { userId } = c.req.valid("query");
    const cacheKey = getCacheKey(`user:followers:${userId}`);

    try {
      const followersList = await getOrSet(
        cacheKey,
        async () => {
          // Buscar seguidores com informações completas do perfil
          const result = await db
            .select({
              id: followers.id,
              user_id: followers.user_id,
              author_id: followers.author_id,
              created_at: followers.created_at,
              profile: {
                id: profiles.id,
                name: profiles.name,
                picture: profiles.picture,
                bio: profiles.bio,
                normalized_name: profiles.normalized_name,
              },
            })
            .from(followers)
            .innerJoin(profiles, eq(followers.user_id, profiles.id))
            .where(eq(followers.author_id, userId))
            .orderBy(followers.created_at)
            .limit(100);

          return result;
        },
        FOLLOWERS_CACHE_TTL,
      );

      // Contar total de seguidores
      const totalFollowers = await db
        .select({ count: sql`COUNT(*)`.mapWith(Number) })
        .from(followers)
        .where(eq(followers.author_id, userId))
        .then((res) => res[0]?.count || 0);

      return c.json({
        followers: followersList,
        count: totalFollowers,
        total: totalFollowers,
      });
    } catch (error) {
      console.error("Erro ao buscar seguidores:", error);
      return c.json(
        { message: "Erro ao buscar seguidores", cause: String(error) },
        500,
      );
    }
  },
);
// Pegar quem o usuário está seguindo
router.get(
  "/following",
  zValidator("query", z.object({ userId: z.string() })),
  async (c) => {
    const { userId } = c.req.valid("query");
    const cacheKey = getCacheKey(`user:following:${userId}`);

    try {
      const followingList = await getOrSet(
        cacheKey,
        async () => {
          const result = await db
            .select({
              id: following.id,
              user_id: following.user_id,
              author_id: following.author_id,
              created_at: following.created_at,
              profile: {
                id: profiles.id,
                name: profiles.name,
                picture: profiles.picture,
                bio: profiles.bio,
                normalized_name: profiles.normalized_name,
              },
            })
            .from(following)
            .innerJoin(profiles, eq(following.author_id, profiles.id))
            .where(eq(following.user_id, userId))
            .orderBy(following.created_at)
            .limit(100);

          return result;
        },
        FOLLOWERS_CACHE_TTL,
      );

      const totalFollowing = await db
        .select({ count: sql`COUNT(*)`.mapWith(Number) })
        .from(following)
        .where(eq(following.user_id, userId))
        .then((res) => res[0]?.count || 0);

      return c.json({
        following: followingList,
        count: totalFollowing,
        total: totalFollowing,
      });
    } catch (error) {
      console.error("Erro ao buscar seguindo:", error);
      return c.json(
        { message: "Erro ao buscar seguindo", cause: String(error) },
        500,
      );
    }
  },
);
// Verificar status de seguimento
router.get(
  "/following-status",
  zValidator("query", z.object({ userId: z.string() })),
  async (c) => {
    const { userId } = c.req.valid("query");
    const currentUser = c.get("user");

    if (!currentUser) {
      return c.json({ following: false });
    }

    try {
      const [{ count }] = await db
        .select({ count: sql`COUNT(*)`.mapWith(Number) })
        .from(followers)
        .where(
          and(
            eq(followers.author_id, userId),
            eq(followers.user_id, currentUser.id),
          ),
        );

      return c.json({ following: count > 0 });
    } catch (error) {
      console.error("Erro ao verificar status de seguimento:", error);
      return c.json({ following: false });
    }
  },
);

// Seguir usuário
router.post(
  "/follow",
  zValidator("json", z.object({ id: z.string() })),
  async (c) => {
    const input = c.req.valid("json");
    const user = c.get("user");

    if (input.id === user.id)
      return c.json({ message: "Você não pode seguir a si mesmo" }, 400);

    const followerCacheKey = getCacheKey(`user:followers:${input.id}`);
    const followingCacheKey = getCacheKey(`user:following:${user.id}`);

    try {
      const [{ count }] = await db
        .select({ count: sql`COUNT(*)`.mapWith(Number) })
        .from(followers)
        .where(
          and(
            eq(followers.author_id, input.id),
            eq(followers.user_id, user.id),
          ),
        );

      if (count > 0) {
        await db
          .delete(followers)
          .where(
            and(
              eq(followers.author_id, input.id),
              eq(followers.user_id, user.id),
            ),
          );
        await Promise.all([
          delByPattern(followerCacheKey),
          delByPattern(followingCacheKey),
        ]);
        return c.json({ following: false });
      } else {
        const [followerProfile] = await db
          .select({
            id: profiles.id,
            name: profiles.name,
            picture: profiles.picture,
          })
          .from(profiles)
          .where(eq(profiles.id, user.id))
          .limit(1);

        if (!followerProfile)
          return c.json({ message: "Perfil não encontrado" }, 404);

        await db.insert(followers).values({
          id: genCharacters(36),
          user_id: user.id,
          author_id: input.id,
          metadata_follower: followerProfile,
        });

        await Promise.all([
          delByPattern(followerCacheKey),
          delByPattern(followingCacheKey),
        ]);
        return c.json({ following: true });
      }
    } catch (error) {
      console.error("Erro ao seguir/deixar de seguir:", error);
      return c.json(
        { message: "Erro ao seguir/deixar de seguir", cause: String(error) },
        500,
      );
    }
  },
);
// Pegar perfil do usuário atual
router.get("/profile", async (c) => {
  const userId = c.get("user").id;
  const cacheKey = getUserProfileCacheKey(userId);
  try {
    const user = await getOrSet(
      cacheKey,
      () => fetchUserProfileFromDB(userId),
      USER_PROFILE_CACHE_TTL,
    );
    return c.json({ user });
  } catch (error) {
    throw new HTTPException(500, {
      message: `Erro ao buscar perfil: ${error}`,
    });
  }
});
// Atualizar perfil de usuário atual
router.patch(
  "/profile",
  zValidator("json", EditableUserFieldsSchema),
  async (c) => {
    const input = c.req.valid("json");
    const userId = c.get("user").id;

    const lastUpdate = await db
      .select({ updated_at: profiles.updated_at })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1)
      .then((res) => res[0]?.updated_at);

    if (!lastUpdate)
      throw new HTTPException(500, { message: "Erro ao verificar data" });

    const diff = Date.now() - new Date(lastUpdate).getTime();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    if (diff < SEVEN_DAYS) {
      const days = Math.ceil((SEVEN_DAYS - diff) / (1000 * 60 * 60 * 24));
      throw new HTTPException(429, {
        message: `Você só pode atualizar novamente em ${days} dia(s).`,
      });
    }

    if (input.name) {
      const normalized = `%${normalizeName(input.name)}%`;
      const exists = await db
        .select()
        .from(profiles)
        .where(
          and(
            ilike(profiles.normalized_name, normalized),
            ne(profiles.id, userId),
          ),
        )
        .limit(1)
        .then((r) => r.length > 0);

      if (exists)
        throw new HTTPException(409, { message: "Este nome já está em uso" });
    }

    const { profileFields } = sanitizeFields(input);
    if (Object.keys(profileFields).length === 0)
      throw new HTTPException(400, { message: "Nenhum campo para atualizar" });

    let current = await db
      .select({
        preferences: profiles.preferences,
        social_media: profiles.social_media,
      })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1)
      .then((res) => res[0] ?? {});

    const merged = mergeData(current, profileFields);
    merged.updated_at = new Date();

    const [userUpdated] = await db
      .update(profiles)
      .set(merged)
      .where(eq(profiles.id, userId))
      .returning();
    if (!userUpdated)
      throw new HTTPException(500, { message: "Erro ao atualizar perfil" });

    await delByPattern(getCacheKey(`user:profile:${userId}`));
    return c.json({ user: userUpdated, rateLimitRemaining: 0 });
  },
);

function sanitizeFields(input: z.infer<typeof EditableUserFieldsSchema>) {
  const profileFields: Record<string, any> = {};
  if (input.name) profileFields.name = input.name;
  if (input.picture) profileFields.picture = input.picture;
  if (input.bio) profileFields.bio = input.bio;
  if (input.banner) profileFields.banner = input.banner;
  if (input.genre) profileFields.genre = input.genre;
  if (input.preferences) profileFields.preferences = input.preferences;
  if (input.social_media) {
    const socialMedia: Record<string, string> = {};
    for (const [key, value] of Object.entries(input.social_media)) {
      if (value && value.trim()) socialMedia[key] = value.trim();
    }
    if (Object.keys(socialMedia).length > 0)
      profileFields.social_media = socialMedia;
  }
  return { profileFields };
}

function normalizeName(name: string): string {
  return unidecode(name)
    .toLowerCase()
    .trim()
    .replace(/[\s._\-]+/g, ".");
}

function mergeData(current: any, updates: any) {
  const merged = { ...updates };
  if (current) {
    if (updates.preferences && current.preferences) {
      merged.preferences = {
        ...current.preferences,
        ...updates.preferences,
        privacy: {
          ...current.preferences?.privacy,
          ...updates.preferences?.privacy,
        },
      };
    }
    if (updates.social_media && current.social_media) {
      merged.social_media = {
        ...current.social_media,
        ...updates.social_media,
      };
    }
  }
  return merged;
}

export default router;
