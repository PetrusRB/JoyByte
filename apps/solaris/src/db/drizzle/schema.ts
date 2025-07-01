import {
  integer,
  pgTable,
  varchar,
  timestamp,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";
export const profilesTable = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar({ length: 85 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  raw_user_meta_data: jsonb().notNull(),
  banner: varchar(),
  bio: varchar({ length: 500 }),
  badge: varchar({ length: 255 }),
  followers: integer().default(0),
  posts: jsonb(),
  social_media: jsonb(),
  genre: varchar({ length: 14 }),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
  preferences: jsonb(),
  normalized_name: varchar().notNull(),
  phone: varchar().notNull(),
  role: varchar({ length: 11 }).notNull(),
});
export const postsTable = pgTable("posts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  content: varchar({ length: 500 }).notNull(),
  image: varchar({ length: 500 }),
  created_at: timestamp().notNull().defaultNow(),
  comments: jsonb(),
  author: jsonb(),
  likes_count: integer().default(0),
  author_id: uuid().primaryKey(),
});
export const postsLike = pgTable("posts_like", {
  user_id: uuid("id").primaryKey(),
  post_id: integer().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
});
