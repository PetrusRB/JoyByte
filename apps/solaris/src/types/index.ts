export type Provider = "google" | "github" | "facebook";
export interface User {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
}

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