import { User } from "@/schemas";

// Types
export type Provider = "google" | "github" | "facebook" | "twitter";

// User-related interfaces/types

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: Date;
}
