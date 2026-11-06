import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { REPORT_REASONS, type ReportReason } from "@/constants/report.constants";

@Entity({ name: "post_reports" })
@Unique("uq_post_reports_post_user", ["postId", "userId"])
export class PostReport {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id: string;

  @Column({ name: "post_id", type: "bigint", unsigned: true })
  postId: string;

  @Column({ name: "user_id", type: "bigint", unsigned: true })
  userId: string;

  @Column({ type: "enum", enum: REPORT_REASONS })
  reason: ReportReason;

  @Column({ type: "varchar", length: 500, nullable: true })
  detail: string | null;

  @CreateDateColumn({ name: "created_at", type: "datetime", precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime", precision: 6 })
  updatedAt: Date;
}
