import { In } from "typeorm";
import { AppDataSource } from "@/config/data-source";
import { Follow } from "@/entities/follow.entity";
import { User } from "@/entities/user.entity";

export interface FollowCursor {
  createdAt: Date;
  id: string;
}

export const followRepository = AppDataSource.getRepository(Follow).extend({
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return (await this.count({ where: { followerId, followingId } })) > 0;
  },

  async findFollowedIds(followerId: string, followingIds: string[]): Promise<string[]> {
    if (followingIds.length === 0) return [];
    const rows = await this.find({
      where: { followerId, followingId: In(followingIds) },
      select: { followerId: true, followingId: true },
    });
    return rows.map((row) => row.followingId);
  },

  async follow(followerId: string, followingId: string): Promise<boolean> {
    const result = await this.createQueryBuilder()
      .insert()
      .into(Follow)
      .values({ followerId, followingId })
      .orIgnore()
      .execute();
    const affected = (result.raw as { affectedRows?: number }).affectedRows ?? 0;
    return affected > 0;
  },

  async unfollow(followerId: string, followingId: string): Promise<void> {
    await this.delete({ followerId, followingId });
  },

  countFollowers(userId: string): Promise<number> {
    return this.count({ where: { followingId: userId } });
  },

  countFollowing(userId: string): Promise<number> {
    return this.count({ where: { followerId: userId } });
  },

  async findFollowTime(followerId: string, followingId: string): Promise<Date | null> {
    const row = await this.findOne({ where: { followerId, followingId } });
    return row?.createdAt ?? null;
  },

  listFollowers(userId: string, limit: number, cursor?: FollowCursor): Promise<User[]> {
    return listRelatedUsers("follow.follower_id = user.id AND follow.following_id = :userId", userId, limit, cursor);
  },

  listFollowing(userId: string, limit: number, cursor?: FollowCursor): Promise<User[]> {
    return listRelatedUsers("follow.following_id = user.id AND follow.follower_id = :userId", userId, limit, cursor);
  },
});

const listRelatedUsers = (join: string, userId: string, limit: number, cursor?: FollowCursor): Promise<User[]> => {
  const query = AppDataSource.getRepository(User)
    .createQueryBuilder("user")
    .innerJoin("follows", "follow", join, { userId })
    .where("user.emailVerifiedAt IS NOT NULL")
    .orderBy("follow.created_at", "DESC")
    .addOrderBy("user.id", "DESC")
    .limit(limit);

  if (cursor) {
    query.andWhere("(follow.created_at < :cursorAt OR (follow.created_at = :cursorAt AND user.id < :cursorId))", {
      cursorAt: cursor.createdAt,
      cursorId: cursor.id,
    });
  }

  return query.getMany();
};
