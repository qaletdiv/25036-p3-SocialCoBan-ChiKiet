import type { EntityManager } from "typeorm";
import { AppDataSource } from "@/config/data-source";
import { EmailVerificationToken } from "@/entities/email-verification-token.entity";

export const emailVerificationTokenRepository = AppDataSource.getRepository(EmailVerificationToken).extend({
  createForUser(
    data: { userId: string; tokenHash: string; expiresAt: Date },
    manager: EntityManager = AppDataSource.manager,
  ): Promise<EmailVerificationToken> {
    const repository = manager.getRepository(EmailVerificationToken);
    return repository.save(repository.create(data));
  },

  findByHash(tokenHash: string, manager: EntityManager = AppDataSource.manager): Promise<EmailVerificationToken | null> {
    return manager.getRepository(EmailVerificationToken).findOne({ where: { tokenHash } });
  },

  async deleteAllForUser(userId: string, manager: EntityManager = AppDataSource.manager): Promise<void> {
    await manager.getRepository(EmailVerificationToken).delete({ userId });
  },
});
