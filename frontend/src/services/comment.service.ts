import { COMMENT_PAGE_SIZE } from "@/constants/comment";
import type { ReportReason } from "@/constants/report";
import { apiRequest } from "@/lib/api-client";
import type { Comment, CommentPage, CreatedComment } from "@/types/comment";

const buildPageQuery = (cursor?: string | null): string => {
  const params = new URLSearchParams({ limit: String(COMMENT_PAGE_SIZE) });
  if (cursor) params.set("cursor", cursor);
  return params.toString();
};

export const commentService = {
  list(postId: string, cursor?: string | null): Promise<CommentPage> {
    return apiRequest<CommentPage>(`/posts/${postId}/comments?${buildPageQuery(cursor)}`);
  },

  listReplies(commentId: string, cursor?: string | null): Promise<CommentPage> {
    return apiRequest<CommentPage>(`/comments/${commentId}/replies?${buildPageQuery(cursor)}`);
  },

  create(postId: string, content: string, parentId?: string): Promise<CreatedComment> {
    return apiRequest<CreatedComment>(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content, parentId }),
    });
  },

  async update(id: string, content: string): Promise<Comment> {
    const data = await apiRequest<{ comment: Comment }>(`/comments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ content }),
    });
    return data.comment;
  },

  remove(id: string): Promise<{ commentCount: number }> {
    return apiRequest<{ commentCount: number }>(`/comments/${id}`, { method: "DELETE" });
  },

  report(id: string, reason: ReportReason, detail?: string): Promise<{ updated: boolean }> {
    return apiRequest<{ updated: boolean }>(`/comments/${id}/report`, {
      method: "POST",
      body: JSON.stringify({ reason, detail }),
    });
  },
};
