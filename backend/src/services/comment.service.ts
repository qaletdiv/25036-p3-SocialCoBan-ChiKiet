import { COMMENT_DEFAULT_PAGE_SIZE } from "@/constants/comment.constants";
import type { Comment } from "@/entities/comment.entity";
import { commentRepository } from "@/repositories/comment.repository";
import { postAccessService } from "@/services/post-access.service";
import { AppError } from "@/utils/app-error";

export interface CommentView {
  id: string;
  postId: string;
  parentId: string | null;
  content: string;
  createdAt: Date;
  editedAt: Date | null;
  replyCount: number;
  author: { id: string; fullName: string; avatarUrl: string | null };
}

export interface CommentPage {
  comments: CommentView[];
  nextCursor: string | null;
}

export interface CreateCommentInput {
  content: string;
  parentId?: string;
}

const toCommentView = (comment: Comment, replyCount = 0): CommentView => ({
  id: comment.id,
  postId: comment.postId,
  parentId: comment.parentId,
  content: comment.content,
  createdAt: comment.createdAt,
  editedAt: comment.editedAt,
  replyCount,
  author: {
    id: comment.author.id,
    fullName: comment.author.fullName,
    avatarUrl: comment.author.avatarUrl,
  },
});

const findOwnedComment = async (userId: string, commentId: string): Promise<Comment> => {
  const comment = await commentRepository.findByIdWithAuthor(commentId);
  if (!comment) throw AppError.notFound("Comment not found");
  if (comment.userId !== userId) throw AppError.forbidden("You can only modify your own comments");
  return comment;
};

const paginate = (rows: Comment[], limit: number): { items: Comment[]; nextCursor: string | null } => {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items[items.length - 1];
  return { items, nextCursor: hasMore && last ? last.id : null };
};

export const commentService = {
  async listComments(
    viewerId: string,
    postId: string,
    cursor?: string,
    limit = COMMENT_DEFAULT_PAGE_SIZE,
  ): Promise<CommentPage> {
    await postAccessService.ensureCanView(viewerId, postId);

    const { items, nextCursor } = paginate(await commentRepository.findTopLevelPage(postId, limit + 1, cursor), limit);
    const replyCounts = await commentRepository.countRepliesByParentIds(items.map((comment) => comment.id));

    return {
      comments: items.map((comment) => toCommentView(comment, replyCounts.get(comment.id) ?? 0)),
      nextCursor,
    };
  },

  async listReplies(
    viewerId: string,
    commentId: string,
    cursor?: string,
    limit = COMMENT_DEFAULT_PAGE_SIZE,
  ): Promise<CommentPage> {
    const parent = await commentRepository.findOneBy({ id: commentId });
    if (!parent || parent.parentId !== null) throw AppError.notFound("Comment not found");
    await postAccessService.ensureCanView(viewerId, parent.postId);

    const { items, nextCursor } = paginate(await commentRepository.findRepliesPage(commentId, limit + 1, cursor), limit);
    return { comments: items.map((comment) => toCommentView(comment)), nextCursor };
  },

  async createComment(
    userId: string,
    postId: string,
    input: CreateCommentInput,
  ): Promise<{ comment: CommentView; commentCount: number }> {
    await postAccessService.ensureCanView(userId, postId);

    if (input.parentId) {
      const parent = await commentRepository.findOneBy({ id: input.parentId });
      if (!parent || parent.postId !== postId) throw AppError.notFound("Parent comment not found");
      if (parent.parentId !== null) {
        throw AppError.validation([{ field: "parentId", messages: ["Replies cannot be nested more than one level"] }]);
      }
    }

    const comment = await commentRepository.createComment({
      postId,
      userId,
      parentId: input.parentId ?? null,
      content: input.content,
    });

    return {
      comment: toCommentView(comment),
      commentCount: await commentRepository.countByPostId(postId),
    };
  },

  async updateComment(userId: string, commentId: string, content: string): Promise<CommentView> {
    const comment = await findOwnedComment(userId, commentId);
    await postAccessService.ensureCanView(userId, comment.postId);
    const replyCount = (await commentRepository.countRepliesByParentIds([comment.id])).get(comment.id) ?? 0;
    if (comment.content === content) return toCommentView(comment, replyCount);

    await commentRepository.updateContent(comment.id, content);
    const updated = await commentRepository.findByIdWithAuthor(comment.id);
    if (!updated) throw AppError.notFound("Comment not found");
    return toCommentView(updated, replyCount);
  },

  async deleteComment(userId: string, commentId: string): Promise<{ commentCount: number }> {
    const comment = await findOwnedComment(userId, commentId);
    await postAccessService.ensureCanView(userId, comment.postId);
    await commentRepository.deleteById(comment.id);
    return { commentCount: await commentRepository.countByPostId(comment.postId) };
  },
};
