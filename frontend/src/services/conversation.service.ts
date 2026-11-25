import { apiRequest } from "@/lib/api-client";
import type {
  ChatParticipant,
  Conversation,
  ConversationPage,
  Message,
  MessagePage,
  MessageSearchHit,
} from "@/types/conversation";

const withCursor = (path: string, cursor?: string | null): string =>
  cursor ? `${path}?cursor=${encodeURIComponent(cursor)}` : path;

export const conversationService = {
  list(cursor?: string | null): Promise<ConversationPage> {
    return apiRequest<ConversationPage>(withCursor("/conversations", cursor));
  },

  search(query: string): Promise<{ users: ChatParticipant[]; messages: MessageSearchHit[] }> {
    return apiRequest<{ users: ChatParticipant[]; messages: MessageSearchHit[] }>(
      `/conversations/search?q=${encodeURIComponent(query)}`,
    );
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

  listMessages(
    conversationId: string,
    options?: { cursor?: string | null; after?: string | null; focus?: string | null },
  ): Promise<MessagePage> {
    const params = new URLSearchParams();
    if (options?.cursor) params.set("cursor", options.cursor);
    if (options?.after) params.set("after", options.after);
    if (options?.focus) params.set("focus", options.focus);
    const query = params.toString();
    return apiRequest<MessagePage>(`/conversations/${conversationId}/messages${query ? `?${query}` : ""}`);
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
