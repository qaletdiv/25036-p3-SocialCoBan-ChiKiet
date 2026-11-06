import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { REACTION_TYPES, type ReactionType } from "@/constants/reaction.constants";

@Entity({ name: "post_reactions" })
@Unique("uq_post_reactions_post_user", ["postId", "userId"])
export class PostReaction {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id: string;

  @Column({ name: "post_id", type: "bigint", unsigned: true })
  postId: string;

  @Column({ name: "user_id", type: "bigint", unsigned: true })
  userId: string;

  @Column({ type: "enum", enum: REACTION_TYPES })
  type: ReactionType;

  @CreateDateColumn({ name: "created_at", type: "datetime", precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime", precision: 6 })
  updatedAt: Date;
}
