import { apiRequest } from "@/lib/api-client";
import type { UserProfile, UserSearchPage } from "@/types/user";

interface ProfileResponse {
  profile: UserProfile;
}

export const userService = {
  async getProfile(userId: string): Promise<UserProfile> {
    const data = await apiRequest<ProfileResponse>(`/users/${userId}`);
    return data.profile;
  },

  async updateProfile(
    userId: string,
    input: { fullName: string; bio: string | null; username: string },
  ): Promise<UserProfile> {
    const data = await apiRequest<ProfileResponse>(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return data.profile;
  },

  listFollowers(userId: string, cursor?: string | null): Promise<UserSearchPage> {
    const params = new URLSearchParams();
    if (cursor) params.set("cursor", cursor);
    const query = params.toString();
    return apiRequest<UserSearchPage>(`/users/${userId}/followers${query ? `?${query}` : ""}`);
  },

  listFollowing(userId: string, cursor?: string | null): Promise<UserSearchPage> {
    const params = new URLSearchParams();
    if (cursor) params.set("cursor", cursor);
    const query = params.toString();
    return apiRequest<UserSearchPage>(`/users/${userId}/following${query ? `?${query}` : ""}`);
  },

  search(query: string, cursor?: string | null): Promise<UserSearchPage> {
    const params = new URLSearchParams({ q: query });
    if (cursor) params.set("cursor", cursor);
    return apiRequest<UserSearchPage>(`/users/search?${params.toString()}`);
  },

  follow(userId: string): Promise<{ following: true }> {
    return apiRequest<{ following: true }>(`/users/${userId}/follow`, { method: "PUT" });
  },

  unfollow(userId: string): Promise<{ following: false }> {
    return apiRequest<{ following: false }>(`/users/${userId}/follow`, { method: "DELETE" });
  },
};
