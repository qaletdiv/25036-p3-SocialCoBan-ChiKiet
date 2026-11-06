export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  seenAt: string | null;
  recalledAt: string | null;
}

export interface ChatParticipant {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface Conversation {
  id: string;
  participant: ChatParticipant;
  lastMessage: Message | null;
  unreadCount: number;
}

export interface ConversationPage {
  conversations: Conversation[];
  nextCursor: string | null;
}

export interface MessagePage {
  messages: Message[];
  nextCursor: string | null;
}

export interface TypingPayload {
  conversationId: string;
  isTyping: boolean;
}
