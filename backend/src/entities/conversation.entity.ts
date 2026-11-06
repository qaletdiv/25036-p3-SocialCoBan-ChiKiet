import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

@Entity({ name: "conversations" })
@Unique("uq_conversations_pair", ["userLowId", "userHighId"])
export class Conversation {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id: string;

  @Column({ name: "user_low_id", type: "bigint", unsigned: true })
  userLowId: string;

  @Column({ name: "user_high_id", type: "bigint", unsigned: true })
  userHighId: string;

  @Column({ name: "last_message_id", type: "bigint", unsigned: true, nullable: true })
  lastMessageId: string | null;

  @Column({ name: "user_low_cleared_message_id", type: "bigint", unsigned: true, default: "0" })
  userLowClearedMessageId: string;

  @Column({ name: "user_high_cleared_message_id", type: "bigint", unsigned: true, default: "0" })
  userHighClearedMessageId: string;

  @CreateDateColumn({ name: "created_at", type: "datetime", precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime", precision: 6 })
  updatedAt: Date;
}
