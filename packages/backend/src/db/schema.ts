import { randomUUID } from "crypto";
import { InferSelectModel } from "drizzle-orm";
import {
  integer,
  pgTable,
  timestamp,
  text,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
export type Profile = InferSelectModel<typeof profiles>;
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  picture: text("picture"),
  email: text("email").notNull().unique(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
  banner: text("banner").default(
    "https://res.cloudinary.com/djhid5hkm/image/upload/v1751761077/banner_csk0x7.png",
  ),
  bio: text("bio"),
  badge: text("badge"),
  followers: integer().default(0),
  following: integer().default(0),
  social_media: jsonb().default({}),
  genre: text("genre").default("prefernottosay"),
  preferences: jsonb().default({ privacy: { profile_visibility: "public" } }),
  normalized_name: text("normalized_name").notNull(),
  phone: text("phone"),
  role: text("role"),
});
export const posts = pgTable("posts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text().notNull(),
  content: text().notNull(),
  image: text(),
  created_at: timestamp().notNull().defaultNow(),
  comments: jsonb(),
  author: jsonb(),
  author_id: text("author_id").notNull(),
});
export const postsLike = pgTable("posts_like", {
  id: text("id").primaryKey().default(randomUUID()),
  user_id: text("user_id"),
  post_id: integer("post_id").default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
});
export const followers = pgTable("followers", {
  id: text("id").primaryKey().default(randomUUID()),
  user_id: text("user_id").notNull(),
  metadata_follower: jsonb("metadata_follower")
    .$type<Partial<Profile>>()
    .notNull(),
  author_id: text("author_id").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});
export const following = pgTable("following", {
  id: text("id").primaryKey().default(randomUUID()),
  user_id: text("user_id").notNull(),
  metadata_following: jsonb("metadata_following")
    .$type<Partial<Profile>>()
    .notNull(),
  author_id: text("author_id").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});
export const schema = {
  user,
  session,
  followers,
  postsLike,
  posts,
  account,
  verification,
};
