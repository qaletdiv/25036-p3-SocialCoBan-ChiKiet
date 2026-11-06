"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChatSocket } from "@/lib/chat-socket";
import { conversationService } from "@/services/conversation.service";

// Number of conversations that contain at least one unread message
export const useUnreadConversations = (socket: ChatSocket | null, reconnectCount: number) => {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      setCount(await conversationService.getUnreadCount());
    } catch {
      // Keep the last known value, the next event or reconnect refreshes it
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh, reconnectCount]);

  useEffect(() => {
    if (!socket) return;

    const handleChange = () => void refresh();
    socket.on("message:new", handleChange);
    socket.on("message:recalled", handleChange);
    socket.on("conversation:read", handleChange);
    socket.on("conversation:deleted", handleChange);
    return () => {
      socket.off("message:new", handleChange);
      socket.off("message:recalled", handleChange);
      socket.off("conversation:read", handleChange);
      socket.off("conversation:deleted", handleChange);
    };
  }, [socket, refresh]);

  return { count, refresh };
};
