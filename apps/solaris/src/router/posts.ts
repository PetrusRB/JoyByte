import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { authed } from "@/orpc";
import { retry } from "@/middlewares/retry";
import { createClient } from "@/db/server";
import { PostSchema } from "@/schemas/post";
import { Comment } from "@/types";
import { UserMetadata } from "@supabase/supabase-js";

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
}

// Transformed post matching PostSchema
type TransformedPost = z.infer<typeof PostSchema>;

// Helper function to transform posts
function transformPost(post: RawPost): TransformedPost {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    image: post.image || undefined,
    author: {
      id: post.author.id,
      name: post.author.name,
      picture: post.author.picture,
      nickname: post.author.nickname,
      full_name: post.author.full_name,
      avatar_url: post.author.avatar_url,
    } as UserMetadata,
    comments: post.comments || undefined,
    created_at: new Date(post.created_at),
  };
}
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
 * Check if User Liked Post (Alternative route for frontend compatibility)
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
  .input(z.object({ id: z.number() })) // id do post
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
 * Like posts
 * @param id - ID of the post
 * @returns Liked status
 */
export const likePost = authed
  .route({
    method: "POST",
    path: "/post/like",
    summary: "Like post",
    tags: ["Posts"],
  })
  .input(z.object({ id: z.number() })) // id é BIGINT
  .output(z.object({ liked: z.boolean(), count: z.number() }))
  .handler(async ({ input, context }) => {
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("post_id", input.id)
      .eq("user_id", context.user.id)
      .maybeSingle(); // ou single() com try/catch

    if (existing) {
      // Deslike
      const { error: deleteError, count } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", input.id)
        .eq("user_id", context.user.id);

      if (deleteError)
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Erro ao descurtir",
          cause: deleteError,
        });

      return { liked: false, count: count ?? 0 };
    } else {
      // Like
      const { error: insertError, count } = await supabase
        .from("post_likes")
        .insert({
          post_id: input.id,
          user_id: context.user.id,
        });

      if (insertError)
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Erro ao curtir",
          cause: insertError,
        });

      return { liked: true, count: count ?? 0 };
    }
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
  .input(
    z.object({
      post_id: z.number(),
    }),
  )
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    const supabase = await createClient();

    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("author->>id")
      .eq("id", input.post_id)
      .single();

    if (fetchError || !post) {
      throw new ORPCError("NOT_FOUND", {
        message: "Post not found",
      });
    }

    const { data: deleteData, error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", input.post_id)
      .eq("author->>id", context.user.id)
      .select("id");

    if (deleteError) {
      console.error("Error deleting post:", deleteError);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error deleting post",
        cause: deleteError,
      });
    }

    if (!deleteData) {
      throw new ORPCError("NOT_FOUND", {
        message: "Post not found or you don't have permission to delete it",
      });
    }

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
    const { title, content, image } = input;

    const { data: lastPosts, error: fetchError } = await supabase
      .from("posts")
      .select("created_at")
      .eq("author->>id", context.user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("Error checking cooldown:", fetchError);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error checking cooldown",
      });
    }

    if (lastPosts?.length) {
      const lastTime = new Date(lastPosts[0].created_at).getTime();
      const now = Date.now();
      if (now - lastTime < COOLDOWN_MS) {
        throw new ORPCError("TOO_MANY_REQUESTS", {
          message: `Wait ${Math.ceil((COOLDOWN_MS - (now - lastTime)) / 1000)}s before creating another post.`,
        });
      }
    }

    const author = {
      id: context.user.id,
      ...context.user.user_metadata,
    };

    const { data: postData, error: insertError } = await supabase
      .from("posts")
      .insert([{ title, content, image, author }])
      .select()
      .single();

    if (insertError) {
      console.error("Error saving to database:", insertError);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error saving to database",
      });
    }

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
    const { limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET } = input || {};
    const supabase = await createClient();

    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching posts:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error fetching posts",
        cause: error,
      });
    }

    return (posts || []).map(transformPost);
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
