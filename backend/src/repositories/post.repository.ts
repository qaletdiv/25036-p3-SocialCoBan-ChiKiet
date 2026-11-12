import { Brackets, In, MoreThanOrEqual, type SelectQueryBuilder } from "typeorm";
import { AppDataSource } from "@/config/data-source";
import type { PostPrivacy } from "@/constants/privacy.constants";
import type { ProfilePostKind } from "@/constants/profile.constants";
import { Post } from "@/entities/post.entity";

const whereVisibleToViewer = (query: SelectQueryBuilder<Post>): SelectQueryBuilder<Post> => {
  const condition = new Brackets((builder) => {
    builder
      .where("post.userId = :viewerId")
      .orWhere("post.privacy = :publicPrivacy")
      .orWhere(
        `post.privacy = :followersPrivacy AND EXISTS (
          SELECT 1 FROM follows
          WHERE follows.follower_id = :viewerId AND follows.following_id = post.user_id
        )`,
      );
  });
  return query.expressionMap.wheres.length === 0 ? query.where(condition) : query.andWhere(condition);
};

// Author deletes stay hidden. Admin removals stay in the feed as a placeholder.
const includeReadableOrRemoved = (query: SelectQueryBuilder<Post>): SelectQueryBuilder<Post> =>
  query.withDeleted().andWhere("(post.deleted_at IS NULL OR post.removed_by_moderation = 1)");

export const postRepository = AppDataSource.getRepository(Post).extend({
  findVisibleFeedPage(viewerId: string, limit: number, cursor?: string): Promise<Post[]> {
    const query = includeReadableOrRemoved(
      whereVisibleToViewer(this.createQueryBuilder("post").innerJoinAndSelect("post.author", "author")),
    )
      .setParameters({ viewerId, publicPrivacy: "public", followersPrivacy: "followers" })
      .orderBy("post.id", "DESC")
      .limit(limit);

    if (cursor) query.andWhere("post.id < :cursor", { cursor });
    return query.getMany();
  },

  findVisibleProfilePage(
    viewerId: string,
    authorId: string,
    kind: ProfilePostKind,
    limit: number,
    cursor?: string,
  ): Promise<Post[]> {
    const query = includeReadableOrRemoved(
      whereVisibleToViewer(
        this.createQueryBuilder("post").innerJoinAndSelect("post.author", "author").where("post.userId = :authorId"),
      ),
    )
      .andWhere(kind === "authored" ? "post.sharedPostId IS NULL" : "post.sharedPostId IS NOT NULL")
      .setParameters({
        authorId,
        viewerId,
        publicPrivacy: "public",
        followersPrivacy: "followers",
      })
      .orderBy("post.id", "DESC")
      .limit(limit);

    if (cursor) query.andWhere("post.id < :cursor", { cursor });
    return query.getMany();
  },

  findByIdWithAuthor(id: string): Promise<Post | null> {
    return this.findOne({ where: { id }, relations: { author: true } });
  },

  findByIdsIncludingDeleted(ids: string[]): Promise<Post[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return this.find({ where: { id: In(ids) }, withDeleted: true, relations: { author: true } });
  },

  findActiveShare(userId: string, sharedPostId: string): Promise<Post | null> {
    return this.findOne({ where: { userId, sharedPostId }, relations: { author: true } });
  },

  async createForUser(userId: string, content: string, privacy: PostPrivacy): Promise<Post> {
    const post = await this.save(
      this.create({ userId, content, privacy, sharedPostId: null, editedAt: null, removedByModeration: false }),
    );
    return this.findOneOrFail({ where: { id: post.id }, relations: { author: true } });
  },

  async createShare(userId: string, sharedPostId: string, content: string, privacy: PostPrivacy): Promise<Post> {
    const post = await this.save(
      this.create({ userId, content, privacy, sharedPostId, editedAt: null, removedByModeration: false }),
    );
    return this.findOneOrFail({ where: { id: post.id }, relations: { author: true } });
  },

  async updatePrivacy(id: string, privacy: PostPrivacy): Promise<void> {
    await this.update({ id }, { privacy });
  },

  async updateContent(id: string, content: string): Promise<void> {
    await this.update({ id }, { content, editedAt: new Date() });
  },

  async softDeleteById(id: string): Promise<void> {
    await this.softDelete({ id });
  },

  async hardDeleteById(id: string): Promise<void> {
    await this.delete({ id });
  },

  countExisting(): Promise<number> {
    return this.count();
  },

  countCreatedSince(since: Date): Promise<number> {
    return this.count({ where: { createdAt: MoreThanOrEqual(since) } });
  },
});
