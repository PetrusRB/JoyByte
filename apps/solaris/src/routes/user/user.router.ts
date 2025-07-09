import { getOrSet, delByPattern } from "@/libs/redis";
import { z } from "zod";
import { getCacheKey } from "@/libs/utils";
import { HTTPException } from "hono/http-exception";
import { createRouter } from "@/utils/router.utils";
import { zValidator } from "@hono/zod-validator";
import { profiles } from "@/db/drizzle/schema";
import { db } from "@/db/drizzle";
import { and, eq, ilike, ne } from "drizzle-orm";

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

function getUserProfileCacheKey(userId: string): string {
  return getCacheKey(`user:profile:${userId}`);
}

async function fetchUserProfileFromDB(userId: string) {
  const user = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1)
    .then((res) => res[0]);

  if (!user) throw new HTTPException(500, { message: "Perfil não encontrado" });
  return user;
}
// Atualizar perfil de usuário
router.patch(
  "/profile",
  zValidator("json", EditableUserFieldsSchema),
  async (c) => {
    const input = c.req.valid("json");
    const userId = c.get("user").id;

    // Verificar implementação de throttling
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

      if (exists) {
        throw new HTTPException(409, { message: "Este nome já está em uso" });
      }
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

    // Merge manual fica igual
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

// Pegar usuaŕio atual
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
  const accents =
    "áàâãäåāăąÁÀÂÃÄÅĀĂĄéèêëēĕėęěÉÈÊËĒĔĖĘĚíìîïīĭįİÍÌÎÏĪĬĮıóòôõöøōŏőÓÒÔÕÖØŌŎŐúùûüūŭůűųÚÙÛÜŪŬŮŰŲñÑçćčçÇĆČđÐĐģĞğĢħĦıĲĳĸĶĺļľłŁĹĻĽńņňÑŃŅŇŕŗřŔŖŘśşšŚŞŠţťŧŢŤŦýÿÝŸžźżŽŹŻœŒæÆ";
  const replacements =
    "aaaaaaaaaAAAAAAAAAeeeeeeeeeeEEEEEEEEEiiiiiiiiIIIIIIIIiooooooooOOOOOOOOOuuuuuuuuuUUUUUUUUUnNc3cCCCCdDDDgGgGhHiiijkKlllLLLnnnNNNrrrRRRsssSSStttTTTyyYYzzzZZZooaaAA";
  return name
    .split("")
    .map((char) =>
      accents.includes(char) ? replacements[accents.indexOf(char)] : char,
    )
    .join("")
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
