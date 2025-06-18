import { UserMetadata } from "@supabase/supabase-js";

// Types
export type Provider = "google" | "github" | "facebook";

// User-related interfaces
export interface User {
  id: string;
  email?: string | undefined;
  name: string;
  aud?: string;
  created_at?: Date;
  picture?: string;
}

export interface UserAppMetadata {
  provider?: string;
  providers?: string[];
}

export interface UserIdentity {
  id: string;
  user_id: string;
  identity_data?: Record<string, any>;
  provider: string;
  last_sign_in_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role?: string;
  badge?: string;
  phone?: string;
  banner?: string;
  bio?: string;
  created_at: Date;
  raw_user_meta_data: UserMetadata;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
  kwai?: string;
  linkedin?: string;
  instagram?: string;
  website?: string;
  followers?: number;
  following?: number;
}

// Authentication-related interfaces
export interface Factor {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Content-related interfaces
export interface Comment {
    id: string;
    author: User;
    content: string;
    createdAt: string;
}

export interface Post {
    id: string;
    author: User;
    title: string;
    content: string;
    image?: string;
    likes: number;
    comments: Comment[];
    createdAt: Date;
    isLiked: boolean;
}
