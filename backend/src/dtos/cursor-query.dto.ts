import { IsOptional, Matches } from "class-validator";

export class CursorQueryDto {
  @IsOptional()
  @Matches(/^\d{1,20}$/)
  cursor?: string;
}
