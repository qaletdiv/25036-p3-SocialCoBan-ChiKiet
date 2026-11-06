"use client";

import { useCallback, useState } from "react";
import { commentService } from "@/services/comment.service";
import type { Comment } from "@/types/comment";

export type ListStatus = "idle" | "loading" | "ready" | "error";

interface ReplyState {
  status: ListStatus;
  comments: Comment[];
  nextCursor: string | null;
  isLoadingMore: boolean;
  loadMoreFailed: boolean;
}

const EMPTY_REPLIES: ReplyState = {
  status: "idle",
  comments: [],
  nextCursor: null,
  isLoadingMore: false,
  loadMoreFailed: false,
};

const upsertComment = (items: Comment[], comment: Comment): Comment[] => {
  const without = items.filter((item) => item.id !== comment.id);
  return [comment, ...without];
};

const appendUnique = (items: Comment[], incoming: Comment[]): Comment[] => {
  const knownIds = new Set(items.map((item) => item.id));
  return [...items, ...incoming.filter((item) => !knownIds.has(item.id))];
};

export const usePostComments = (postId: string, onCommentCountChange: (count: number) => void) => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<ListStatus>("idle");
  const [comments, setComments] = useState<Comment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreFailed, setLoadMoreFailed] = useState(false);
  const [replies, setReplies] = useState<Record<string, ReplyState>>({});
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  const updateReplies = (parentId: string, updater: (current: ReplyState) => ReplyState) => {
    setReplies((current) => ({ ...current, [parentId]: updater(current[parentId] ?? EMPTY_REPLIES) }));
  };

  const load = useCallback(async () => {
    setStatus("loading");
    setLoadMoreFailed(false);
    try {
      const page = await commentService.list(postId);
      setComments(page.comments);
      setNextCursor(page.nextCursor);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [postId]);

  const open = useCallback(() => {
    setIsOpen(true);
    if (status === "idle" || status === "error") void load();
  }, [load, status]);

  const toggle = useCallback(() => {
    if (isOpen) {
      setIsOpen(false);
      setReplyingToId(null);
      return;
    }
    open();
  }, [isOpen, open]);

  const loadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    setLoadMoreFailed(false);
    try {
      const page = await commentService.list(postId, nextCursor);
      setComments((current) => appendUnique(current, page.comments));
      setNextCursor(page.nextCursor);
    } catch {
      setLoadMoreFailed(true);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const addComment = async (content: string) => {
    const result = await commentService.create(postId, content);
    setComments((current) => upsertComment(current, result.comment));
    onCommentCountChange(result.commentCount);
  };

  const replaceComment = (comment: Comment) => {
    setComments((current) => current.map((item) => (item.id === comment.id ? comment : item)));
  };

  const removeComment = (commentId: string, commentCount?: number) => {
    setComments((current) => current.filter((item) => item.id !== commentId));
    setReplies((current) => {
      const next = { ...current };
      delete next[commentId];
      return next;
    });
    if (replyingToId === commentId) setReplyingToId(null);
    if (commentCount !== undefined) onCommentCountChange(commentCount);
  };

  const loadReplies = async (parentId: string, cursor?: string | null) => {
    updateReplies(parentId, (current) => ({
      ...current,
      status: cursor ? current.status : "loading",
      isLoadingMore: Boolean(cursor),
      loadMoreFailed: false,
    }));

    try {
      const page = await commentService.listReplies(parentId, cursor);
      updateReplies(parentId, (current) => ({
        status: "ready",
        comments: cursor ? appendUnique(current.comments, page.comments) : page.comments,
        nextCursor: page.nextCursor,
        isLoadingMore: false,
        loadMoreFailed: false,
      }));
    } catch {
      updateReplies(parentId, (current) => ({
        ...current,
        status: cursor ? current.status : "error",
        isLoadingMore: false,
        loadMoreFailed: Boolean(cursor),
      }));
    }
  };

  const addReply = async (parentId: string, content: string) => {
    const result = await commentService.create(postId, content, parentId);
    updateReplies(parentId, (current) => ({
      ...current,
      status: "ready",
      comments: [...current.comments.filter((item) => item.id !== result.comment.id), result.comment],
    }));
    setComments((current) =>
      current.map((item) => (item.id === parentId ? { ...item, replyCount: item.replyCount + 1 } : item)),
    );
    onCommentCountChange(result.commentCount);
  };

  const replaceReply = (parentId: string, comment: Comment) => {
    updateReplies(parentId, (current) => ({
      ...current,
      comments: current.comments.map((item) => (item.id === comment.id ? comment : item)),
    }));
  };

  const removeReply = (parentId: string, commentId: string, commentCount?: number) => {
    updateReplies(parentId, (current) => ({
      ...current,
      comments: current.comments.filter((item) => item.id !== commentId),
    }));
    setComments((current) =>
      current.map((item) =>
        item.id === parentId ? { ...item, replyCount: Math.max(0, item.replyCount - 1) } : item,
      ),
    );
    if (commentCount !== undefined) onCommentCountChange(commentCount);
  };

  return {
    isOpen,
    status,
    comments,
    hasMore: nextCursor !== null,
    isLoadingMore,
    loadMoreFailed,
    replies,
    replyingToId,
    toggle,
    reload: load,
    loadMore,
    addComment,
    replaceComment,
    removeComment,
    setReplyingToId,
    loadReplies,
    addReply,
    replaceReply,
    removeReply,
  };
};
