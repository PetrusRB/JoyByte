import { User } from "../schemas";

// Types
export type ProviderType = "google" | "github" | "facebook" | "twitter";

// User-related interfaces/types
export interface ContactType {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar: string;
  unread?: number;
}
export interface MessageType {
  id: string;
  text: string;
  time: string;
  sent: boolean;
}
export interface CommentType {
  id: string;
  author: User;
  content: string;
  createdAt: Date;
}
