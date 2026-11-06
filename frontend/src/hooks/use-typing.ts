"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TYPING_EXPIRE_MS, TYPING_IDLE_TIMEOUT_MS, TYPING_SEND_INTERVAL_MS } from "@/constants/message";
import type { ChatSocket } from "@/lib/chat-socket";
import type { Conversation, TypingPayload } from "@/types/conversation";

interface TypingOptions {
  socket: ChatSocket | null;
  conversationId: string;
  participantId: string;
}

// Scoped to one conversation like useChat: remount (key by id) when it changes
export const useTyping = ({ socket, conversationId, participantId }: TypingOptions) => {
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const lastSentAtRef = useRef(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!socket) return;

    let expireTimer: ReturnType<typeof setTimeout> | null = null;
    const clearExpire = () => {
      if (expireTimer) clearTimeout(expireTimer);
      expireTimer = null;
    };

    const handleTyping = (payload: TypingPayload) => {
      if (payload.conversationId !== conversationId) return;
      clearExpire();
      setIsPeerTyping(payload.isTyping);
      // The stop event can be lost, so the indicator expires on its own
      if (payload.isTyping) expireTimer = setTimeout(() => setIsPeerTyping(false), TYPING_EXPIRE_MS);
    };
    const handleNewMessage = ({ conversation }: { conversation: Conversation }) => {
      if (conversation.id !== conversationId || conversation.lastMessage?.senderId !== participantId) return;
      clearExpire();
      setIsPeerTyping(false);
    };

    socket.on("typing", handleTyping);
    socket.on("message:new", handleNewMessage);
    return () => {
      clearExpire();
      socket.off("typing", handleTyping);
      socket.off("message:new", handleNewMessage);
    };
  }, [conversationId, participantId, socket]);

  const stopTyping = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = null;
    if (lastSentAtRef.current === 0) return;

    lastSentAtRef.current = 0;
    socket?.volatile.emit("typing", { conversationId, isTyping: false });
  }, [conversationId, socket]);

  // Throttled: announces typing at most every few seconds and stops after a short pause
  const reportTyping = useCallback(
    (hasText: boolean) => {
      if (!socket) return;
      if (!hasText) {
        stopTyping();
        return;
      }

      const now = Date.now();
      if (now - lastSentAtRef.current >= TYPING_SEND_INTERVAL_MS) {
        lastSentAtRef.current = now;
        socket.volatile.emit("typing", { conversationId, isTyping: true });
      }
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(stopTyping, TYPING_IDLE_TIMEOUT_MS);
    },
    [conversationId, socket, stopTyping],
  );

  useEffect(() => stopTyping, [stopTyping]);

  return { isPeerTyping, reportTyping };
};
