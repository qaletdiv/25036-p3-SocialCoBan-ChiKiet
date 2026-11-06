import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "password_reset_tokens" })
export class PasswordResetToken {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id: string;

  @Column({ name: "user_id", type: "bigint", unsigned: true })
  userId: string;

  @Column({ name: "token_hash", type: "char", length: 64, unique: true })
  tokenHash: string;

  @Column({ name: "expires_at", type: "datetime", precision: 6 })
  expiresAt: Date;

  @CreateDateColumn({ name: "created_at", type: "datetime", precision: 6 })
  createdAt: Date;
}
