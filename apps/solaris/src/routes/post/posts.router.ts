import { z } from "zod";
import { createClient } from "@/db/server";
import { PostSchema, Comment } from "@/schemas/post";
import { delByPattern, getOrSet } from "@/libs/redis";
import { getCacheKey, slugToSearchQuery } from "@/libs/utils";
import { createRouter } from "@/utils/router.utils";
import { zValidator } from "@hono/zod-validator";
import { withAuth } from "@/middlewares/withAuth";
import { HTTPException } from "hono/http-exception";
import { db } from "@/db/drizzle";
import { postsLike, postsTable, profilesTable } from "@/db/drizzle/schema";
import { and, desc, eq, inArray, sql } from "drizzle-orm";

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
      nickname: post.author.nickname ?? "",
      full_name: post.author.full_name ?? "",
      avatar_url: post.author.avatar_url ?? "",
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
  withAuth,
  zValidator(
    "json",
    z.object({
      ids: z.array(z.number()),
    }),
  ),
  async (c) => {
    const input = c.req.valid("json");
    const user = c.get("user");
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("batch_get_post_like_data", {
      post_ids_input: input.ids,
      user_id_input: user.id,
    });

    if (error || !data) {
      console.error("Erro ao buscar dados de like em lote:", error);
      return c.json(
        {
          message: "Erro ao buscar dados de curtida em lote",
          cause: error,
        },
        500,
      );
    }

    return c.json(
      (Array.isArray(data) ? data : []).map((result: any) => ({
        postId: Number(result.post_id),
        liked: Boolean(result.liked),
        count: Number(result.count ?? 0),
      })),
    );
  },
);

/**
 * Like Post
 * @param id - ID of the post
 * @returns Liked status and updated count
 */
router.post(
  "/like",
  withAuth,
  zValidator(
    "json",
    z.object({
      id: z.number(),
    }),
  ),
  async (c) => {
    const input = c.req.valid("json");
    const user = c.get("user");
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("toggle_post_like", {
      post_id_input: input.id,
      user_id_input: user.id,
    });

    if (error || !data) {
      console.error("Erro ao curtir/descurtir post:", error);
      return c.json(
        {
          message: "Erro ao curtir/descurtir post",
          cause: error,
        },
        500,
      );
    }

    const result = Array.isArray(data) ? data[0] : data;

    return c.json({
      liked: Boolean(result.liked),
      count: Number(result.count ?? 0),
    });
  },
);

/**
 * Liked Count Post
 * @param id - ID of the post
 * @returns Count number
 */
router.get(
  "/like-count",
  withAuth,
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
  withAuth,
  zValidator(
    "json",
    z.object({
      postId: z.number(),
      userId: z.string().uuid(),
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
  withAuth,
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
  withAuth,
  zValidator("json", z.object({ post_id: z.number() })),
  async (c) => {
    const { post_id } = c.req.valid("json");
    const user = c.get("user");

    // Deleta apenas se o post pertencer ao usuário autenticado
    const deleted = await db
      .delete(postsTable)
      .where(
        and(eq(postsTable.id, post_id), eq(sql`(author->> 'id')`, user.id)),
      );

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
  withAuth,
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

    // Cooldown
    const [last] = await db
      .select({ created_at: postsTable.created_at })
      .from(postsTable)
      .where(eq(sql`(author->> 'id')`, user.id))
      .orderBy(desc(postsTable.created_at))
      .limit(1);

    if (last) {
      const delta = Date.now() - new Date(last.created_at).getTime();
      if (delta < COOLDOWN_MS) {
        throw new HTTPException(429, {
          message: `Espere ${Math.ceil((COOLDOWN_MS - delta) / 1000)}s para postar novamente.`,
        });
      }
    }

    const author = {
      id: user.id,
      name: user.user_metadata.name,
      picture: user.user_metadata.picture,
      nickname: user.user_metadata.nickname,
      full_name: user.user_metadata.full_name,
      avatar_url: user.user_metadata.avatar_url,
      normalized_name: slugToSearchQuery(user.user_metadata.name || ""),
    };

    const [inserted] = await db
      .insert(postsTable)
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
        normalized_name: slugToSearchQuery(user.user_metadata.name || ""),
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
  withAuth,
  zValidator(
    "query",
    z.object({
      limit: z.coerce.number().int().min(1).max(100).default(DEFAULT_LIMIT),
      offset: z.coerce.number().int().min(0).default(DEFAULT_OFFSET),
    }),
  ),
  async (c) => {
    const { limit, offset } = c.req.valid("query");
    const cacheKey = getCacheKey(`posts:${limit}:${offset}`);

    try {
      // Usa cache
      const posts = await getOrSet<TransformedPost[]>(
        cacheKey,
        async () => {
          // 1) Buscar posts
          const rawPosts = await db
            .select({
              id: postsTable.id,
              title: postsTable.title,
              content: postsTable.content,
              image: postsTable.image,
              created_at: postsTable.created_at,
              author: postsTable.author,
              comments: postsTable.comments,
              author_id: postsTable.author_id,
            })
            .from(postsTable)
            .orderBy(postsTable.created_at)
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
              id: profilesTable.id,
              normalized_name: profilesTable.normalized_name,
            })
            .from(profilesTable)
            .where(inArray(profilesTable.id, authorIds));

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

      return c.json(posts);
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
  withAuth,
  zValidator(
    "json",
    z.object({
      user_id: z.string().uuid(),
      limit: z.coerce.number().int().min(1).max(100).default(DEFAULT_LIMIT),
      offset: z.coerce.number().int().min(0).default(DEFAULT_OFFSET),
    }),
  ),
  async (c) => {
    const { user_id, limit, offset } = c.req.valid("json");
    const rawPosts = await db
      .select({
        id: postsTable.id,
        title: postsTable.title,
        content: postsTable.content,
        image: postsTable.image,
        created_at: postsTable.created_at,
        author: postsTable.author,
        comments: postsTable.comments,
      })
      .from(postsTable)
      .where(eq(sql`(author->> 'id')`, user_id))
      .orderBy(desc(postsTable.created_at))
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
