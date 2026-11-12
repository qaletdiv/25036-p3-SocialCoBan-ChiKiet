import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import {
  REPORT_REASONS,
  REPORT_STATUSES,
  REPORT_TARGET_TYPES,
  type ReportReason,
  type ReportStatus,
  type ReportTargetType,
} from "@/constants/report.constants";

@Entity({ name: "content_reports" })
@Unique("uq_content_reports_post_user", ["postId", "userId"])
@Unique("uq_content_reports_comment_user", ["commentId", "userId"])
export class ContentReport {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id: string;

  @Column({ name: "target_type", type: "enum", enum: REPORT_TARGET_TYPES })
  targetType: ReportTargetType;

  @Column({ name: "post_id", type: "bigint", unsigned: true, nullable: true })
  postId: string | null;

  @Column({ name: "comment_id", type: "bigint", unsigned: true, nullable: true })
  commentId: string | null;

  @Column({ name: "user_id", type: "bigint", unsigned: true })
  userId: string;

  @Column({ type: "enum", enum: REPORT_REASONS })
  reason: ReportReason;

  @Column({ type: "varchar", length: 500, nullable: true })
  detail: string | null;

  @Column({ type: "enum", enum: REPORT_STATUSES, default: "pending" })
  status: ReportStatus;

  @CreateDateColumn({ name: "created_at", type: "datetime", precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime", precision: 6 })
  updatedAt: Date;
}
