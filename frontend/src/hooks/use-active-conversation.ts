"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api-client";
import { conversationService } from "@/services/conversation.service";
import type { Conversation } from "@/types/conversation";

export type ActiveConversationStatus = "idle" | "loading" | "ready" | "notFound" | "error";

interface FetchedState {
  id: string;
  status: "loading" | "ready" | "notFound" | "error";
  conversation: Conversation | null;
}

// Uses the conversation from the list when available, otherwise fetches it (deep links, empty conversations)
export const useActiveConversation = (conversationId: string | null, known: Conversation | undefined) => {
  const [fetched, setFetched] = useState<FetchedState | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const needsFetch = conversationId !== null && !known;

  useEffect(() => {
    if (!conversationId || !needsFetch) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFetched({ id: conversationId, status: "loading", conversation: null });
    conversationService
      .get(conversationId)
      .then((conversation) => {
        if (!cancelled) setFetched({ id: conversationId, status: "ready", conversation });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const isMissing = error instanceof ApiError && (error.status === 404 || error.status === 400);
        setFetched({ id: conversationId, status: isMissing ? "notFound" : "error", conversation: null });
      });

    return () => {
      cancelled = true;
    };
  }, [conversationId, needsFetch, retryKey]);

  const retry = () => setRetryKey((key) => key + 1);

  if (!conversationId) return { status: "idle" as const, conversation: null, retry };
  if (known) return { status: "ready" as const, conversation: known, retry };
  if (fetched?.id === conversationId) return { status: fetched.status, conversation: fetched.conversation, retry };
  return { status: "loading" as const, conversation: null, retry };
};
