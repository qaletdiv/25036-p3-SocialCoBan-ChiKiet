import { AppDataSource } from "@/config/data-source";
import { Comment } from "@/entities/comment.entity";

interface NewCommentData {
  postId: string;
  userId: string;
  parentId: string | null;
  content: string;
}

export const commentRepository = AppDataSource.getRepository(Comment).extend({
  findByIdWithAuthor(id: string): Promise<Comment | null> {
    return this.findOne({ where: { id }, relations: { author: true } });
  },

  async createComment(data: NewCommentData): Promise<Comment> {
    const comment = await this.save(this.create({ ...data, editedAt: null }));
    return this.findOneOrFail({ where: { id: comment.id }, relations: { author: true } });
  },

  // Newest first
  findTopLevelPage(postId: string, limit: number, cursor?: string): Promise<Comment[]> {
    const query = this.createQueryBuilder("comment")
      .innerJoinAndSelect("comment.author", "author")
      .where("comment.postId = :postId", { postId })
      .andWhere("comment.parentId IS NULL")
      .orderBy("comment.id", "DESC")
      .limit(limit);

    if (cursor) query.andWhere("comment.id < :cursor", { cursor });
    return query.getMany();
  },

  // Oldest first so a conversation reads top to bottom
  findRepliesPage(parentId: string, limit: number, cursor?: string): Promise<Comment[]> {
    const query = this.createQueryBuilder("comment")
      .innerJoinAndSelect("comment.author", "author")
      .where("comment.parentId = :parentId", { parentId })
      .orderBy("comment.id", "ASC")
      .limit(limit);

    if (cursor) query.andWhere("comment.id > :cursor", { cursor });
    return query.getMany();
  },

  async countRepliesByParentIds(parentIds: string[]): Promise<Map<string, number>> {
    if (parentIds.length === 0) return new Map();

    const rows = await this.createQueryBuilder("comment")
      .select("comment.parentId", "parentId")
      .addSelect("COUNT(*)", "count")
      .where("comment.parentId IN (:...parentIds)", { parentIds })
      .groupBy("comment.parentId")
      .getRawMany<{ parentId: string; count: string }>();

    return new Map(rows.map((row) => [String(row.parentId), Number(row.count)]));
  },

  async countByPostIds(postIds: string[]): Promise<Map<string, number>> {
    if (postIds.length === 0) return new Map();

    const rows = await this.createQueryBuilder("comment")
      .select("comment.postId", "postId")
      .addSelect("COUNT(*)", "count")
      .where("comment.postId IN (:...postIds)", { postIds })
      .groupBy("comment.postId")
      .getRawMany<{ postId: string; count: string }>();

    return new Map(rows.map((row) => [String(row.postId), Number(row.count)]));
  },

  countByPostId(postId: string): Promise<number> {
    return this.count({ where: { postId } });
  },

  async updateContent(id: string, content: string): Promise<void> {
    await this.update({ id }, { content, editedAt: new Date() });
  },

  // Replies are removed by the ON DELETE CASCADE foreign key
  async deleteById(id: string): Promise<void> {
    await this.delete({ id });
  },
});
