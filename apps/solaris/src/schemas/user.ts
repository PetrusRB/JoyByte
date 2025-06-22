import { z } from "zod";
import { PostSchema } from "./post";

export type User = z.infer<typeof UserSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;

// username_slug_scheam
export const usernameSlugSchema = z
  .string()
  .regex(/^[a-z0-9]+(\.[a-z0-9]+)*$/, "Slug inválido")
  .max(100);

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  raw_user_meta_data: z.record(z.any()),
  created_at: z.string(),
  banner: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  bio: z.string().nullable().optional(),
  badge: z.string().nullable().optional(),
  twitter: z.string().nullable().optional(),
  youtube: z.string().nullable().optional(),
  tiktok: z.string().nullable().optional(),
  kwai: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  followers: z.number().nullable().optional(),
  following: z.number().nullable().optional(),
  normalized_name: z.string().nullable().optional(),
  posts: z.array(PostSchema).optional(),
});
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  aud: z.string().optional(),
  created_at: z.date().optional(),
  picture: z.string().optional(),
});
