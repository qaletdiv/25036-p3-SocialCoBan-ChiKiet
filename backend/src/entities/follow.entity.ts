import { CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "follows" })
export class Follow {
  @PrimaryColumn({ name: "follower_id", type: "bigint", unsigned: true })
  followerId: string;

  @PrimaryColumn({ name: "following_id", type: "bigint", unsigned: true })
  followingId: string;

  @CreateDateColumn({ name: "created_at", type: "datetime", precision: 6 })
  createdAt: Date;
}
