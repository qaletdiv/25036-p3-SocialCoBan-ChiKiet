import bcrypt from "bcryptjs";
import { QueryFailedError, type EntityManager } from "typeorm";
import { AppDataSource } from "@/config/data-source";
import { env } from "@/config/env";
import { EMAIL_VERIFICATION_TTL_MINUTES, PASSWORD_SALT_ROUNDS } from "@/constants/auth.constants";
import type { LoginDto } from "@/dtos/login.dto";
import type { RegisterDto } from "@/dtos/register.dto";
import type { User } from "@/entities/user.entity";
import { emailVerificationTokenRepository } from "@/repositories/email-verification-token.repository";
import { userRepository } from "@/repositories/user.repository";
import { emailService } from "@/services/email.service";
import { AppError } from "@/utils/app-error";
import { signAccessToken, verifyAccessToken } from "@/utils/jwt";
import { generateToken, hashToken, minutesFromNow } from "@/utils/token";

export interface PublicUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  role: User["role"];
}

export interface LoginResult {
  user: PublicUser;
  accessToken: string;
}

// Used to keep response time constant when the email does not exist
const DUMMY_PASSWORD_HASH = bcrypt.hashSync("kircle-dummy-password", 10);
const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  email: user.email,
  username: user.username,
  fullName: user.fullName,
  avatarUrl: user.avatarUrl,
  role: user.role,
});

const isDuplicateEntryError = (error: unknown): error is QueryFailedError =>
  error instanceof QueryFailedError && (error.driverError as { code?: string } | undefined)?.code === "ER_DUP_ENTRY";

const findUserByCredentials = async ({ identifier, password }: LoginDto): Promise<User> => {
  const user = identifier.includes("@")
    ? await userRepository.findByEmailWithPassword(identifier.toLowerCase())
    : await userRepository.findByUsernameWithPassword(identifier);
  const isPasswordValid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);

  if (!user || !user.passwordHash || !isPasswordValid) {
    throw AppError.invalidCredentials();
  }
  return user;
};

// Replaces any previous link; must run inside the caller's transaction so a delivery failure rolls back
const issueVerificationEmail = async (
  user: Pick<User, "id" | "email" | "fullName">,
  manager: EntityManager,
): Promise<void> => {
  const token = generateToken();

  await emailVerificationTokenRepository.deleteAllForUser(user.id, manager);
  await emailVerificationTokenRepository.createForUser(
    { userId: user.id, tokenHash: hashToken(token), expiresAt: minutesFromNow(EMAIL_VERIFICATION_TTL_MINUTES) },
    manager,
  );
  await emailService.sendVerificationEmail({
    to: user.email,
    fullName: user.fullName,
    actionUrl: `${env.clientOrigin}/verify-email?token=${token}`,
    expiresInMinutes: EMAIL_VERIFICATION_TTL_MINUTES,
  });
};

export const authService = {
  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await findUserByCredentials(dto);

    if (user.lockedAt) {
      throw AppError.accountLocked();
    }
    if (!user.emailVerifiedAt) {
      throw AppError.emailNotVerified();
    }

    return { user: toPublicUser(user), accessToken: signAccessToken(user.id) };
  },

  async register({ fullName, username, email, password }: RegisterDto): Promise<void> {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw existingUser.emailVerifiedAt ? AppError.emailAlreadyExists() : AppError.emailPendingVerification();
    }
    if (await userRepository.findByUsername(username)) {
      throw AppError.usernameAlreadyExists();
    }

    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

    try {
      await AppDataSource.transaction(async (manager) => {
        const user = await userRepository.createAccount({ fullName, username, email, passwordHash }, manager);
        await issueVerificationEmail(user, manager);
      });
    } catch (error) {
      if (isDuplicateEntryError(error)) {
        const sqlMessage = (error.driverError as { sqlMessage?: string } | undefined)?.sqlMessage ?? "";
        throw sqlMessage.includes("username") ? AppError.usernameAlreadyExists() : AppError.emailAlreadyExists();
      }
      throw error;
    }
  },

  async resendVerificationEmail(dto: LoginDto): Promise<void> {
    const user = await findUserByCredentials(dto);
    if (user.emailVerifiedAt) {
      throw AppError.emailAlreadyVerified();
    }

    await AppDataSource.transaction((manager) => issueVerificationEmail(user, manager));
  },

  async verifyEmail(token: string): Promise<void> {
    await AppDataSource.transaction(async (manager) => {
      const record = await emailVerificationTokenRepository.findByHash(hashToken(token), manager);
      if (!record || record.expiresAt.getTime() < Date.now()) {
        throw AppError.invalidVerificationToken();
      }

      await userRepository.markEmailVerified(record.userId, manager);
      await emailVerificationTokenRepository.deleteAllForUser(record.userId, manager);
    });
  },

  // Resolves the user id of a valid, non-revoked session token
  async authenticate(token: string): Promise<string> {
    let session: { userId: string; issuedAt: number };
    try {
      session = verifyAccessToken(token);
    } catch {
      throw AppError.unauthorized("Invalid or expired session");
    }

    const user = await userRepository.findById(session.userId);
    if (!user) {
      throw AppError.unauthorized("Account no longer exists");
    }
    if (user.lockedAt) {
      throw AppError.accountLocked();
    }

    const revokedBefore = user.sessionsValidAfter ? Math.floor(user.sessionsValidAfter.getTime() / 1000) : 0;
    if (session.issuedAt < revokedBefore) {
      throw AppError.unauthorized("Session has been revoked");
    }
    return user.id;
  },

  async getCurrentUser(userId: string): Promise<PublicUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.unauthorized("Account no longer exists");
    }
    return toPublicUser(user);
  },
};
