"use client";

import { useCallback, useState } from "react";
import { getErrorMessage } from "@/lib/error-messages";
import { conversationService } from "@/services/conversation.service";

export const useDeleteConversation = (conversationId: string, onDeleted: (conversationId: string) => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await conversationService.deleteConversation(conversationId);
      onDeleted(conversationId);
    } catch (caught) {
      setError(getErrorMessage(caught));
      setIsDeleting(false);
    }
  }, [conversationId, onDeleted]);

  return { isDeleting, error, remove, clearError: () => setError(null) };
};
