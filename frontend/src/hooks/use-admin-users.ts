"use client";

import { useCallback, useEffect, useState } from "react";
import { adminUserService } from "@/services/admin-user.service";
import type { AdminUserDetail, AdminUserFilters, AdminUserSummary } from "@/types/admin-user";

type ListStatus = "loading" | "ready" | "error";

const EMPTY_FILTERS: AdminUserFilters = { q: "", status: "", role: "" };

export const useAdminUsers = () => {
  const [filters, setFilters] = useState<AdminUserFilters>(EMPTY_FILTERS);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<ListStatus>("loading");
  const [error, setError] = useState<unknown>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreFailed, setLoadMoreFailed] = useState(false);

  const load = useCallback(async (nextFilters: AdminUserFilters, cursor?: string) => {
    if (cursor) {
      setIsLoadingMore(true);
      setLoadMoreFailed(false);
    } else {
      setStatus("loading");
      setError(null);
    }

    try {
      const page = await adminUserService.list({ ...nextFilters, cursor });
      setUsers((current) => (cursor ? [...current, ...page.users] : page.users));
      setNextCursor(page.nextCursor);
      setStatus("ready");
    } catch (caught) {
      if (!cursor) {
        setUsers([]);
        setNextCursor(null);
        setError(caught);
        setStatus("error");
      } else {
        setLoadMoreFailed(true);
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(filters);
  }, [filters, load]);

  const applyFilters = useCallback((next: AdminUserFilters) => {
    setFilters(next);
  }, []);

  const loadMore = useCallback(() => {
    if (!nextCursor || isLoadingMore) return;
    void load(filters, nextCursor);
  }, [filters, isLoadingMore, load, nextCursor]);

  const replaceUser = useCallback((user: AdminUserDetail) => {
    setUsers((current) =>
      current.map((item) =>
        item.id === user.id
          ? {
              id: user.id,
              fullName: user.fullName,
              username: user.username,
              email: user.email,
              createdAt: user.createdAt,
              role: user.role,
              status: user.status,
            }
          : item,
      ),
    );
  }, []);

  return {
    filters,
    users,
    nextCursor,
    status,
    error,
    isLoadingMore,
    loadMoreFailed,
    applyFilters,
    loadMore,
    reload: () => load(filters),
    replaceUser,
  };
};
