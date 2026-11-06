import bcrypt from "bcryptjs";
import { AppDataSource } from "@/config/data-source";
import { env } from "@/config/env";
import {
  PASSWORD_RESET_COOLDOWN_SECONDS,
  PASSWORD_RESET_TTL_MINUTES,
  PASSWORD_SALT_ROUNDS,
} from "@/constants/auth.constants";
import type { ResetPasswordDto } from "@/dtos/reset-password.dto";
import { emailVerificationTokenRepository } from "@/repositories/email-verification-token.repository";
import { passwordResetTokenRepository } from "@/repositories/password-reset-token.repository";
import { userRepository } from "@/repositories/user.repository";
import { realtimeGateway } from "@/realtime/realtime.gateway";
import { emailService } from "@/services/email.service";
import { AppError } from "@/utils/app-error";
import { signSessionRevocationToken, verifySessionRevocationToken } from "@/utils/jwt";
import { generateToken, hashToken, minutesFromNow } from "@/utils/token";

export const passwordResetService = {
  // Never throws and is not awaited by the controller, so the response is identical
  // (and equally fast) whether or not the email belongs to an account
  async requestReset(email: string): Promise<void> {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) return;

      const latest = await passwordResetTokenRepository.findLatestForUser(user.id);
      if (latest && Date.now() - latest.createdAt.getTime() < PASSWORD_RESET_COOLDOWN_SECONDS * 1000) return;

      const token = generateToken();
      await AppDataSource.transaction(async (manager) => {
        await passwordResetTokenRepository.deleteAllForUser(user.id, manager);
        await passwordResetTokenRepository.createForUser(
          { userId: user.id, tokenHash: hashToken(token), expiresAt: minutesFromNow(PASSWORD_RESET_TTL_MINUTES) },
          manager,
        );
        await emailService.sendPasswordResetEmail({
          to: user.email,
          fullName: user.fullName,
          actionUrl: `${env.clientOrigin}/reset-password?token=${token}`,
          expiresInMinutes: PASSWORD_RESET_TTL_MINUTES,
        });
      });
    } catch (error) {
      console.error("Failed to process password reset request", error);
    }
  },

  async validateToken(token: string): Promise<void> {
    const record = await passwordResetTokenRepository.findByHash(hashToken(token));
    if (!record || record.expiresAt.getTime() < Date.now()) {
      throw AppError.invalidResetToken();
    }
  },

  // Returns a short-lived token that lets the user decide whether to revoke other sessions
  async resetPassword({ token, password }: ResetPasswordDto): Promise<string> {
    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

    return AppDataSource.transaction(async (manager) => {
      const record = await passwordResetTokenRepository.consumeByHash(hashToken(token), manager);
      if (!record) {
        throw AppError.invalidResetToken();
      }

      await userRepository.updatePassword(record.userId, passwordHash, manager);
      await passwordResetTokenRepository.deleteAllForUser(record.userId, manager);
      await emailVerificationTokenRepository.deleteAllForUser(record.userId, manager);
      return signSessionRevocationToken(record.userId);
    });
  },

  async revokeSessions(token: string): Promise<void> {
    let userId: string;
    try {
      userId = verifySessionRevocationToken(token);
    } catch {
      throw AppError.invalidSessionRevocationToken();
    }
    await userRepository.revokeSessions(userId);
    realtimeGateway.disconnectUser(userId);
  },
};
