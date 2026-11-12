import { Transform } from "class-transformer";
import { IsIn, IsOptional, Matches } from "class-validator";
import {
  REPORT_REASONS,
  REPORT_STATUSES,
  REPORT_TARGET_TYPES,
  type ReportReason,
  type ReportStatus,
  type ReportTargetType,
} from "@/constants/report.constants";

const emptyToUndefined = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export class AdminReportsQueryDto {
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsIn(REPORT_STATUSES)
  status?: ReportStatus;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsIn(REPORT_TARGET_TYPES)
  type?: ReportTargetType;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsIn(REPORT_REASONS)
  reason?: ReportReason;

  @IsOptional()
  @Matches(/^\d{1,20}$/)
  cursor?: string;
}

export class AdminReportHistoryQueryDto {
  @IsOptional()
  @Matches(/^\d{1,20}$/)
  cursor?: string;
}
