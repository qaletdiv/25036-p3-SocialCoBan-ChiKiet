"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/lib/error-messages";
import { userService } from "@/services/user.service";
import type { UserSearchResult } from "@/types/user";

export type UserSearchStatus = "idle" | "loading" | "ready" | "error";

export const useUserSearch = (query: string) => {
  const term = query.trim();
  const [status, setStatus] = useState<UserSearchStatus>(term ? "loading" : "idle");
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreFailed, setLoadMoreFailed] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const isFetchingMoreRef = useRef(false);

  const reload = useCallback(async () => {
    if (!term) {
      setUsers([]);
      setNextCursor(null);
      setStatus("idle");
      setActionError(null);
      return;
    }

    setStatus("loading");
    setLoadMoreFailed(false);
    setActionError(null);
    try {
      const page = await userService.search(term);
      setUsers(page.users);
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
      const page = await userService.search(term, nextCursor);
      setUsers((current) => {
        const knownIds = new Set(current.map((user) => user.id));
        return [...current, ...page.users.filter((user) => !knownIds.has(user.id))];
      });
      setNextCursor(page.nextCursor);
    } catch {
      setLoadMoreFailed(true);
    } finally {
      isFetchingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [nextCursor, term]);

  const toggleFollow = useCallback(async (person: UserSearchResult) => {
    if (person.isSelf) return;
    const nextFollowing = !person.following;
    setActionError(null);
    setUsers((current) =>
      current.map((user) => (user.id === person.id ? { ...user, following: nextFollowing } : user)),
    );
    try {
      if (nextFollowing) await userService.follow(person.id);
      else await userService.unfollow(person.id);
    } catch (error) {
      setUsers((current) =>
        current.map((user) => (user.id === person.id ? { ...user, following: person.following } : user)),
      );
      setActionError(getErrorMessage(error));
    }
  }, []);

  return {
    status,
    users,
    hasMore: nextCursor !== null,
    isLoadingMore,
    loadMoreFailed,
    actionError,
    reload,
    loadMore,
    toggleFollow,
  };
};
