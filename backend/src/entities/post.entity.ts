import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import type { PostPrivacy } from "@/constants/privacy.constants";
import { User } from "@/entities/user.entity";

@Entity({ name: "posts" })
export class Post {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id: string;

  @Column({ name: "user_id", type: "bigint", unsigned: true })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "user_id" })
  author: User;

  @Column({ type: "text" })
  content: string;

  @Column({ name: "shared_post_id", type: "bigint", unsigned: true, nullable: true })
  sharedPostId: string | null;

  @Column({ type: "enum", enum: ["public", "followers", "only_me"], default: "public" })
  privacy: PostPrivacy;

  @Column({ name: "edited_at", type: "datetime", precision: 6, nullable: true })
  editedAt: Date | null;

  @DeleteDateColumn({ name: "deleted_at", type: "datetime", precision: 6 })
  deletedAt: Date | null;

  @Column({ name: "removed_by_moderation", type: "boolean", default: false })
  removedByModeration: boolean;

  @CreateDateColumn({ name: "created_at", type: "datetime", precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime", precision: 6 })
  updatedAt: Date;
}
