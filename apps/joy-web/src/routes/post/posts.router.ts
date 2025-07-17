import { z } from "zod";
import { PostSchema, Comment } from "@/schemas";
import { delByPattern, getOrSet } from "@/libs/redis";
import { getCacheKey, slugToSearchQuery } from "@/libs/utils";
import { createRouter } from "@/utils/router.utils";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { db } from "@/db/drizzle";
import { postsLike, posts, profiles } from "@/db/drizzle/schema";
import { and, count, desc, eq, inArray, sql, gt } from "drizzle-orm";
import { genCharacters } from "@/utils/crypto";

const router = createRouter();

// Define cooldown (ms)
const COOLDOWN_MS = 300000; // 5 minutes
const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

// Like Types for typescript.
export type LikeData = {
  postId: number;
  liked: boolean;
  count: number;
};

// Base interface for common post fields
interface BasePost {
  id: number;
  title: string;
  content: string;
  image: string | null;
  comments: Comment[];
  created_at: string;
}

// Raw post from Supabase
interface RawPost extends BasePost {
  author: {
    id: string;
    name: string;
    picture: string;
    nickname: string;
    full_name: string;
    avatar_url: string;
  };
  profiles?: {
    normalized_name: string;
  };
}

// Transformed post matching PostSchema
type TransformedPost = z.infer<typeof PostSchema>;

// Helper function to transform posts
function transformPost(post: RawPost): TransformedPost {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    image: post.image ?? undefined,
    author: {
      id: post.author.id,
      name: post.author.name,
      picture: post.author.picture ?? "",
      normalized_name: post.profiles?.normalized_name ?? "",
    },
    comments: post.comments ?? [],
    created_at: new Date(post.created_at),
  };
}

/**
 * Batch Get Post Like Data
 * @param ids - Array of post IDs
 * @returns Like data for multiple posts
 */
router.post(
  "/batch-like-data",
  zValidator(
    "json",
    z.object({
      ids: z.array(z.number()),
    }),
  ),
  async (c) => {
    const input = c.req.valid("json");
    const user = c.get("user");

    try {
      // Buscar contagem de likes para cada post
      const likeCounts = await db
        .select({
          post_id: postsLike.post_id,
          count: count(),
        })
        .from(postsLike)
        .where(inArray(postsLike.post_id, input.ids))
        .groupBy(postsLike.post_id);

      // Buscar quais posts o usuário curtiu
      const userLikes = await db
        .select({
          post_id: postsLike.post_id,
        })
        .from(postsLike)
        .where(
          and(
            inArray(postsLike.post_id, input.ids),
            eq(postsLike.user_id, user.id),
          ),
        );

      const likedPostIds = new Set(userLikes.map((like) => like.post_id));
      const countsMap = new Map(
        likeCounts.map((item) => [item.post_id, item.count]),
      );

      // Construir resposta
      const result = input.ids.map((postId) => ({
        postId,
        liked: likedPostIds.has(postId),
        count: countsMap.get(postId) || 0,
      }));

      return c.json(result);
    } catch (error) {
      console.error("Erro ao buscar dados de like em lote:", error);
      return c.json(
        {
          message: "Erro ao buscar dados de curtida em lote",
          cause: error,
        },
        500,
      );
    }
  },
);

/**
 * Like Post
 * @param id - ID of the post
 * @returns Liked status and updated count
 */
router.post(
  "/like",
  zValidator(
    "json",
    z.object({
      id: z.number(),
    }),
  ),
  async (c) => {
    const input = c.req.valid("json");
    const user = c.get("user");

    try {
      // Verificar se o usuário já curtiu o post
      const existingLike = await db
        .select()
        .from(postsLike)
        .where(
          and(eq(postsLike.post_id, input.id), eq(postsLike.user_id, user.id)),
        )
        .limit(1);

      let liked: boolean;

      if (existingLike.length > 0) {
        // Remover like (descurtir)
        await db
          .delete(postsLike)
          .where(
            and(
              eq(postsLike.post_id, input.id),
              eq(postsLike.user_id, user.id),
            ),
          );
        liked = false;
      } else {
        // Adicionar like (curtir)
        await db.insert(postsLike).values({
          id: genCharacters(36),
          post_id: input.id,
          user_id: user.id,
        });
        liked = true;
      }

      // Buscar contagem atualizada
      const [countResult] = await db
        .select({
          count: count(),
        })
        .from(postsLike)
        .where(eq(postsLike.post_id, input.id));

      return c.json({
        liked,
        count: countResult?.count || 0,
      });
    } catch (error) {
      console.error("Erro ao curtir/descurtir post:", error);
      return c.json(
        {
          message: "Erro ao curtir/descurtir post",
          cause: error,
        },
        500,
      );
    }
  },
);

/**
 * Liked Count Post
 * @param id - ID of the post
 * @returns Count number
 */
router.get(
  "/like-count",

  zValidator(
    "json",
    z.object({
      id: z.number(),
    }),
  ),
  async (c) => {
    const input = c.req.valid("json");
    const [result] = await db
      .select({
        count: sql`COUNT(*)`.mapWith(Number),
      })
      .from(postsLike)
      .where(eq(postsLike.post_id, input.id));

    return c.json({ count: result?.count ?? 0 });
  },
);

/**
 * Check if User Liked Post
 * @param postId - ID of the post
 * @param userId - ID of the user
 * @returns Liked Data
 */
router.get(
  "/check-user-liked",

  zValidator(
    "json",
    z.object({
      postId: z.number(),
      userId: z.string(),
    }),
  ),
  async (c) => {
    const input = c.req.valid("json");
    const data = await db
      .select()
      .from(postsLike)
      .where(
        and(
          eq(postsLike.post_id, input.postId),
          eq(sql`(author->> 'id')`, input.userId),
        ),
      );

    return c.json({ liked: !!data });
  },
);

/**
 * User Liked Post
 * @param id - ID of the post
 * @returns Liked Data
 */
router.get(
  "/is-liked",

  zValidator(
    "json",
    z.object({
      id: z.number(),
    }),
  ),
  async (c) => {
    const user = c.get("user");
    const input = c.req.valid("json");

    const data = await db
      .select()
      .from(postsLike)
      .where(
        and(
          eq(postsLike.post_id, input.id),
          eq(sql`(author->> 'id')`, user.id),
        ),
      );

    return c.json({ liked: !!data });
  },
);
/**
 * Delete posts
 * @param post_id - ID of the post
 * @returns Success status
 */
router.post(
  "/delete",
  zValidator("json", z.object({ post_id: z.number() })),
  async (c) => {
    const { post_id } = c.req.valid("json");
    const user = c.get("user");

    // Deleta apenas se o post pertencer ao usuário autenticado
    const deleted = await db
      .delete(posts)
      .where(and(eq(posts.id, post_id), eq(sql`(author->> 'id')`, user.id)))
      .returning({ id: posts.id });

    // Se nenhum registro foi deletado, não existe ou não é dono
    if (deleted.length === 0) {
      throw new HTTPException(404, {
        message: "Post not found or unauthorized",
      });
    }

    await delByPattern("posts:*");
    return c.json({ success: true });
  },
);
/**
 * Create posts
 * @returns Created post
 */
router.post(
  "/create",
  zValidator(
    "json",
    z.object({
      title: z.string(),
      content: z.string(),
      image: z.string().optional(),
    }),
  ),
  async (c) => {
    const user = c.get("user");
    const { title, content, image } = c.req.valid("json");

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (!profile) {
      return c.json(
        {
          message:
            "Perfil do usuário não encontrado. Não foi possível criar o post.",
        },
        404,
      );
    }

    // Cooldown
    const [last] = await db
      .select({ created_at: posts.created_at })
      .from(posts)
      .where(eq(sql`(author->> 'id')`, user.id))
      .orderBy(desc(posts.created_at))
      .limit(1);

    if (last) {
      const delta = Date.now() - new Date(last.created_at).getTime();
      if (delta < COOLDOWN_MS) {
        return c.json(
          {
            message: `Espere ${Math.ceil((COOLDOWN_MS - delta) / 1000)}s para postar novamente.`,
          },
          429,
        );
      }
    }

    const author = {
      id: profile.id,
      name: profile.name ?? "Misterioso(a)",
      picture: profile.picture ?? "/user.png",
      normalized_name: slugToSearchQuery(profile.name || ""),
    };

    const [inserted] = await db
      .insert(posts)
      .values({
        title,
        content,
        image: image ?? null,
        author,
        author_id: user.id,
        comments: [],
      })
      .returning();

    const fullPost: RawPost = {
      id: inserted.id,
      title: inserted.title,
      content: inserted.content,
      image: inserted.image,
      created_at: inserted.created_at.toISOString(),
      comments: (inserted.comments as Comment[]) || [],
      author: inserted.author as any,
      profiles: {
        normalized_name: slugToSearchQuery(profile.name || ""),
      },
    };

    await delByPattern("posts:*");
    return c.json(transformPost(fullPost));
  },
);

/**
 * Get all posts from the database
 * @param limit - Search limit
 * @param offset - Search offset
 * @returns Posts from the database
 */
router.get(
  "/get",
  zValidator(
    "query",
    z.object({
      cursor: z.coerce.number().int().min(1).default(5).optional(),
      limit: z.coerce.number().int().min(1).max(100).default(DEFAULT_LIMIT),
      offset: z.coerce.number().int().min(0).default(DEFAULT_OFFSET),
    }),
  ),
  async (c) => {
    const { limit, offset, cursor } = c.req.valid("query");
    const cacheKey = getCacheKey(`posts:${limit}:${offset}`);

    try {
      // Usa cache
      const allPosts = await getOrSet<TransformedPost[]>(
        cacheKey,
        async () => {
          // 1) Buscar posts
          const rawPosts = await db
            .select()
            .from(posts)
            .orderBy(posts.created_at)
            .where(cursor ? gt(posts.id, cursor) : undefined)
            .limit(limit)
            .offset(offset);

          if (rawPosts.length === 0) return [];

          // 2) Extrair IDs de autores
          const authorIds = Array.from(
            new Set(rawPosts.map((p) => (p.author as any).id).filter(Boolean)),
          );

          // 3) Obter normalized_name dos perfis
          const profs = await db
            .select({
              id: profiles.id,
              normalized_name: profiles.normalized_name,
            })
            .from(profiles)
            .where(inArray(profiles.id, authorIds));

          const normMap = Object.fromEntries(
            profs.map((p) => [p.id, p.normalized_name]),
          );

          // 4) Transformar posts
          return rawPosts.map((rp) => {
            const full: RawPost = {
              id: rp.id,
              title: rp.title,
              content: rp.content,
              image: rp.image,
              created_at: rp.created_at.toISOString(),
              comments: (rp.comments as any[]) || [],
              author: rp.author as any,
              profiles: {
                normalized_name: normMap[(rp.author as any).id] ?? "",
              },
            };
            return transformPost(full);
          });
        },
        30,
      );

      return c.json(allPosts);
    } catch (err) {
      console.error("Erro geral ao buscar posts:", err);
      return c.json({ message: "Erro ao buscar posts" }, 500);
    }
  },
);

/**
 * Get posts by user ID
 * @param user_id - User ID
 * @param limit - Search limit
 * @param offset - Search offset
 * @returns Posts by the user
 */
router.post(
  "/user",
  zValidator(
    "json",
    z.object({
      user_id: z.string(),
      limit: z.coerce.number().int().min(1).max(100).default(DEFAULT_LIMIT),
      offset: z.coerce.number().int().min(0).default(DEFAULT_OFFSET),
    }),
  ),
  async (c) => {
    const { user_id, limit, offset } = c.req.valid("json");
    const rawPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        image: posts.image,
        created_at: posts.created_at,
        author: posts.author,
        comments: posts.comments,
      })
      .from(posts)
      .where(eq(sql`(author->> 'id')`, user_id))
      .orderBy(desc(posts.created_at))
      .limit(limit)
      .offset(offset);

    return c.json(
      rawPosts.map((rp) => {
        const full: RawPost = {
          id: rp.id,
          title: rp.title,
          content: rp.content,
          image: rp.image,
          created_at: rp.created_at.toISOString(),
          comments: rp.comments as any[],
          author: rp.author as any,
        };
        return transformPost(full);
      }),
    );
  },
);
export default router;
