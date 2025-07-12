import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { usernameSlugSchema } from "@/schemas/user";
import { slugToSearchQuery, getCacheKey } from "@/libs/utils";
import { getOrSet, redis } from "@/libs/redis";
import { createRouter } from "@/utils/router.utils";
import { db } from "@/db/drizzle";
import { profiles } from "@/db/drizzle/schema";
import { ilike, asc, count, sql } from "drizzle-orm";

const router = createRouter();

// Esquemas otimizados e reutilizados
const BaseQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

const UserQuerySchema = BaseQuerySchema.extend({
  user: usernameSlugSchema,
});

const RandQuerySchema = BaseQuerySchema.extend({
  limit: z.coerce.number().int().min(1).max(5).default(3),
});

// Funções auxiliares para reutilização
const getUserProfileFields = {
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
};

// Endpoint otimizado para usuários aleatórios
router.get("/random", zValidator("query", RandQuerySchema), async (c) => {
  const { limit, offset } = c.req.valid("query");
  const cacheKey = getCacheKey(`searchRandom:${limit}:${offset}`);

  try {
    const userDetails = await getOrSet(
      cacheKey,
      async () => {
        const result = await db
          .select(getUserProfileFields)
          .from(profiles)
          .orderBy(sql`random()`)
          .limit(limit)
          .offset(offset);

        return result;
      },
      60, // TTL fixo para dados aleatórios
    );

    if (!userDetails.length) {
      return c.json(
        {
          success: false,
          message: "Nenhum usuário encontrado",
          type: "NOT_FOUND",
          users: [],
        },
        404,
      );
    }

    // Validação direta sem parse redundante
    return c.json({
      success: true,
      type: "SEARCH_SUCCESS_RANDOM",
      users: userDetails,
    });
  } catch (error) {
    console.error("Erro em /random:", error);
    return c.json(
      {
        success: false,
        type: "INTERNAL_SERVER_ERROR",
        error: "Falha ao buscar usuários aleatórios",
      },
      500,
    );
  }
});

// Endpoint principal para busca usuários
router.get("/user", zValidator("query", UserQuerySchema), async (c) => {
  const { user, limit, offset } = c.req.valid("query");
  const searchQuery = slugToSearchQuery(user).toLowerCase();

  // Chaves de cache
  const cacheKey = getCacheKey(`searchUsers:${searchQuery}:${limit}:${offset}`);
  const countKey = getCacheKey(`searchTotal:${searchQuery}`);
  const popularityKey = getCacheKey(`searchPopularity:${searchQuery}`);

  try {
    // Controle de popularidade com pipeline
    await redis
      .pipeline()
      .incr(popularityKey)
      .expire(popularityKey, 3600)
      .exec();

    // Busca dados em cache ou no banco
    const [userDetails, totalCount] = await Promise.all([
      getOrSet(
        cacheKey,
        async () => {
          const result = await db
            .select(getUserProfileFields)
            .from(profiles)
            .where(ilike(profiles.normalized_name, `%${searchQuery}%`))
            .orderBy(asc(profiles.name))
            .limit(limit)
            .offset(offset);

          return result;
        },
        60,
      ), // TTL fixo simplificado

      getOrSet(
        countKey,
        async () => {
          const result = await db
            .select({ count: count() })
            .from(profiles)
            .where(ilike(profiles.normalized_name, `%${searchQuery}%`));

          return result[0]?.count ?? 0;
        },
        300,
      ), // Cache mais longo para contagem
    ]);

    if (!userDetails.length) {
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

    return c.json({
      success: true,
      type: "SEARCH_SUCCESS",
      users: userDetails,
      pagination: {
        total: totalCount,
        offset,
        limit,
        hasMore: totalCount > offset + limit,
      },
    });
  } catch (error) {
    console.error("Erro em /user:", error);
    return c.json(
      {
        success: false,
        type: "INTERNAL_ERROR",
        error: "Erro ao processar a requisição",
      },
      500,
    );
  }
});

export default router;
