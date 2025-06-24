import { z } from "zod";
import { UserMetadata } from "@supabase/supabase-js";
import { Comment } from "@/types";
import { User } from "./user";

// Define PostSchema first since it's referenced by the Post type
export interface CustomUserMetadata extends UserMetadata {
  normalized_name?: string;
}
export const PostSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  image: z.string().url().optional(),
  author: z.custom<CustomUserMetadata>(),
  created_at: z.date(),
  comments: z.custom<Comment>().optional(),
});
export const PostWithCountSchema = PostSchema.extend({
  likeCount: z.number().default(0),
  user: z.custom<User>().nullable(),
  initialLikeCount: z.number().default(0).optional(),
});

// Export types for TypeScript
export type Post = z.infer<typeof PostSchema>;
export type PostWithCount = z.infer<typeof PostWithCountSchema>;
export type Page = { posts: PostWithCount[]; nextPage: number | null };

export const createPostSchema = z.object({
  title: z.string().min(3, "Título muito curto").max(100),
  content: z.string().min(5, "Conteúdo muito curto"),
  image: z.string().url("Imagem precisa ser uma URL válida").optional(),
});

export const deletePostSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: "ID deve ser um número" })
    .int()
    .positive({ message: "ID inválido" }),
});

export type CreatePostSchema = z.infer<typeof createPostSchema>;
export type DeletePostSchema = z.infer<typeof deletePostSchema>;
