"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/lib/error-messages";
import type { ChatSocket } from "@/lib/chat-socket";
import { conversationService } from "@/services/conversation.service";
import type { Conversation, Message } from "@/types/conversation";

export type ChatStatus = "loading" | "ready" | "error";

interface ChatOptions {
  conversationId: string;
  currentUserId: string;
  socket: ChatSocket | null;
  reconnectCount: number;
  onSent: (message: Message) => void;
  onRead: (conversationId: string) => void;
}

const appendUnique = (messages: Message[], message: Message): Message[] =>
  messages.some((item) => item.id === message.id) ? messages : [...messages, message];

const replaceMessage = (messages: Message[], updated: Message): Message[] =>
  messages.map((message) => (message.id === updated.id ? updated : message));

// Chat state is scoped to one conversation: remount (key by id) when it changes
export const useChat = ({ conversationId, currentUserId, socket, reconnectCount, onSent, onRead }: ChatOptions) => {
  const [status, setStatus] = useState<ChatStatus>("loading");
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [loadOlderFailed, setLoadOlderFailed] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isRecalling, setIsRecalling] = useState(false);
  const [recallError, setRecallError] = useState<string | null>(null);
  const isFetchingOlderRef = useRef(false);
  const handledReconnectRef = useRef(reconnectCount);

  // Tells the server the incoming messages were read and mirrors that locally to avoid repeat calls
  const acknowledgeIncoming = useCallback(
    (items: Message[]) => {
      if (!items.some((message) => message.senderId !== currentUserId && !message.seenAt)) return;

      const seenAt = new Date().toISOString();
      setMessages((current) =>
        current.map((message) =>
          message.senderId !== currentUserId && !message.seenAt ? { ...message, seenAt } : message,
        ),
      );
      conversationService
        .markSeen(conversationId)
        .then(() => onRead(conversationId))
        .catch(() => undefined);
    },
    [conversationId, currentUserId, onRead],
  );

  const load = useCallback(
    async (silent: boolean) => {
      if (!silent) setStatus("loading");
      try {
        const page = await conversationService.listMessages(conversationId);
        setMessages(page.messages);
        setNextCursor(page.nextCursor);
        setLoadOlderFailed(false);
        setStatus("ready");
        acknowledgeIncoming(page.messages);
      } catch {
        if (!silent) setStatus("error");
      }
    },
    [acknowledgeIncoming, conversationId],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(false);
  }, [load]);

  useEffect(() => {
    if (reconnectCount === handledReconnectRef.current) return;
    handledReconnectRef.current = reconnectCount;
    void load(true);
  }, [load, reconnectCount]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = ({ conversation }: { conversation: Conversation }) => {
      const message = conversation.lastMessage;
      if (!message || message.conversationId !== conversationId) return;

      setMessages((current) => appendUnique(current, message));
      acknowledgeIncoming([message]);
    };
    const handleSeen = (payload: { conversationId: string; seenAt: string }) => {
      if (payload.conversationId !== conversationId) return;
      setMessages((current) =>
        current.map((message) =>
          message.senderId === currentUserId && !message.seenAt ? { ...message, seenAt: payload.seenAt } : message,
        ),
      );
    };
    const handleRecalled = (payload: { conversation: Conversation; messageId: string; recalledAt: string }) => {
      if (payload.conversation.id !== conversationId) return;
      setMessages((current) =>
        current.map((message) =>
          message.id === payload.messageId ? { ...message, content: "", recalledAt: payload.recalledAt } : message,
        ),
      );
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:seen", handleSeen);
    socket.on("message:recalled", handleRecalled);
    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:seen", handleSeen);
      socket.off("message:recalled", handleRecalled);
    };
  }, [acknowledgeIncoming, conversationId, currentUserId, socket]);

  const loadOlder = useCallback(async () => {
    if (!nextCursor || isFetchingOlderRef.current) return;

    isFetchingOlderRef.current = true;
    setIsLoadingOlder(true);
    setLoadOlderFailed(false);
    try {
      const page = await conversationService.listMessages(conversationId, nextCursor);
      setMessages((current) => {
        const knownIds = new Set(current.map((message) => message.id));
        return [...page.messages.filter((message) => !knownIds.has(message.id)), ...current];
      });
      setNextCursor(page.nextCursor);
    } catch {
      setLoadOlderFailed(true);
    } finally {
      isFetchingOlderRef.current = false;
      setIsLoadingOlder(false);
    }
  }, [conversationId, nextCursor]);

  const send = useCallback(
    async (content: string): Promise<boolean> => {
      setIsSending(true);
      setSendError(null);
      try {
        const message = await conversationService.sendMessage(conversationId, content);
        setMessages((current) => appendUnique(current, message));
        onSent(message);
        return true;
      } catch (error) {
        setSendError(getErrorMessage(error));
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, onSent],
  );

  const recall = useCallback(
    async (messageId: string): Promise<boolean> => {
      setIsRecalling(true);
      setRecallError(null);
      try {
        const message = await conversationService.recallMessage(conversationId, messageId);
        setMessages((current) => replaceMessage(current, message));
        return true;
      } catch (error) {
        setRecallError(getErrorMessage(error));
        return false;
      } finally {
        setIsRecalling(false);
      }
    },
    [conversationId],
  );

  return {
    status,
    messages,
    hasOlder: nextCursor !== null,
    isLoadingOlder,
    loadOlderFailed,
    isSending,
    sendError,
    isRecalling,
    recallError,
    clearRecallError: () => setRecallError(null),
    reload: () => load(false),
    loadOlder,
    send,
    recall,
  };
};
