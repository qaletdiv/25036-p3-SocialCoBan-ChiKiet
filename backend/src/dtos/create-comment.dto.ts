import { IsOptional, Matches } from "class-validator";
import { CommentContentDto } from "@/dtos/comment-content.dto";

export class CreateCommentDto extends CommentContentDto {
  @IsOptional()
  @Matches(/^\d{1,20}$/)
  parentId?: string;
}
