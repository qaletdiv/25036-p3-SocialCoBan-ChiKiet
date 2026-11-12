import type { PostPrivacy } from "@/constants/privacy";

export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export interface ReactionSummary {
  total: number;
  counts: Record<ReactionType, number>;
  myReaction: ReactionType | null;
}

export interface PostAuthor {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface SharedOriginal {
  id: string;
  content: string;
  privacy: PostPrivacy;
  createdAt: string;
  editedAt: string | null;
  author: PostAuthor;
}

export type SharedPostState = "available" | "removed" | "unavailable";

export interface SharedPost {
  state: SharedPostState;
  original: SharedOriginal | null;
}

export interface Post {
  id: string;
  content: string;
  privacy: PostPrivacy;
  createdAt: string;
  editedAt: string | null;
  author: PostAuthor;
  sharedPost: SharedPost | null;
  removed: boolean;
  reactions: ReactionSummary;
  commentCount: number;
}

export interface FeedPage {
  posts: Post[];
  nextCursor: string | null;
}
