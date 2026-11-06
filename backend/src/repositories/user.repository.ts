import type { EntityManager } from "typeorm";
import { AppDataSource } from "@/config/data-source";
import { User } from "@/entities/user.entity";

const escapeLike = (value: string): string => value.replace(/[\\%_]/g, (character) => `\\${character}`);

export interface NameSearchCursor {
  fullName: string;
  id: string;
}

interface NewAccountData {
  email: string;
  username: string;
  fullName: string;
  passwordHash: string;
}

export const userRepository = AppDataSource.getRepository(User).extend({
  findById(id: string): Promise<User | null> {
    return this.findOne({ where: { id } });
  },

  findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  },

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .where("user.email = :email", { email })
      .getOne();
  },

  findByUsername(username: string): Promise<User | null> {
    return this.createQueryBuilder("user").where("user.username = :username", { username }).getOne();
  },

  findByUsernameWithPassword(username: string): Promise<User | null> {
    return this.createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .where("user.username = :username", { username })
      .getOne();
  },

  createAccount(data: NewAccountData, manager: EntityManager = AppDataSource.manager): Promise<User> {
    const repository = manager.getRepository(User);
    return repository.save(repository.create({ ...data, emailVerifiedAt: null }));
  },

  // A successful reset proves mailbox ownership, so the email is marked verified as well
  async updatePassword(userId: string, passwordHash: string, manager: EntityManager): Promise<void> {
    const repository = manager.getRepository(User);
    const user = await repository.findOneByOrFail({ id: userId });
    await repository.update({ id: userId }, { passwordHash, emailVerifiedAt: user.emailVerifiedAt ?? new Date() });
  },

  async revokeSessions(userId: string): Promise<void> {
    await this.update({ id: userId }, { sessionsValidAfter: new Date() });
  },

  async markEmailVerified(userId: string, manager: EntityManager = AppDataSource.manager): Promise<void> {
    await manager.getRepository(User).update({ id: userId }, { emailVerifiedAt: new Date() });
  },

  async updateProfile(
    userId: string,
    data: { fullName: string; bio: string | null; username?: string; usernameChangedAt?: Date },
  ): Promise<void> {
    await this.update({ id: userId }, data);
  },

  // People the user follows or has already exchanged messages with
  searchChatContactsByName(userId: string, term: string, limit: number): Promise<User[]> {
    return this.createQueryBuilder("user")
      .where("user.emailVerifiedAt IS NOT NULL")
      .andWhere("user.id <> :userId", { userId })
      .andWhere("user.fullName LIKE :pattern ESCAPE '\\\\'", { pattern: `%${escapeLike(term)}%` })
      .andWhere(
        `(EXISTS (SELECT 1 FROM follows f WHERE f.follower_id = :userId AND f.following_id = user.id)
          OR EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.last_message_id IS NOT NULL
              AND ((c.user_low_id = :userId AND c.user_high_id = user.id)
                OR (c.user_high_id = :userId AND c.user_low_id = user.id))
          ))`,
      )
      .orderBy("user.fullName", "ASC")
      .addOrderBy("user.id", "ASC")
      .limit(limit)
      .getMany();
  },

  searchVerifiedByName(term: string, limit: number, cursor?: NameSearchCursor): Promise<User[]> {
    const query = this.createQueryBuilder("user")
      .where("user.emailVerifiedAt IS NOT NULL")
      .andWhere("(user.fullName LIKE :pattern ESCAPE '\\\\' OR user.username LIKE :pattern ESCAPE '\\\\')", {
        pattern: `%${escapeLike(term)}%`,
      })
      .orderBy("user.fullName", "ASC")
      .addOrderBy("user.id", "ASC")
      .limit(limit);

    if (cursor) {
      query.andWhere("(user.fullName > :cursorName OR (user.fullName = :cursorName AND user.id > :cursorId))", {
        cursorName: cursor.fullName,
        cursorId: cursor.id,
      });
    }

    return query.getMany();
  },
});
