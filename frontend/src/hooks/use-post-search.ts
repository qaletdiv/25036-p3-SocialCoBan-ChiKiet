"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { postService } from "@/services/post.service";
import type { Post } from "@/types/post";

export type PostSearchStatus = "idle" | "loading" | "ready" | "error";

const containsTerm = (content: string, term: string): boolean =>
  content.toLocaleLowerCase().includes(term.toLocaleLowerCase());

export const usePostSearch = (query: string) => {
  const term = query.trim();
  const [status, setStatus] = useState<PostSearchStatus>(term ? "loading" : "idle");
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreFailed, setLoadMoreFailed] = useState(false);
  const isFetchingMoreRef = useRef(false);

  const reload = useCallback(async () => {
    if (!term) {
      setPosts([]);
      setNextCursor(null);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    setLoadMoreFailed(false);
    try {
      const page = await postService.search(term);
      setPosts(page.posts);
      setNextCursor(page.nextCursor);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [term]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  const loadMore = useCallback(async () => {
    if (!term || !nextCursor || isFetchingMoreRef.current) return;

    isFetchingMoreRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreFailed(false);
    try {
      const page = await postService.search(term, nextCursor);
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
  }, [nextCursor, term]);

  const replacePost = useCallback((post: Post) => {
    setPosts((current) => current.map((item) => (item.id === post.id ? post : item)));
  }, []);

  const upsertPost = useCallback(
    (post: Post) => {
      setPosts((current) => {
        if (current.some((item) => item.id === post.id)) {
          return current.map((item) => (item.id === post.id ? post : item));
        }
        if (!containsTerm(post.content, term)) return current;
        return [post, ...current];
      });
    },
    [term],
  );

  const patchPost = useCallback((postId: string, patch: Partial<Post>) => {
    setPosts((current) => current.map((item) => (item.id === postId ? { ...item, ...patch } : item)));
  }, []);

  const removePost = useCallback((postId: string) => {
    setPosts((current) => current.filter((item) => item.id !== postId));
  }, []);

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
  };
};
