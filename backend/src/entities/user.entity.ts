import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { USER_ROLES, type UserRole } from "@/constants/user-role.constants";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 30, unique: true })
  username: string;

  @Column({ name: "username_changed_at", type: "datetime", precision: 6, nullable: true })
  usernameChangedAt: Date | null;

  @Column({ name: "password_hash", type: "varchar", length: 255, nullable: true, select: false })
  passwordHash: string | null;

  @Column({ name: "full_name", type: "varchar", length: 100 })
  fullName: string;

  @Column({ name: "bio", type: "varchar", length: 160, nullable: true })
  bio: string | null;

  @Column({ name: "avatar_url", type: "varchar", length: 500, nullable: true })
  avatarUrl: string | null;

  @Column({ name: "google_id", type: "varchar", length: 64, nullable: true, unique: true })
  googleId: string | null;

  @Column({ name: "email_verified_at", type: "datetime", precision: 6, nullable: true })
  emailVerifiedAt: Date | null;

  @Column({ name: "sessions_valid_after", type: "datetime", precision: 6, nullable: true })
  sessionsValidAfter: Date | null;

  @Column({ type: "enum", enum: USER_ROLES, default: "user" })
  role: UserRole;

  @Column({ name: "locked_at", type: "datetime", precision: 6, nullable: true })
  lockedAt: Date | null;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt: Date;
}
