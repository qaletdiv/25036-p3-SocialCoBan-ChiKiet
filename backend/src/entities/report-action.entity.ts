import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { REPORT_DECISIONS, type ReportDecision } from "@/constants/report.constants";

@Entity({ name: "report_actions" })
export class ReportAction {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id: string;

  @Column({ name: "report_id", type: "bigint", unsigned: true })
  reportId: string;

  @Column({ name: "admin_id", type: "bigint", unsigned: true, nullable: true })
  adminId: string | null;

  @Column({ type: "enum", enum: REPORT_DECISIONS })
  decision: ReportDecision;

  @Column({ type: "varchar", length: 500, nullable: true })
  note: string | null;

  @Column({ name: "is_automatic", type: "boolean", default: false })
  isAutomatic: boolean;

  @Column({ name: "content_snapshot", type: "text", nullable: true })
  contentSnapshot: string | null;

  @Column({ name: "snapshot_author_id", type: "bigint", unsigned: true, nullable: true })
  snapshotAuthorId: string | null;

  @CreateDateColumn({ name: "created_at", type: "datetime", precision: 6 })
  createdAt: Date;
}
