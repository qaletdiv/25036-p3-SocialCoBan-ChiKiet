import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import {
  REPORT_HANDLE_ACTIONS,
  REPORT_NOTE_MAX_LENGTH,
  type ReportHandleAction,
} from "@/constants/report.constants";

export class HandleReportDto {
  @IsIn(REPORT_HANDLE_ACTIONS)
  action: ReportHandleAction;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(REPORT_NOTE_MAX_LENGTH)
  note?: string;
}
