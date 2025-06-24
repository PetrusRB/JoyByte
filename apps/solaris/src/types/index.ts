import { User } from "@/schemas/user";

// Types
export type Provider = "google" | "github" | "facebook";

// User-related interfaces
export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: Date;
}
