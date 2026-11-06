import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { POST_PRIVACY_LEVELS, type PostPrivacy } from "@/constants/privacy.constants";
import { POST_MAX_LENGTH } from "@/constants/post.constants";

export class SharePostDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(POST_MAX_LENGTH)
  content?: string;

  @IsOptional()
  @IsIn(POST_PRIVACY_LEVELS)
  privacy?: PostPrivacy;
}
