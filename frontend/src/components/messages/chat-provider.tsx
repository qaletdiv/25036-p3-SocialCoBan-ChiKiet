"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useUnreadConversations } from "@/hooks/use-unread-conversations";
import type { ChatSocket } from "@/lib/chat-socket";

interface ChatRealtime {
  socket: ChatSocket | null;
  reconnectCount: number;
  unreadConversationCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const ChatRealtimeContext = createContext<ChatRealtime | null>(null);

// Mount only for signed-in users: it opens the realtime connection and tracks unread conversations
export function ChatProvider({ children }: { children: ReactNode }) {
  const { socket, reconnectCount } = useChatSocket();
  const unread = useUnreadConversations(socket, reconnectCount);

  const value = useMemo<ChatRealtime>(
    () => ({
      socket,
      reconnectCount,
      unreadConversationCount: unread.count,
      refreshUnreadCount: unread.refresh,
    }),
    [socket, reconnectCount, unread.count, unread.refresh],
  );

  return <ChatRealtimeContext.Provider value={value}>{children}</ChatRealtimeContext.Provider>;
}

export const useChatRealtime = (): ChatRealtime => {
  const context = useContext(ChatRealtimeContext);
  if (!context) throw new Error("useChatRealtime must be used inside ChatProvider");
  return context;
};
