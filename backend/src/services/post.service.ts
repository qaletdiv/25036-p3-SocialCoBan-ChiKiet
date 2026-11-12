import type { PostPrivacy } from "@/constants/privacy.constants";
import type { ProfilePostKind } from "@/constants/profile.constants";
import { FEED_DEFAULT_PAGE_SIZE } from "@/constants/post.constants";
import { REACTION_TYPES, type ReactionType } from "@/constants/reaction.constants";
import type { Post } from "@/entities/post.entity";
import { commentRepository } from "@/repositories/comment.repository";
import { postRepository } from "@/repositories/post.repository";
import { postAccessService } from "@/services/post-access.service";
import { reactionService, type ReactionSummary } from "@/services/reaction.service";
import { AppError } from "@/utils/app-error";

export interface SharedOriginalView {
  id: string;
  content: string;
  privacy: PostPrivacy;
  createdAt: Date;
  editedAt: Date | null;
  author: { id: string; fullName: string; avatarUrl: string | null };
}

export type SharedPostState = "available" | "removed" | "unavailable";

export interface SharedPostView {
  state: SharedPostState;
  original: SharedOriginalView | null;
}

export interface PostView {
  id: string;
  content: string;
  privacy: PostPrivacy;
  createdAt: Date;
  editedAt: Date | null;
  author: { id: string; fullName: string; avatarUrl: string | null };
  sharedPost: SharedPostView | null;
  removed: boolean;
  reactions: ReactionSummary;
  commentCount: number;
}

export interface FeedPage {
  posts: PostView[];
  nextCursor: string | null;
}

const toAuthor = (author: Post["author"]) => ({
  id: author.id,
  fullName: author.fullName,
  avatarUrl: author.avatarUrl,
});

const emptyReactions = (): ReactionSummary => ({
  total: 0,
  counts: Object.fromEntries(REACTION_TYPES.map((type) => [type, 0])) as Record<ReactionType, number>,
  myReaction: null,
});

const isRemovedByModeration = (post: Post): boolean => post.removedByModeration && post.deletedAt !== null;

const toSharedPostView = (original: Post | undefined, visibleIds: ReadonlySet<string>): SharedPostView => {
  if (original && isRemovedByModeration(original)) return { state: "removed", original: null };
  if (!original || original.deletedAt !== null || !visibleIds.has(original.id)) {
    return { state: "unavailable", original: null };
  }
  return {
    state: "available",
    original: {
      id: original.id,
      content: original.content,
      privacy: original.privacy,
      createdAt: original.createdAt,
      editedAt: original.editedAt,
      author: toAuthor(original.author),
    },
  };
};

const toPostViews = async (viewerId: string, posts: Post[]): Promise<PostView[]> => {
  const postIds = posts.map((post) => post.id);
  const sharedIds = [...new Set(posts.flatMap((post) => (post.sharedPostId ? [post.sharedPostId] : [])))];
  const [reactions, commentCounts, originals] = await Promise.all([
    reactionService.summarize(postIds, viewerId),
    commentRepository.countByPostIds(postIds),
    postRepository.findByIdsIncludingDeleted(sharedIds),
  ]);
  const originalsById = new Map(originals.map((post) => [post.id, post]));
  const visibleOriginalIds = await postAccessService.visibleIds(viewerId, originals);

  return posts.map((post) => {
    const removed = isRemovedByModeration(post);
    return {
      id: post.id,
      content: removed ? "" : post.content,
      privacy: post.privacy,
      createdAt: post.createdAt,
      editedAt: removed ? null : post.editedAt,
      author: toAuthor(post.author),
      sharedPost: post.sharedPostId
        ? removed
          ? { state: "removed" as const, original: null }
          : toSharedPostView(originalsById.get(post.sharedPostId), visibleOriginalIds)
        : null,
      removed,
      reactions: removed ? emptyReactions() : (reactions.get(post.id) as ReactionSummary),
      commentCount: removed ? 0 : (commentCounts.get(post.id) ?? 0),
    };
  });
};

const toPostView = async (viewerId: string, post: Post): Promise<PostView> => {
  const [view] = await toPostViews(viewerId, [post]);
  return view as PostView;
};

const findOwnedPost = async (userId: string, postId: string): Promise<Post> => {
  const post = await postRepository.findByIdWithAuthor(postId);
  if (!post) throw AppError.notFound("Post not found");
  if (post.userId !== userId) throw AppError.forbidden("You can only modify your own posts");
  return post;
};

export const postService = {
  async getFeed(userId: string, cursor?: string, limit = FEED_DEFAULT_PAGE_SIZE): Promise<FeedPage> {
    const rows = await postRepository.findVisibleFeedPage(userId, limit + 1, cursor);

    const hasMore = rows.length > limit;
    const posts = hasMore ? rows.slice(0, limit) : rows;
    const lastPost = posts[posts.length - 1];

    return {
      posts: await toPostViews(userId, posts),
      nextCursor: hasMore && lastPost ? lastPost.id : null,
    };
  },

  async listProfilePosts(
    viewerId: string,
    authorId: string,
    kind: ProfilePostKind,
    cursor?: string,
    limit = FEED_DEFAULT_PAGE_SIZE,
  ): Promise<FeedPage> {
    const rows = await postRepository.findVisibleProfilePage(viewerId, authorId, kind, limit + 1, cursor);
    const hasMore = rows.length > limit;
    const posts = hasMore ? rows.slice(0, limit) : rows;
    const lastPost = posts[posts.length - 1];

    return {
      posts: await toPostViews(viewerId, posts),
      nextCursor: hasMore && lastPost ? lastPost.id : null,
    };
  },

  async createPost(userId: string, content: string, privacy: PostPrivacy): Promise<PostView> {
    return toPostView(userId, await postRepository.createForUser(userId, content, privacy));
  },

  async updatePrivacy(userId: string, postId: string, privacy: PostPrivacy): Promise<PostView> {
    const post = await findOwnedPost(userId, postId);
    if (post.privacy === privacy) return toPostView(userId, post);
    await postRepository.updatePrivacy(post.id, privacy);
    const updated = await postRepository.findByIdWithAuthor(post.id);
    if (!updated) throw AppError.notFound("Post not found");
    return toPostView(userId, updated);
  },

  async updatePost(userId: string, postId: string, content: string): Promise<PostView> {
    const post = await findOwnedPost(userId, postId);
    if (content.length === 0 && post.sharedPostId === null) {
      throw AppError.validation([{ field: "content", messages: ["content should not be empty"] }]);
    }
    if (post.content === content) return toPostView(userId, post);

    await postRepository.updateContent(post.id, content);
    const updated = await postRepository.findByIdWithAuthor(post.id);
    if (!updated) throw AppError.notFound("Post not found");
    return toPostView(userId, updated);
  },

  async deletePost(userId: string, postId: string): Promise<void> {
    const post = await findOwnedPost(userId, postId);
    // Hard-deleting a share frees the one-share-per-original constraint and drops its own reactions
    if (post.sharedPostId) await postRepository.hardDeleteById(post.id);
    else await postRepository.softDeleteById(post.id);
  },

  async sharePost(
    userId: string,
    postId: string,
    caption: string,
    privacy: PostPrivacy = "public",
  ): Promise<{ post: PostView; created: boolean }> {
    const source = await postAccessService.ensureCanView(userId, postId);
    const rootId = source.sharedPostId ?? source.id;
    const root = rootId === source.id ? source : await postRepository.findByIdWithAuthor(rootId);
    if (!root || !(await postAccessService.canView(userId, root))) throw AppError.notFound("Post not found");
    if (root.privacy !== "public") throw AppError.cannotShareNonPublicPost();
    if (root.userId === userId) throw AppError.cannotShareOwnPost();

    const content = caption.trim();
    const existing = await postRepository.findActiveShare(userId, root.id);
    if (existing) {
      if (existing.content !== content) await postRepository.updateContent(existing.id, content);
      if (existing.privacy !== privacy) await postRepository.updatePrivacy(existing.id, privacy);
      const updated = await postRepository.findByIdWithAuthor(existing.id);
      if (!updated) throw AppError.notFound("Post not found");
      return { post: await toPostView(userId, updated), created: false };
    }

    const created = await postRepository.createShare(userId, root.id, content, privacy);
    return { post: await toPostView(userId, created), created: true };
  },
};
