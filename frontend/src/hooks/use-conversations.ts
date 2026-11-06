"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatSocket } from "@/lib/chat-socket";
import { conversationService } from "@/services/conversation.service";
import type { Conversation } from "@/types/conversation";

export type ConversationsStatus = "loading" | "ready" | "error";

export const useConversations = (socket: ChatSocket | null, reconnectCount: number) => {
  const [status, setStatus] = useState<ConversationsStatus>("loading");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreFailed, setLoadMoreFailed] = useState(false);
  const isFetchingMoreRef = useRef(false);
  const handledReconnectRef = useRef(reconnectCount);

  const load = useCallback(async (silent: boolean) => {
    if (!silent) setStatus("loading");
    try {
      const page = await conversationService.list();
      setConversations(page.conversations);
      setNextCursor(page.nextCursor);
      setLoadMoreFailed(false);
      setStatus("ready");
    } catch {
      if (!silent) setStatus("error");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(false);
  }, [load]);

  useEffect(() => {
    if (reconnectCount === handledReconnectRef.current) return;
    handledReconnectRef.current = reconnectCount;
    void load(true);
  }, [load, reconnectCount]);

  // Moves the conversation to the top, adding it when it was hidden or not loaded yet
  const upsertConversation = useCallback((conversation: Conversation) => {
    setConversations((current) => [conversation, ...current.filter((item) => item.id !== conversation.id)]);
  }, []);

  // Keeps the position, used when only the content of a conversation changed
  const replaceConversation = useCallback((conversation: Conversation) => {
    setConversations((current) => current.map((item) => (item.id === conversation.id ? conversation : item)));
  }, []);

  const markRead = useCallback((conversationId: string) => {
    setConversations((current) =>
      current.map((item) => (item.id === conversationId ? { ...item, unreadCount: 0 } : item)),
    );
  }, []);

  const removeConversation = useCallback((conversationId: string) => {
    setConversations((current) => current.filter((item) => item.id !== conversationId));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = ({ conversation }: { conversation: Conversation }) => upsertConversation(conversation);
    const handleRecalled = ({ conversation }: { conversation: Conversation }) => replaceConversation(conversation);
    const handleRead = ({ conversationId }: { conversationId: string }) => markRead(conversationId);
    const handleDeleted = ({ conversationId }: { conversationId: string }) => removeConversation(conversationId);

    socket.on("message:new", handleNewMessage);
    socket.on("message:recalled", handleRecalled);
    socket.on("conversation:read", handleRead);
    socket.on("conversation:deleted", handleDeleted);
    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:recalled", handleRecalled);
      socket.off("conversation:read", handleRead);
      socket.off("conversation:deleted", handleDeleted);
    };
  }, [markRead, removeConversation, replaceConversation, socket, upsertConversation]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || isFetchingMoreRef.current) return;

    isFetchingMoreRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreFailed(false);
    try {
      const page = await conversationService.list(nextCursor);
      setConversations((current) => {
        const knownIds = new Set(current.map((item) => item.id));
        return [...current, ...page.conversations.filter((item) => !knownIds.has(item.id))];
      });
      setNextCursor(page.nextCursor);
    } catch {
      setLoadMoreFailed(true);
    } finally {
      isFetchingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [nextCursor]);

  return {
    status,
    conversations,
    hasMore: nextCursor !== null,
    isLoadingMore,
    loadMoreFailed,
    reload: () => load(false),
    loadMore,
    upsertConversation,
    markRead,
    removeConversation,
  };
};

export type ConversationsState = ReturnType<typeof useConversations>;
