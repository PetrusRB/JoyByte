import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { usernameSlugSchema, UserProfileSchema } from "@/schemas/user";
import { slugToSearchQuery, getCacheKey } from "@/libs/utils";
import { getOrSet, redis } from "@/libs/redis";
import { createRouter } from "@/utils/router.utils";
import { db } from "@/db/drizzle";
import { profiles } from "@/db/drizzle/schema";
import { ilike, asc, count, inArray, sql } from "drizzle-orm";

const router = createRouter();

const querySchema = z.object({
  user: usernameSlugSchema,
  limit: z.coerce.number().int().min(1).max(50).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

const randSchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limite tem quer ser maior que 1 abaixo de 5")
    .max(5, "Limite tem que ser menor que 5")
    .default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

// Pegar usuários aleatorios no banco de dados.
router.get("/random", zValidator("query", randSchema), async (c) => {
  const { limit, offset } = c.req.valid("query");
  // Caches
  const cacheKey = getCacheKey(`searchRandom:${limit}:${offset}`);

  // Busca IDs cacheados
  const userIds = await getOrSet(
    cacheKey,
    async () => {
      const result = await db
        .select({ id: profiles.id })
        .from(profiles)
        .orderBy(sql`random()`)
        .limit(limit)
        .offset(offset);

      return result.map((row) => row.id);
    },
    60,
  );
  if (!userIds.length) {
    return c.json(
      {
        success: false,
        message: `Nenhum usuário encontrado no banco de dados`,
        type: "NOT_FOUND",
        users: [],
      },
      404,
    );
  }
  try {
    const usersDetails = await db
      .select({
        id: profiles.id,
        name: profiles.name,
        picture: profiles.picture,
        preferences: profiles.preferences,
        normalized_name: profiles.normalized_name,
      })
      .from(profiles)
      .where(inArray(profiles.id, userIds))
      .orderBy(asc(profiles.name));

    const safeData = z.array(UserProfileSchema).parse(usersDetails);
    return c.json(
      {
        success: true,
        type: "SEARCH_SUCCESS_RANDOM",
        users: safeData,
      },
      200,
    );
  } catch (error) {
    return c.json(
      {
        success: false,
        type: "INTERNAL_SERVER_ERROR",
        error: `Falha ao tentar buscar usuários aleatórios: ${error} `,
      },
      500,
    );
  }
});

// Pegar o perfil de usuário
router.get("/user", zValidator("query", querySchema), async (c) => {
  const { user, limit, offset } = c.req.valid("query");

  // Caches
  const searchQuery = slugToSearchQuery(user).toLowerCase();
  const cacheKey = getCacheKey(`searchUsers:${searchQuery}:${limit}:${offset}`);
  const popularityKey = getCacheKey(`searchPopularity:${searchQuery}`);

  // TTL baseado em popularidade
  const popularity = await redis.incr(popularityKey);
  const ttl = popularity > 100 ? 120 : 60;
  await redis.expire(popularityKey, 3600);

  // Busca IDs cacheados
  const userIds = await getOrSet(
    cacheKey,
    async () => {
      try {
        const result = await db
          .select({ id: profiles.id })
          .from(profiles)
          .where(ilike(profiles.normalized_name, `%${searchQuery}%`))
          .orderBy(asc(profiles.id))
          .limit(limit)
          .offset(offset);

        return result.map((row) => row.id);
      } catch (error) {
        console.error("Erro ao buscar IDs:", error);
        return [];
      }
    },
    ttl,
  );

  if (!userIds.length) {
    return c.json(
      {
        success: false,
        message: `Nenhum usuário encontrado para "${user}"`,
        type: "NOT_FOUND",
        users: [],
      },
      404,
    );
  }

  // Detalhes dos perfis usando Drizzle
  try {
    const userDetails = await db
      .select({
        id: profiles.id,
        name: profiles.name,
        picture: profiles.picture,
        created_at: profiles.created_at,
        updated_at: profiles.updated_at,
        banner: profiles.banner,
        email: profiles.email,
        bio: profiles.bio,
        badge: profiles.badge,
        social_media: profiles.social_media,
        genre: profiles.genre,
        followers: profiles.followers,
        following: profiles.following,
        preferences: profiles.preferences,
        normalized_name: profiles.normalized_name,
      })
      .from(profiles)
      .where(inArray(profiles.id, userIds))
      .orderBy(asc(profiles.name));

    const safeData = z.array(UserProfileSchema).parse(userDetails);

    // Busca total count separado (cacheado)
    const totalCount = await getOrSet(
      getCacheKey(`searchTotal:${searchQuery}`),
      async () => {
        try {
          const result = await db
            .select({ count: count() })
            .from(profiles)
            .where(ilike(profiles.normalized_name, `%${searchQuery}%`));

          return result[0]?.count ?? 0;
        } catch (error) {
          console.error("Erro ao contar usuários:", error);
          return 0;
        }
      },
      10,
    );

    return c.json(
      {
        success: true,
        type: "SEARCH_SUCCESS",
        users: safeData,
        pagination: {
          total: totalCount,
          offset,
          limit,
          hasMore: totalCount > offset + limit,
        },
      },
      200,
    );
  } catch (error) {
    console.error("Erro ao buscar perfis:", error);
    return c.json(
      {
        success: false,
        message: "Erro ao buscar detalhes dos usuários",
        type: "INTERNAL_ERROR",
      },
      500,
    );
  }
});

export default router;
