import type { ProfilePostKind } from "@/constants/profile";
import type { PostPrivacy } from "@/constants/privacy";
import { FEED_PAGE_SIZE } from "@/constants/post";
import type { ReportReason } from "@/constants/report";
import { apiRequest } from "@/lib/api-client";
import type { FeedPage, Post, ReactionSummary, ReactionType } from "@/types/post";

interface PostResponse {
  post: Post;
}

interface ReactionResponse {
  reactions: ReactionSummary;
}

export const postService = {
  getFeed(cursor?: string | null): Promise<FeedPage> {
    const params = new URLSearchParams({ limit: String(FEED_PAGE_SIZE) });
    if (cursor) params.set("cursor", cursor);
    return apiRequest<FeedPage>(`/posts/feed?${params.toString()}`);
  },

  getByUser(userId: string, kind: ProfilePostKind, cursor?: string | null): Promise<FeedPage> {
    const params = new URLSearchParams({ kind, limit: String(FEED_PAGE_SIZE) });
    if (cursor) params.set("cursor", cursor);
    return apiRequest<FeedPage>(`/users/${userId}/posts?${params.toString()}`);
  },

  async create(content: string, privacy: PostPrivacy): Promise<Post> {
    const data = await apiRequest<PostResponse>("/posts", {
      method: "POST",
      body: JSON.stringify({ content, privacy }),
    });
    return data.post;
  },

  async updatePrivacy(id: string, privacy: PostPrivacy): Promise<Post> {
    const data = await apiRequest<PostResponse>(`/posts/${id}/privacy`, {
      method: "PATCH",
      body: JSON.stringify({ privacy }),
    });
    return data.post;
  },

  async update(id: string, content: string): Promise<Post> {
    const data = await apiRequest<PostResponse>(`/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ content }),
    });
    return data.post;
  },

  async remove(id: string): Promise<void> {
    await apiRequest<null>(`/posts/${id}`, { method: "DELETE" });
  },

  async setReaction(id: string, type: ReactionType): Promise<ReactionSummary> {
    const data = await apiRequest<ReactionResponse>(`/posts/${id}/reaction`, {
      method: "PUT",
      body: JSON.stringify({ type }),
    });
    return data.reactions;
  },

  async removeReaction(id: string): Promise<ReactionSummary> {
    const data = await apiRequest<ReactionResponse>(`/posts/${id}/reaction`, { method: "DELETE" });
    return data.reactions;
  },

  share(id: string, content: string, privacy: PostPrivacy): Promise<{ post: Post; created: boolean }> {
    return apiRequest<{ post: Post; created: boolean }>(`/posts/${id}/share`, {
      method: "POST",
      body: JSON.stringify({ content, privacy }),
    });
  },

  report(id: string, reason: ReportReason, detail?: string): Promise<{ updated: boolean }> {
    return apiRequest<{ updated: boolean }>(`/posts/${id}/report`, {
      method: "POST",
      body: JSON.stringify({ reason, detail }),
    });
  },
};
