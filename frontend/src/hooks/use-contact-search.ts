"use client";

import { useEffect, useState } from "react";
import { CONTACT_SEARCH_DEBOUNCE_MS } from "@/constants/message";
import { conversationService } from "@/services/conversation.service";
import type { ChatParticipant, MessageSearchHit } from "@/types/conversation";

export type ContactSearchStatus = "idle" | "loading" | "ready" | "error";

export const useContactSearch = (query: string) => {
  const term = query.trim();
  const [status, setStatus] = useState<ContactSearchStatus>("idle");
  const [users, setUsers] = useState<ChatParticipant[]>([]);
  const [messages, setMessages] = useState<MessageSearchHit[]>([]);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!term) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("idle");
      return;
    }

    setStatus("loading");
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const found = await conversationService.search(term);
        if (cancelled) return;
        setUsers(found.users);
        setMessages(found.messages);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }, CONTACT_SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term, retryKey]);

  return { term, status, users, messages, retry: () => setRetryKey((key) => key + 1) };
};
