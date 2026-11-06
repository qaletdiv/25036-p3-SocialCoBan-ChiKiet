import { MESSAGE_RECALL_WINDOW_MS } from "@/constants/message";
import type { Message } from "@/types/conversation";

export const isMessageRecallable = (message: Message, currentUserId: string, now: number = Date.now()): boolean =>
  message.senderId === currentUserId &&
  message.recalledAt === null &&
  now - new Date(message.createdAt).getTime() <= MESSAGE_RECALL_WINDOW_MS;
