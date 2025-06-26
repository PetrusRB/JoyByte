import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { authed } from "@/orpc";
import { retry } from "@/middlewares/retry";
import { createClient } from "@/db/server";
import { PostSchema } from "@/schemas/post";
import { Comment } from "@/types";
import { delByPattern, getOrSet } from "@/libs/redis";
import { getCacheKey } from "@/libs/utils";

// Define cooldown (ms)
const COOLDOWN_MS = 300000; // 5 minutes
const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

// Base interface for common post fields
interface BasePost {
  id: number;
  title: string;
  content: string;
  image: string | null;
  comments: Comment | undefined;
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
    comments: post.comments ?? undefined,
    created_at: new Date(post.created_at),
  };
}

/**
 * Batch Get Post Like Data
 * @param ids - Array of post IDs
 * @returns Like data for multiple posts
 */
export const batchGetPostLikeData = authed
  .route({
    method: "POST",
    path: "/post/batch-like-data",
    summary:
      "Retorna curtidas do usuário + total de likes para múltiplos posts",
    tags: ["Posts"],
  })
  .input(z.object({ ids: z.array(z.number()) }))
  .output(
    z.array(
      z.object({ postId: z.number(), liked: z.boolean(), count: z.number() }),
    ),
  )
  .handler(async ({ input, context }) => {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("batch_get_post_like_data", {
      post_ids_input: input.ids,
      user_id_input: context.user.id,
    });

    if (error || !data) {
      console.error("Erro ao buscar dados de like em lote:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Erro ao buscar dados de curtida em lote",
        cause: error,
      });
    }

    return (Array.isArray(data) ? data : []).map((result: any) => ({
      postId: Number(result.post_id),
      liked: Boolean(result.liked),
      count: Number(result.count ?? 0),
    }));
  });

/**
 * Like Post
 * @param id - ID of the post
 * @returns Liked status and updated count
 */
export const likePost = authed
  .route({
    method: "POST",
    path: "/post/like",
    summary: "Like post",
    tags: ["Posts"],
  })
  .input(z.object({ id: z.number() }))
  .output(z.object({ liked: z.boolean(), count: z.number() }))
  .handler(async ({ input, context }) => {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("toggle_post_like", {
      post_id_input: input.id,
      user_id_input: context.user.id,
    });

    if (error || !data) {
      console.error("Erro ao curtir/descurtir post:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Erro ao curtir/descurtir post",
        cause: error,
      });
    }

    const result = Array.isArray(data) ? data[0] : data;

    return {
      liked: Boolean(result.liked),
      count: Number(result.count ?? 0),
    };
  });

/**
 * Liked Count Post
 * @param id - ID of the post
 * @returns Count number
 */
export const getPostLikeCount = authed
  .route({
    method: "GET",
    path: "/post/like-count",
    summary: "Conta quantos likes um post tem",
    tags: ["Posts"],
  })
  .input(z.object({ id: z.number() }))
  .output(z.object({ count: z.number() }))
  .handler(async ({ input }) => {
    const supabase = await createClient();

    const { count } = await supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", input.id);

    return { count: count ?? 0 };
  });

/**
 * Check if User Liked Post
 * @param postId - ID of the post
 * @param userId - ID of the user
 * @returns Liked Data
 */
export const checkUserLike = authed
  .route({
    method: "GET",
    path: "/post/check-user-like",
    summary: "Verifica se um usuário específico curtiu um post",
    tags: ["Posts"],
  })
  .input(
    z.object({
      postId: z.number(),
      userId: z.string().uuid(),
    }),
  )
  .output(z.object({ liked: z.boolean() }))
  .handler(async ({ input }) => {
    const supabase = await createClient();

    const { data } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("post_id", input.postId)
      .eq("user_id", input.userId)
      .maybeSingle();

    return { liked: !!data };
  });

/**
 * User Liked Post
 * @param id - ID of the post
 * @returns Liked Data
 */
export const isPostLiked = authed
  .route({
    method: "GET",
    path: "/post/is-liked",
    summary: "Verifica se o usuário curtiu um post",
    tags: ["Posts"],
  })
  .input(z.object({ id: z.number() }))
  .output(z.object({ liked: z.boolean() }))
  .handler(async ({ input, context }) => {
    const supabase = await createClient();

    const { data } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("post_id", input.id)
      .eq("user_id", context.user.id)
      .maybeSingle();

    return { liked: !!data };
  });
/**
 * Delete posts
 * @param post_id - ID of the post
 * @returns Success status
 */
export const deletePost = authed
  .use(retry({ times: 3 }))
  .route({
    method: "POST",
    path: "/post/delete",
    summary: "Delete post",
    tags: ["Posts"],
  })
  .input(z.object({ post_id: z.number() }))
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    const supabase = await createClient();

    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("author->>id")
      .eq("id", input.post_id)
      .single();

    if (fetchError || !post) {
      throw new ORPCError("NOT_FOUND", { message: "Post not found" });
    }

    const { data: deleteData, error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", input.post_id)
      .eq("author->>id", context.user.id)
      .select("id");

    if (deleteError) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error deleting post",
        cause: deleteError,
      });
    }

    if (!deleteData?.length) {
      throw new ORPCError("NOT_FOUND", {
        message: "Post not found or unauthorized",
      });
    }

    await delByPattern("posts:*");

    return { success: true };
  });
/**
 * Create posts
 * @returns Created post
 */
export const createPost = authed
  .use(retry({ times: 3 }))
  .route({
    method: "POST",
    path: "/post/create",
    summary: "Create posts",
    tags: ["Posts"],
  })
  .input(
    z.object({
      title: z.string().min(3, "Title too short").max(100),
      content: z.string().min(5, "Content too short"),
      image: z.string().url("Image must be a valid URL").optional(),
    }),
  )
  .output(PostSchema)
  .handler(async ({ input, context }) => {
    const supabase = await createClient();

    const { data: lastPosts, error: fetchError } = await supabase
      .from("posts")
      .select("created_at")
      .eq("author->>id", context.user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error checking cooldown",
      });
    }

    if (lastPosts?.length) {
      const lastTime = new Date(lastPosts[0].created_at).getTime();
      const now = Date.now();
      if (now - lastTime < COOLDOWN_MS) {
        throw new ORPCError("TOO_MANY_REQUESTS", {
          message: `Wait ${Math.ceil((COOLDOWN_MS - (now - lastTime)) / 1000)}s to post again.`,
        });
      }
    }

    const author = {
      id: context.user.id,
      ...context.user.user_metadata,
    };

    const { data: postData, error: insertError } = await supabase
      .from("posts")
      .insert([
        {
          title: input.title,
          content: input.content,
          image: input.image,
          author,
        },
      ])
      .select()
      .single();

    if (insertError || !postData) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error saving to database",
        cause: insertError,
      });
    }

    await delByPattern("posts:*");

    return transformPost(postData as RawPost);
  });

/**
 * Get all posts from the database
 * @param limit - Search limit
 * @param offset - Search offset
 * @returns Posts from the database
 */
export const getPosts = authed
  .use(retry({ times: 3 }))
  .route({
    method: "GET",
    path: "/post/get",
    summary: "Get posts",
    tags: ["Posts"],
  })
  .input(
    z
      .object({
        limit: z.number().int().min(1).max(100).default(DEFAULT_LIMIT),
        offset: z.number().int().min(0).default(DEFAULT_OFFSET),
      })
      .optional(),
  )
  .output(z.array(PostSchema))
  .handler(async ({ input }) => {
    const limit = input?.limit ?? DEFAULT_LIMIT;
    const offset = input?.offset ?? DEFAULT_OFFSET;
    const cacheKey = getCacheKey(`posts:${limit}:${offset}`);

    // Usa cache
    const posts = await getOrSet<TransformedPost[]>(
      cacheKey,
      async () => {
        const supabase = await createClient();

        // 1) Busca posts
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select(
            `
             id,
             title,
             content,
             image,
             created_at,
             comments,
             author
           `,
          )
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (postsError || !postsData) {
          console.error("Erro ao buscar posts:", postsError);
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Erro ao buscar posts",
          });
        }

        // 2) Extrai author IDs únicos
        const authorIds = [...new Set(postsData.map((p) => p.author.id))];

        // 3) Busca normalized_name nos perfis
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, normalized_name")
          .in("id", authorIds);

        if (profilesError) {
          console.error("Erro ao buscar profiles:", profilesError);
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Erro ao buscar perfis de usuários",
          });
        }

        // 4) Mapeia normalized_name por userId
        const profilesMap = Object.fromEntries(
          (profilesData ?? []).map((p) => [p.id, p.normalized_name]),
        );

        // 5) Transforma os posts e injeta normalized_name
        return postsData.map((post) => {
          // Injeta normalized_name na propriedade profiles para o transformPost usar
          return transformPost({
            ...post,
            profiles: {
              normalized_name: profilesMap[post.author.id] ?? "",
            },
          });
        });
      },
      30, // cache TTL em segundos
    );

    return z.array(PostSchema).parse(posts);
  });

/**
 * Get posts by user ID
 * @param user_id - User ID
 * @param limit - Search limit
 * @param offset - Search offset
 * @returns Posts by the user
 */
export const getUserPosts = authed
  .use(retry({ times: 3 }))
  .route({
    method: "GET",
    path: "/post/user",
    summary: "Get User Posts",
    tags: ["Posts"],
  })
  .input(
    z.object({
      user_id: z.string().uuid(),
      limit: z.number().int().min(1).max(100).default(DEFAULT_LIMIT),
      offset: z.number().int().min(0).default(DEFAULT_OFFSET),
    }),
  )
  .output(z.array(PostSchema))
  .handler(async ({ input }) => {
    const supabase = await createClient();

    const { data: posts, error } = await supabase
      .from("posts")
      .select("id, title, content, image, author, created_at, comments")
      .eq("author->>id", input.user_id)
      .order("created_at", { ascending: false })
      .range(input.offset, input.offset + input.limit - 1);

    if (error) {
      console.error("Error fetching user posts:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error fetching user posts",
        cause: error,
      });
    }

    return (posts || []).map(transformPost);
  });
