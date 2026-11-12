import { Transform } from "class-transformer";
import { IsIn, IsNotEmpty, IsString, MaxLength, ValidateIf } from "class-validator";
import { REPORT_DETAIL_MAX_LENGTH, REPORT_REASONS, type ReportReason } from "@/constants/report.constants";

export class ReportContentDto {
  @IsIn(REPORT_REASONS)
  reason: ReportReason;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @ValidateIf((dto: ReportContentDto) => dto.reason === "other")
  @IsString()
  @IsNotEmpty()
  @MaxLength(REPORT_DETAIL_MAX_LENGTH)
  detail?: string;
}
