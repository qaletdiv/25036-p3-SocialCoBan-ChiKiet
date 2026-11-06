import type { Post } from "@/entities/post.entity";
import { followRepository } from "@/repositories/follow.repository";
import { postRepository } from "@/repositories/post.repository";
import { AppError } from "@/utils/app-error";

type ViewablePost = Pick<Post, "userId" | "privacy" | "deletedAt">;

export const canViewPost = (
  viewerId: string,
  post: ViewablePost,
  followedAuthorIds: ReadonlySet<string>,
): boolean => {
  if (post.deletedAt) return false;
  if (post.userId === viewerId) return true;
  if (post.privacy === "public") return true;
  if (post.privacy === "followers") return followedAuthorIds.has(post.userId);
  return false;
};

export const postAccessService = {
  async ensureCanView(viewerId: string, postId: string): Promise<Post> {
    const post = await postRepository.findByIdWithAuthor(postId);
    if (!post || !(await this.canView(viewerId, post))) throw AppError.notFound("Post not found");
    return post;
  },

  async canView(viewerId: string, post: ViewablePost): Promise<boolean> {
    if (post.deletedAt) return false;
    if (post.userId === viewerId || post.privacy === "public") return true;
    if (post.privacy !== "followers") return false;
    return followRepository.isFollowing(viewerId, post.userId);
  },

  async visibleIds(viewerId: string, posts: Post[]): Promise<Set<string>> {
    const authorIds = [
      ...new Set(
        posts
          .filter((post) => !post.deletedAt && post.privacy === "followers" && post.userId !== viewerId)
          .map((post) => post.userId),
      ),
    ];
    const followedAuthorIds = new Set(await followRepository.findFollowedIds(viewerId, authorIds));
    return new Set(posts.filter((post) => canViewPost(viewerId, post, followedAuthorIds)).map((post) => post.id));
  },
};
