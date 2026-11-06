"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { messagesPath } from "@/constants/navigation";
import { getErrorMessage } from "@/lib/error-messages";
import { conversationService } from "@/services/conversation.service";

// Finds or creates the conversation with a user, then navigates to it
export const useOpenConversation = () => {
  const router = useRouter();
  const [openingUserId, setOpeningUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const open = useCallback(
    async (userId: string) => {
      setOpeningUserId(userId);
      setError(null);
      try {
        const conversation = await conversationService.open(userId);
        router.push(messagesPath(conversation.id));
      } catch (caught) {
        setError(getErrorMessage(caught));
      } finally {
        setOpeningUserId(null);
      }
    },
    [router],
  );

  return { openingUserId, error, open };
};
