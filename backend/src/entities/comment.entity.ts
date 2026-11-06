import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "@/entities/user.entity";

@Entity({ name: "comments" })
export class Comment {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id: string;

  @Column({ name: "post_id", type: "bigint", unsigned: true })
  postId: string;

  @Column({ name: "user_id", type: "bigint", unsigned: true })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "user_id" })
  author: User;

  @Column({ name: "parent_id", type: "bigint", unsigned: true, nullable: true })
  parentId: string | null;

  @Column({ type: "text" })
  content: string;

  @Column({ name: "edited_at", type: "datetime", precision: 6, nullable: true })
  editedAt: Date | null;

  @CreateDateColumn({ name: "created_at", type: "datetime", precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime", precision: 6 })
  updatedAt: Date;
}
