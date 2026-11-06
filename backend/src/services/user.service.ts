import { QueryFailedError } from "typeorm";
import { SEARCH_PAGE_SIZE } from "@/constants/search.constants";
import { USERNAME_CHANGE_COOLDOWN_MS } from "@/constants/username.constants";
import { followRepository, type FollowCursor } from "@/repositories/follow.repository";
import { userRepository } from "@/repositories/user.repository";
import type { User } from "@/entities/user.entity";
import { AppError } from "@/utils/app-error";

export interface UserSearchResult {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
  isSelf: boolean;
  following: boolean;
}

export interface UserSearchPage {
  users: UserSearchResult[];
  nextCursor: string | null;
}

const requireFollowableUser = async (viewerId: string, targetId: string) => {
  if (viewerId === targetId) throw AppError.cannotFollowSelf();
  return requireVisibleUser(targetId);
};

const requireVisibleUser = async (userId: string): Promise<User> => {
  const user = await userRepository.findById(userId);
  if (!user?.emailVerifiedAt) throw AppError.notFound("User not found");
  return user;
};

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  usernameChangedAt: Date | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  followerCount: number;
  followingCount: number;
  isSelf: boolean;
  following: boolean;
}

export type ConnectionDirection = "followers" | "following";

const toProfile = async (viewerId: string, user: User): Promise<UserProfile> => {
  const [followerCount, followingCount, following] = await Promise.all([
    followRepository.countFollowers(user.id),
    followRepository.countFollowing(user.id),
    viewerId === user.id ? Promise.resolve(false) : followRepository.isFollowing(viewerId, user.id),
  ]);

  return {
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    usernameChangedAt: user.usernameChangedAt,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    followerCount,
    followingCount,
    isSelf: viewerId === user.id,
    following,
  };
};

const listConnections = async (
  viewerId: string,
  profileId: string,
  direction: ConnectionDirection,
  cursorId?: string,
): Promise<UserSearchPage> => {
  await requireVisibleUser(profileId);

  let cursor: FollowCursor | undefined;
  if (cursorId) {
    const createdAt =
      direction === "followers"
        ? await followRepository.findFollowTime(cursorId, profileId)
        : await followRepository.findFollowTime(profileId, cursorId);
    if (!createdAt) throw AppError.notFound("List cursor is invalid");
    cursor = { createdAt, id: cursorId };
  }

  const rows = await (direction === "followers"
    ? followRepository.listFollowers(profileId, SEARCH_PAGE_SIZE + 1, cursor)
    : followRepository.listFollowing(profileId, SEARCH_PAGE_SIZE + 1, cursor));
  const hasMore = rows.length > SEARCH_PAGE_SIZE;
  const page = hasMore ? rows.slice(0, SEARCH_PAGE_SIZE) : rows;
  const followedIds = new Set(await followRepository.findFollowedIds(viewerId, page.map((user) => user.id)));
  const last = page[page.length - 1];

  return {
    users: page.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      isSelf: user.id === viewerId,
      following: followedIds.has(user.id),
    })),
    nextCursor: hasMore && last ? last.id : null,
  };
};

export const userService = {
  async searchUsers(viewerId: string, term: string, cursorId?: string): Promise<UserSearchPage> {
    let cursor: { fullName: string; id: string } | undefined;
    if (cursorId) {
      const cursorUser = await userRepository.findById(cursorId);
      if (!cursorUser?.emailVerifiedAt) throw AppError.notFound("Search cursor is invalid");
      cursor = { fullName: cursorUser.fullName, id: cursorUser.id };
    }

    const rows = await userRepository.searchVerifiedByName(term, SEARCH_PAGE_SIZE + 1, cursor);
    const hasMore = rows.length > SEARCH_PAGE_SIZE;
    const page = hasMore ? rows.slice(0, SEARCH_PAGE_SIZE) : rows;
    const followedIds = new Set(await followRepository.findFollowedIds(viewerId, page.map((user) => user.id)));
    const last = page[page.length - 1];

    return {
      users: page.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        avatarUrl: user.avatarUrl,
        isSelf: user.id === viewerId,
        following: followedIds.has(user.id),
      })),
      nextCursor: hasMore && last ? last.id : null,
    };
  },

  async followUser(viewerId: string, targetId: string): Promise<{ following: true }> {
    await requireFollowableUser(viewerId, targetId);
    await followRepository.follow(viewerId, targetId);
    return { following: true };
  },

  async unfollowUser(viewerId: string, targetId: string): Promise<{ following: false }> {
    if (viewerId === targetId) throw AppError.cannotFollowSelf();
    await followRepository.unfollow(viewerId, targetId);
    return { following: false };
  },

  async getProfile(viewerId: string, profileId: string): Promise<UserProfile> {
    return toProfile(viewerId, await requireVisibleUser(profileId));
  },

  async assertVisible(profileId: string): Promise<void> {
    await requireVisibleUser(profileId);
  },

  async updateProfile(
    viewerId: string,
    profileId: string,
    input: { fullName: string; bio: string | null; username: string },
  ): Promise<UserProfile> {
    if (viewerId !== profileId) throw AppError.forbidden("You can only update your own profile");
    const user = await requireVisibleUser(profileId);
    const usernameChanged = input.username !== user.username;

    if (usernameChanged) {
      const changedAt = user.usernameChangedAt?.getTime() ?? 0;
      if (changedAt > 0 && Date.now() - changedAt < USERNAME_CHANGE_COOLDOWN_MS) {
        throw AppError.usernameChangeTooSoon();
      }
      const taken = await userRepository.findByUsername(input.username);
      if (taken && taken.id !== user.id) throw AppError.usernameAlreadyExists();
    }

    try {
      await userRepository.updateProfile(profileId, {
        fullName: input.fullName,
        bio: input.bio,
        ...(usernameChanged ? { username: input.username, usernameChangedAt: new Date() } : {}),
      });
    } catch (error) {
      const driver = error instanceof QueryFailedError ? (error.driverError as { code?: string; sqlMessage?: string }) : null;
      if (driver?.code === "ER_DUP_ENTRY" && driver.sqlMessage?.includes("username")) {
        throw AppError.usernameAlreadyExists();
      }
      throw error;
    }

    return this.getProfile(viewerId, profileId);
  },

  listFollowers(viewerId: string, profileId: string, cursorId?: string): Promise<UserSearchPage> {
    return listConnections(viewerId, profileId, "followers", cursorId);
  },

  listFollowing(viewerId: string, profileId: string, cursorId?: string): Promise<UserSearchPage> {
    return listConnections(viewerId, profileId, "following", cursorId);
  },
};
