import { z } from "zod";

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

export const UserProfileSchema = z.object({
  id: z.string(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
  banner: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  picture: z.string().url().nullable().optional(),
  email: z.string().email().nullable().optional(),
  bio: z
    .string()
    .max(500, "Passo do limite de caracterias")
    .nullable()
    .optional(),
  badge: z.string().nullable().optional(),
  social_media: SocialMediaSchema,
  followers: z.number().nullable().optional(),
  following: z.number().nullable().optional(),
  genre: z.string().nullable().optional(),
  normalized_name: z.string().nullable().optional(),
  preferences: z.record(z.any()),
});
export const UserSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  created_at: z.date().optional(),
  genre: z.string().optional(),
  picture: z.string().optional(),
  bio: z.string().nullable().optional(),
  normalized_name: z.string().nullable().optional(),
});
