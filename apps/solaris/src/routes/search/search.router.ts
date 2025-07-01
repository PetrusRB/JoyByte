import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createClient } from "@/db/server";
import { usernameSlugSchema, UserProfileSchema } from "@/schemas/user";
import { slugToSearchQuery, getCacheKey } from "@/libs/utils";
import { getOrSet, redis } from "@/libs/redis";
import { createRouter } from "@/utils/router.utils";
import { withAuth } from "@/middlewares/withAuth";

const router = createRouter();

const querySchema = z.object({
  user: usernameSlugSchema,
  limit: z.coerce.number().int().min(1).max(50).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

router.get("/user", withAuth, zValidator("query", querySchema), async (c) => {
  const { user, limit, offset } = c.req.valid("query");
  const supabase = await createClient();

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
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .ilike("normalized_name", `%${searchQuery}%`)
        .order("id", { ascending: true })
        .range(offset, offset + limit - 1);

      if (error || !data) {
        console.error("Erro ao buscar IDs:", error);
        return [];
      }

      return data.map((row) => row.id);
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

  // Detalhes dos perfis
  const { data: userDetails, error: detailsError } = await supabase
    .from("profiles")
    .select(
      [
        "id",
        "raw_user_meta_data",
        "created_at",
        "updated_at",
        "banner",
        "email",
        "bio",
        "badge",
        "social_media",
        "genre",
        "followers",
        "following",
        "preferences",
        "normalized_name",
      ].join(","),
    )
    .in("id", userIds)
    .order("raw_user_meta_data->>name", { ascending: true });

  if (detailsError || !userDetails) {
    console.error("Erro ao buscar perfis:", detailsError);
    return c.json(
      {
        success: false,
        message: "Erro ao buscar detalhes dos usuários",
        type: "INTERNAL_ERROR",
      },
      500,
    );
  }

  const safeData = z.array(UserProfileSchema).parse(userDetails);

  // Busca total count separado (cacheado)
  const totalCount = await getOrSet(
    getCacheKey(`searchTotal:${searchQuery}`),
    async () => {
      const { count, error: countError } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .ilike("normalized_name", `%${searchQuery}%`);

      if (countError) {
        console.error("Erro ao contar usuários:", countError);
        return 0;
      }

      return count ?? 0;
    },
    10,
  );

  return c.json({
    success: true,
    type: "SEARCH_SUCCESS",
    users: safeData,
    pagination: {
      total: totalCount,
      offset,
      limit,
      hasMore: totalCount > offset + limit,
    },
  });
});

export default router;
