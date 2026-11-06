"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ConnectionList } from "@/hooks/use-profile";
import { getErrorMessage } from "@/lib/error-messages";
import { userService } from "@/services/user.service";
import type { UserSearchResult } from "@/types/user";

export type FollowListStatus = "idle" | "loading" | "ready" | "error";

export const useFollowList = (
  userId: string,
  direction: ConnectionList | null,
  refreshKey: number,
  removeOnUnfollow: boolean,
  onChange: (personId: string, following: boolean) => void,
) => {
  const [status, setStatus] = useState<FollowListStatus>(direction ? "loading" : "idle");
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreFailed, setLoadMoreFailed] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const isFetchingMoreRef = useRef(false);

  const reload = useCallback(async () => {
    // Referenced so a follow change creates a new callback and reloads the open list.
    void refreshKey;
    if (!direction) {
      setUsers([]);
      setNextCursor(null);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    setLoadMoreFailed(false);
    setActionError(null);
    try {
      const page =
        direction === "followers"
          ? await userService.listFollowers(userId)
          : await userService.listFollowing(userId);
      setUsers(page.users);
      setNextCursor(page.nextCursor);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [direction, userId, refreshKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  const loadMore = useCallback(async () => {
    if (!direction || !nextCursor || isFetchingMoreRef.current) return;

    isFetchingMoreRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreFailed(false);
    try {
      const page =
        direction === "followers"
          ? await userService.listFollowers(userId, nextCursor)
          : await userService.listFollowing(userId, nextCursor);
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
  }, [direction, nextCursor, userId]);

  const toggleFollow = useCallback(
    async (person: UserSearchResult) => {
      if (!direction || person.isSelf) return;
      const nextFollowing = !person.following;
      setActionError(null);
      setUsers((current) =>
        current.map((user) => (user.id === person.id ? { ...user, following: nextFollowing } : user)),
      );
      try {
        if (nextFollowing) await userService.follow(person.id);
        else await userService.unfollow(person.id);
        if (removeOnUnfollow && !nextFollowing) {
          setUsers((current) => current.filter((user) => user.id !== person.id));
        }
        onChange(person.id, nextFollowing);
      } catch (error) {
        setUsers((current) =>
          current.map((user) => (user.id === person.id ? { ...user, following: person.following } : user)),
        );
        setActionError(getErrorMessage(error));
      }
    },
    [direction, onChange, removeOnUnfollow],
  );

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
