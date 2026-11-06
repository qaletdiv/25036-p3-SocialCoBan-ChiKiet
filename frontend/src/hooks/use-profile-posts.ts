"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ProfilePostKind } from "@/constants/profile";
import { postService } from "@/services/post.service";
import type { Post } from "@/types/post";

export type ProfilePostsStatus = "loading" | "ready" | "error";

const belongsOnTab = (post: Post, userId: string, kind: ProfilePostKind): boolean => {
  if (post.author.id !== userId) return false;
  return kind === "authored" ? post.sharedPost === null : post.sharedPost !== null;
};

export const useProfilePosts = (userId: string, kind: ProfilePostKind, enabled: boolean) => {
  const [status, setStatus] = useState<ProfilePostsStatus>(enabled ? "loading" : "ready");
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreFailed, setLoadMoreFailed] = useState(false);
  const isFetchingMoreRef = useRef(false);

  const reload = useCallback(async () => {
    if (!enabled) {
      setPosts([]);
      setNextCursor(null);
      setStatus("ready");
      return;
    }

    setStatus("loading");
    setLoadMoreFailed(false);
    try {
      const page = await postService.getByUser(userId, kind);
      setPosts(page.posts);
      setNextCursor(page.nextCursor);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [enabled, kind, userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  const loadMore = useCallback(async () => {
    if (!enabled || !nextCursor || isFetchingMoreRef.current) return;

    isFetchingMoreRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreFailed(false);
    try {
      const page = await postService.getByUser(userId, kind, nextCursor);
      setPosts((current) => {
        const knownIds = new Set(current.map((post) => post.id));
        return [...current, ...page.posts.filter((post) => !knownIds.has(post.id))];
      });
      setNextCursor(page.nextCursor);
    } catch {
      setLoadMoreFailed(true);
    } finally {
      isFetchingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [enabled, kind, nextCursor, userId]);

  const replacePost = useCallback((post: Post) => {
    setPosts((current) => current.map((item) => (item.id === post.id ? post : item)));
  }, []);

  const upsertPost = useCallback(
    (post: Post) => {
      setPosts((current) => {
        if (!belongsOnTab(post, userId, kind)) return current.filter((item) => item.id !== post.id);
        if (current.some((item) => item.id === post.id)) {
          return current.map((item) => (item.id === post.id ? post : item));
        }
        return [post, ...current];
      });
    },
    [kind, userId],
  );

  const patchPost = useCallback((postId: string, patch: Partial<Post>) => {
    setPosts((current) => current.map((item) => (item.id === postId ? { ...item, ...patch } : item)));
  }, []);

  const removePost = useCallback((postId: string) => {
    setPosts((current) => current.filter((item) => item.id !== postId));
  }, []);

  const patchAuthorName = useCallback(
    (fullName: string) => {
      setPosts((current) =>
        current.map((post) =>
          post.author.id === userId ? { ...post, author: { ...post.author, fullName } } : post,
        ),
      );
    },
    [userId],
  );

  return {
    status,
    posts,
    hasMore: nextCursor !== null,
    isLoadingMore,
    loadMoreFailed,
    reload,
    loadMore,
    replacePost,
    upsertPost,
    patchPost,
    removePost,
    patchAuthorName,
  };
};
