import type { EntityManager } from "typeorm";
import { AppDataSource } from "@/config/data-source";
import { PasswordResetToken } from "@/entities/password-reset-token.entity";

export const passwordResetTokenRepository = AppDataSource.getRepository(PasswordResetToken).extend({
  createForUser(
    data: { userId: string; tokenHash: string; expiresAt: Date },
    manager: EntityManager = AppDataSource.manager,
  ): Promise<PasswordResetToken> {
    const repository = manager.getRepository(PasswordResetToken);
    return repository.save(repository.create(data));
  },

  findLatestForUser(userId: string): Promise<PasswordResetToken | null> {
    return this.findOne({ where: { userId }, order: { createdAt: "DESC" } });
  },

  findByHash(tokenHash: string): Promise<PasswordResetToken | null> {
    return this.findOne({ where: { tokenHash } });
  },

  // Single-use guarantee: only one concurrent caller gets the row deleted
  async consumeByHash(tokenHash: string, manager: EntityManager): Promise<PasswordResetToken | null> {
    const repository = manager.getRepository(PasswordResetToken);
    const record = await repository.findOne({ where: { tokenHash } });
    if (!record || record.expiresAt.getTime() < Date.now()) return null;

    const result = await repository.delete({ id: record.id });
    return result.affected === 1 ? record : null;
  },

  async deleteAllForUser(userId: string, manager: EntityManager = AppDataSource.manager): Promise<void> {
    await manager.getRepository(PasswordResetToken).delete({ userId });
  },
});
