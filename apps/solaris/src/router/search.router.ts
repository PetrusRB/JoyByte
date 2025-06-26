import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { authed } from "@/orpc";
import { retry } from "@/middlewares/retry";
import { createClient } from "@/db/server";
import { usernameSlugSchema, UserProfileSchema } from "@/schemas/user";
import { slugToSearchQuery } from "@/libs/utils";
import { getOrSet, redis } from "@/libs/redis";
import { getCacheKey } from "@/libs/utils";

export const searchUsers = authed
  .use(retry({ times: 3 }))
  .route({
    method: "GET",
    path: "/search/user",
    summary: "Busca usuários pelo nome",
    tags: ["Usuários"],
  })
  .input(
    z.object({
      user: usernameSlugSchema,
      limit: z.number().int().min(1).max(50).default(10),
      offset: z.number().int().min(0).default(0),
    }),
  )
  .output(
    z.object({
      users: z.array(UserProfileSchema),
      pagination: z
        .object({
          total: z.number(),
          offset: z.number(),
          limit: z.number(),
          hasMore: z.boolean(),
        })
        .optional(),
    }),
  )
  .handler(async ({ context, input }) => {
    const supabase = await createClient();
    const { user, limit, offset } = input;
    const searchQuery = slugToSearchQuery(user).toLowerCase();
    const cacheKey = getCacheKey(
      `searchUsers:${searchQuery}:${limit}:${offset}`,
    );
    const popularityKey = getCacheKey(`searchPopularity:${searchQuery}`);

    // Determina TTL dinâmico baseado na popularidade
    const popularity = await redis.incr(popularityKey);
    const ttl = popularity > 100 ? 120 : 60; // 120s para buscas populares, 60s para outras
    await redis.expire(popularityKey, 3600); // Expira contador após 1 hora

    // Cache de IDs dos usuários
    const userIds = await getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .ilike("normalized_name", `%${searchQuery}%`)
          .order("id", { ascending: true })
          .range(offset, offset + limit - 1);

        if (error) {
          console.error("Erro ao buscar IDs de usuários:", error);
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Erro ao buscar IDs de usuários",
          });
        }

        return data.map((row) => row.id);
      },
      ttl,
    );

    // Busca detalhes completos apenas dos IDs encontrados
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

    if (detailsError) {
      console.error("Erro ao buscar detalhes dos usuários:", detailsError);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Erro ao buscar detalhes dos usuários",
      });
    }

    // Valida os dados retornados
    const safeData = z.array(UserProfileSchema).parse(userDetails ?? []);
    if (!safeData.length) {
      throw new ORPCError("NOT_FOUND", {
        message: `Nenhum usuário encontrado para a busca: "${user}"`,
      });
    }

    // Cache do totalCount com TTL menor
    const totalCount = await getOrSet(
      `searchTotal:${searchQuery}`,
      async () => {
        const { count, error: countError } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .ilike("normalized_name", `%${searchQuery}%`);

        if (countError) {
          console.error("Erro ao buscar contagem de usuários:", countError);
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Erro ao buscar contagem de usuários",
          });
        }

        return count ?? 0;
      },
      10,
    );

    return {
      users: safeData,
      pagination: {
        total: totalCount,
        offset,
        limit,
        hasMore: totalCount > offset + limit,
      },
    };
  });
