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

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  usernameChangedAt: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  isSelf: boolean;
  following: boolean;
}
