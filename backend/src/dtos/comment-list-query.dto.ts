import { Transform } from "class-transformer";
import { IsInt, IsOptional, Matches, Max, Min } from "class-validator";
import { COMMENT_MAX_PAGE_SIZE } from "@/constants/comment.constants";

export class CommentListQueryDto {
  @IsOptional()
  @Matches(/^\d{1,20}$/)
  cursor?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? Number(value) : value))
  @IsInt()
  @Min(1)
  @Max(COMMENT_MAX_PAGE_SIZE)
  limit?: number;
}
