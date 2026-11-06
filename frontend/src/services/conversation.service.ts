import { apiRequest } from "@/lib/api-client";
import type { ChatParticipant, Conversation, ConversationPage, Message, MessagePage } from "@/types/conversation";

const withCursor = (path: string, cursor?: string | null): string =>
  cursor ? `${path}?cursor=${encodeURIComponent(cursor)}` : path;

export const conversationService = {
  list(cursor?: string | null): Promise<ConversationPage> {
    return apiRequest<ConversationPage>(withCursor("/conversations", cursor));
  },

  async search(query: string): Promise<ChatParticipant[]> {
    const data = await apiRequest<{ users: ChatParticipant[] }>(`/conversations/search?q=${encodeURIComponent(query)}`);
    return data.users;
  },

  async open(userId: string): Promise<Conversation> {
    const data = await apiRequest<{ conversation: Conversation }>("/conversations", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
    return data.conversation;
  },

  async get(conversationId: string): Promise<Conversation> {
    const data = await apiRequest<{ conversation: Conversation }>(`/conversations/${conversationId}`);
    return data.conversation;
  },

  listMessages(conversationId: string, cursor?: string | null): Promise<MessagePage> {
    return apiRequest<MessagePage>(withCursor(`/conversations/${conversationId}/messages`, cursor));
  },

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    const data = await apiRequest<{ message: Message }>(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
    return data.message;
  },

  async getUnreadCount(): Promise<number> {
    const data = await apiRequest<{ count: number }>("/conversations/unread-count");
    return data.count;
  },

  async recallMessage(conversationId: string, messageId: string): Promise<Message> {
    const data = await apiRequest<{ message: Message }>(
      `/conversations/${conversationId}/messages/${messageId}/recall`,
      { method: "POST" },
    );
    return data.message;
  },

  async deleteConversation(conversationId: string): Promise<void> {
    await apiRequest<{ deleted: true }>(`/conversations/${conversationId}`, { method: "DELETE" });
  },

  async markSeen(conversationId: string): Promise<void> {
    await apiRequest<{ seen: true }>(`/conversations/${conversationId}/seen`, { method: "PUT" });
  },
};
