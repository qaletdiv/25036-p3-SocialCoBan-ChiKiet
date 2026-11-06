"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/error-messages";

interface EditableItemOptions<TUpdated, TRemoved> {
  content: string;
  maxLength: number;
  update: (content: string) => Promise<TUpdated>;
  remove: () => Promise<TRemoved>;
  allowEmpty?: boolean;
  onUpdated: (result: TUpdated) => void;
  onDeleted: (result: TRemoved) => void;
  onGone: () => void;
}

export const useEditableItem = <TUpdated, TRemoved>({
  content,
  maxLength,
  update,
  remove,
  allowEmpty = false,
  onUpdated,
  onDeleted,
  onGone,
}: EditableItemOptions<TUpdated, TRemoved>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const trimmedDraft = draft.trim();
  const draftLength = trimmedDraft.length;
  const isDraftTooLong = draftLength > maxLength;
  const canSave = (allowEmpty || draftLength > 0) && !isDraftTooLong && trimmedDraft !== content && !isSaving;

  const startEdit = () => {
    setDraft(content);
    setSaveError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const updateDraft = (value: string) => {
    setDraft(value);
    setSaveError(null);
  };

  const save = async () => {
    if (!canSave) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      onUpdated(await update(trimmedDraft));
      setIsEditing(false);
    } catch (error) {
      setSaveError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const setDeleteDialogOpen = (open: boolean) => {
    if (isDeleting) return;
    setDeleteError(null);
    setIsDeleteDialogOpen(open);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      onDeleted(await remove());
    } catch (error) {
      // An item that is already gone should simply disappear from the list
      if (error instanceof ApiError && error.status === 404) {
        onGone();
        return;
      }
      setDeleteError(getErrorMessage(error));
      setIsDeleting(false);
    }
  };

  return {
    isEditing,
    draft,
    draftLength,
    isDraftTooLong,
    canSave,
    isSaving,
    saveError,
    startEdit,
    cancelEdit,
    setDraft: updateDraft,
    save,
    isDeleteDialogOpen,
    isDeleting,
    deleteError,
    setDeleteDialogOpen,
    confirmDelete,
  };
};
