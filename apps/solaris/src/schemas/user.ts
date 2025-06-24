import { z } from "zod";
import { PostSchema } from "./post";

export type User = z.infer<typeof UserSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;

// username_slug_scheam
export const usernameSlugSchema = z
  .string()
  .regex(/^[a-z0-9]+(\.[a-z0-9]+)*$/, "Slug inválido")
  .max(100);

// Define allowed social media platforms
const allowedPlatforms = [
  "twitter",
  "tiktok",
  "kwai",
  "youtube",
  "linkedin",
  "whatsapp",
  "facebook",
  "website",
] as const;

// Type for allowed platforms
export type SocialMediaPlatform = (typeof allowedPlatforms)[number];

// Create a schema for platform keys
const PlatformKeySchema = z.enum(allowedPlatforms);

// Social media URL validation schema
const SocialMediaUrlSchema = z.union([
  z.string().url("Must be a valid URL"),
  z.literal(""), // Allow empty strings
]);

// Create SocialMediaSchema using z.object with optional fields
export const SocialMediaSchema = z
  .object({
    twitter: SocialMediaUrlSchema.optional(),
    tiktok: SocialMediaUrlSchema.optional(),
    kwai: SocialMediaUrlSchema.optional(),
    youtube: SocialMediaUrlSchema.optional(),
    linkedin: SocialMediaUrlSchema.optional(),
    whatsapp: SocialMediaUrlSchema.optional(),
    facebook: SocialMediaUrlSchema.optional(),
    website: SocialMediaUrlSchema.optional(),
  })
  .default({});

// Social media dynamic
export const SocialMediaSchemaRecord = z
  .record(PlatformKeySchema, SocialMediaUrlSchema)
  .refine(
    (obj) =>
      Object.keys(obj).every((key) =>
        allowedPlatforms.includes(key as SocialMediaPlatform),
      ),
    {
      message: "Social media object contains invalid platform keys",
    },
  )
  .default({});
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  raw_user_meta_data: z.record(z.any()),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  banner: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  bio: z
    .string()
    .max(500, "Passo do limite de caracterias")
    .nullable()
    .optional(),
  badge: z.string().nullable().optional(),
  social_media: SocialMediaSchema,
  picture: z.string().url().nullable().optional(),
  followers: z.number().nullable().optional(),
  following: z.number().nullable().optional(),
  genre: z.string().nullable().optional(),
  normalized_name: z.string().nullable().optional(),
  preferences: z.record(z.any()),
  posts: z.array(PostSchema).optional(),
});
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  aud: z.string().optional(),
  created_at: z.date().optional(),
  genre: z.string().optional(),
  picture: z.string().optional(),
  bio: z.string().nullable().optional(),
  normalized_name: z.string().nullable().optional(),
});
