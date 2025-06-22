import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { authed } from "@/orpc";
import { retry } from "@/middlewares/retry";
import { createClient } from "@/db/server";
import { usernameSlugSchema, UserProfileSchema } from "@/schemas/user";
import { slugToSearchQuery } from "@/libs/utils";

/**
 * Buscar usuário/usuários na database
 * @param limit - Limite de pesquisa
 * @returns Post que foi criado na database
 */
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
      user: usernameSlugSchema, // já valida o username
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
  .handler(async ({ input }) => {
    const supabase = await createClient();
    const { user, limit, offset } = input;

    const searchQuery = slugToSearchQuery(user).toLowerCase();

    const {
      data,
      error: dbError,
      count,
    } = await supabase
      .from("profiles")
      .select(
        `
          id,
          raw_user_meta_data,
          created_at,
          banner,
          email,
          bio,
          badge,
          twitter,
          youtube,
          tiktok,
          kwai,
          linkedin,
          instagram,
          website,
          followers,
          following,
          normalized_name
        `,
        { count: "exact" },
      )
      .ilike("raw_user_meta_data->>name", `%${searchQuery}%`)
      .order("raw_user_meta_data->>name", { ascending: true })
      .range(offset, offset + limit - 1);

    if (dbError) {
      console.error("Erro ao buscar usuários:", dbError);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Erro ao buscar usuários",
      });
    }

    return {
      users: data ?? [],
      pagination: {
        total: count ?? 0,
        offset,
        limit,
        hasMore: (count ?? 0) > offset + limit,
      },
    };
  });
