import { z } from "zod";
import { UserMetadata } from "@supabase/supabase-js";
import { Comment } from "@/types";

// Define PostSchema first since it's referenced by the Post type
export const PostSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  image: z.string().url().optional(),
  author: z.custom<UserMetadata>(),
  created_at: z.date(),
  likes: z.number(),
  comments: z.custom<Comment>().optional(),
});
export type Post = z.infer<typeof PostSchema>;
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
