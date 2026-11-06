import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "messages" })
export class Message {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id: string;

  @Column({ name: "conversation_id", type: "bigint", unsigned: true })
  conversationId: string;

  @Column({ name: "sender_id", type: "bigint", unsigned: true })
  senderId: string;

  @Column({ type: "text" })
  content: string;

  @Column({ name: "seen_at", type: "datetime", precision: 6, nullable: true })
  seenAt: Date | null;

  @Column({ name: "recalled_at", type: "datetime", precision: 6, nullable: true })
  recalledAt: Date | null;

  @CreateDateColumn({ name: "created_at", type: "datetime", precision: 6 })
  createdAt: Date;
}
