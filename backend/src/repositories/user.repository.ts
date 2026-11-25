import { MoreThanOrEqual, type EntityManager } from "typeorm";
import { AppDataSource } from "@/config/data-source";
import type { AccountStatus } from "@/constants/account-status.constants";
import type { UserRole } from "@/constants/user-role.constants";
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

export interface AdminUserFilters {
  term?: string;
  status?: AccountStatus;
  role?: UserRole;
  cursor?: string;
  limit: number;
}

export const userRepository = AppDataSource.getRepository(User).extend({
  findById(id: string, manager: EntityManager = AppDataSource.manager): Promise<User | null> {
    return manager.getRepository(User).findOne({ where: { id } });
  },

  countAll(): Promise<number> {
    return this.count();
  },

  countCreatedSince(since: Date): Promise<number> {
    return this.count({ where: { createdAt: MoreThanOrEqual(since) } });
  },

  findByEmail(email: string, manager: EntityManager = AppDataSource.manager): Promise<User | null> {
    return manager.getRepository(User).findOne({ where: { email } });
  },

  findByGoogleId(googleId: string, manager: EntityManager = AppDataSource.manager): Promise<User | null> {
    return manager.getRepository(User).findOne({ where: { googleId } });
  },

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .where("user.email = :email", { email })
      .getOne();
  },

  findByUsername(username: string, manager: EntityManager = AppDataSource.manager): Promise<User | null> {
    return manager
      .getRepository(User)
      .createQueryBuilder("user")
      .where("user.username = :username", { username })
      .getOne();
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

  createGoogleAccount(
    data: { email: string; username: string; fullName: string; googleId: string; avatarUrl: string | null },
    manager: EntityManager,
  ): Promise<User> {
    const repository = manager.getRepository(User);
    return repository.save(
      repository.create({
        email: data.email,
        username: data.username,
        fullName: data.fullName,
        googleId: data.googleId,
        avatarUrl: data.avatarUrl,
        passwordHash: null,
        emailVerifiedAt: new Date(),
      }),
    );
  },

  async linkGoogleAccount(
    userId: string,
    data: { googleId: string; emailVerifiedAt?: Date; avatarUrl?: string },
    manager: EntityManager,
  ): Promise<void> {
    await manager.getRepository(User).update({ id: userId }, {
      googleId: data.googleId,
      ...(data.emailVerifiedAt ? { emailVerifiedAt: data.emailVerifiedAt } : {}),
      ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
    });
  },

  async setAvatarIfEmpty(userId: string, avatarUrl: string, manager: EntityManager): Promise<void> {
    await manager
      .getRepository(User)
      .createQueryBuilder()
      .update(User)
      .set({ avatarUrl })
      .where("id = :userId", { userId })
      .andWhere("avatar_url IS NULL")
      .execute();
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

  async updateAvatar(userId: string, avatarUrl: string): Promise<void> {
    await this.update({ id: userId }, { avatarUrl });
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

  searchForAdmin({ term, status, role, cursor, limit }: AdminUserFilters): Promise<User[]> {
    const query = this.createQueryBuilder("user").orderBy("user.id", "DESC").limit(limit);
    if (cursor) query.andWhere("user.id < :cursor", { cursor });
    if (role) query.andWhere("user.role = :role", { role });
    if (status === "locked") query.andWhere("user.locked_at IS NOT NULL");
    if (status === "unverified") query.andWhere("user.locked_at IS NULL AND user.email_verified_at IS NULL");
    if (status === "active") query.andWhere("user.locked_at IS NULL AND user.email_verified_at IS NOT NULL");
    if (term) {
      query.andWhere(
        `(user.full_name LIKE :pattern ESCAPE '\\\\'
          OR user.username LIKE :pattern ESCAPE '\\\\'
          OR user.email LIKE :pattern ESCAPE '\\\\')`,
        { pattern: `%${escapeLike(term)}%` },
      );
    }
    return query.getMany();
  },

  async setLocked(userId: string, locked: boolean): Promise<void> {
    if (!locked) {
      await this.update({ id: userId }, { lockedAt: null });
      return;
    }
    const now = new Date();
    await this.update({ id: userId }, { lockedAt: now, sessionsValidAfter: now });
  },
});
