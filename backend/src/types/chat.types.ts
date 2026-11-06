export interface MessageView {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  seenAt: Date | null;
  recalledAt: Date | null;
}

export interface ConversationParticipant {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface ConversationView {
  id: string;
  participant: ConversationParticipant;
  lastMessage: MessageView | null;
  unreadCount: number;
}

export interface ConversationPage {
  conversations: ConversationView[];
  nextCursor: string | null;
}

export interface MessagePage {
  messages: MessageView[];
  nextCursor: string | null;
}

export interface ChatContact {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface TypingPayload {
  conversationId: string;
  isTyping: boolean;
}

export interface ServerToClientEvents {
  "message:new": (payload: { conversation: ConversationView }) => void;
  "message:seen": (payload: { conversationId: string; seenAt: Date }) => void;
  "message:recalled": (payload: { conversation: ConversationView; messageId: string; recalledAt: Date }) => void;
  "conversation:read": (payload: { conversationId: string }) => void;
  "conversation:deleted": (payload: { conversationId: string }) => void;
  typing: (payload: TypingPayload) => void;
}

export interface ClientToServerEvents {
  typing: (payload: TypingPayload) => void;
}

export interface SocketData {
  userId: string;
  lastTypingAt: number;
}
