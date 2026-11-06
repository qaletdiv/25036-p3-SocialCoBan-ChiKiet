"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/error-messages";
import { userService } from "@/services/user.service";
import type { UserProfile } from "@/types/user";

export type ProfileStatus = "loading" | "ready" | "notFound" | "error";
export type ConnectionList = "followers" | "following";

const isValidUserId = (userId: string): boolean => /^\d{1,20}$/.test(userId);

export const useProfile = (userId: string) => {
  const [status, setStatus] = useState<ProfileStatus>(isValidUserId(userId) ? "loading" : "notFound");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

  const reload = useCallback(async () => {
    if (!isValidUserId(userId)) {
      setProfile(null);
      setStatus("notFound");
      return;
    }

    setStatus("loading");
    setActionError(null);
    try {
      setProfile(await userService.getProfile(userId));
      setStatus("ready");
    } catch (error) {
      setProfile(null);
      const notFound = error instanceof ApiError && error.status === 404;
      setStatus(notFound ? "notFound" : "error");
    }
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  const toggleFollow = useCallback(async () => {
    if (!profile || profile.isSelf || isUpdatingFollow) return;
    const nextFollowing = !profile.following;
    const previous = profile;
    setActionError(null);
    setIsUpdatingFollow(true);
    setProfile({
      ...profile,
      following: nextFollowing,
      followerCount: Math.max(0, profile.followerCount + (nextFollowing ? 1 : -1)),
    });
    try {
      if (nextFollowing) await userService.follow(profile.id);
      else await userService.unfollow(profile.id);
    } catch (error) {
      setProfile(previous);
      setActionError(getErrorMessage(error));
    } finally {
      setIsUpdatingFollow(false);
    }
  }, [isUpdatingFollow, profile]);

  const applyConnectionChange = useCallback((personId: string, following: boolean) => {
    setProfile((current) => {
      if (!current) return current;
      if (personId === current.id) {
        return {
          ...current,
          following,
          followerCount: Math.max(0, current.followerCount + (following ? 1 : -1)),
        };
      }
      if (!current.isSelf) return current;
      return {
        ...current,
        followingCount: Math.max(0, current.followingCount + (following ? 1 : -1)),
      };
    });
  }, []);

  const replaceProfile = useCallback((next: UserProfile) => {
    setProfile(next);
    setActionError(null);
  }, []);

  return {
    status,
    profile,
    actionError,
    isUpdatingFollow,
    reload,
    toggleFollow,
    applyConnectionChange,
    replaceProfile,
  };
};
