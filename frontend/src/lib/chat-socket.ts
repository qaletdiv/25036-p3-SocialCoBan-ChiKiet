import { io, type Socket } from "socket.io-client";
import type { Conversation, TypingPayload } from "@/types/conversation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface ChatServerEvents {
  "message:new": (payload: { conversation: Conversation }) => void;
  "message:seen": (payload: { conversationId: string; seenAt: string }) => void;
  "message:recalled": (payload: { conversation: Conversation; messageId: string; recalledAt: string }) => void;
  "conversation:read": (payload: { conversationId: string }) => void;
  "conversation:deleted": (payload: { conversationId: string }) => void;
  typing: (payload: TypingPayload) => void;
}

interface ChatClientEvents {
  typing: (payload: TypingPayload) => void;
}

export type ChatSocket = Socket<ChatServerEvents, ChatClientEvents>;

export const createChatSocket = (): ChatSocket =>
  io(new URL(API_URL).origin, { withCredentials: true, transports: ["websocket"] });
