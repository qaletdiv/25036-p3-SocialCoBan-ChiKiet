import { Transform } from "class-transformer";
import { IsIn, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { POST_PRIVACY_LEVELS, type PostPrivacy } from "@/constants/privacy.constants";
import { POST_MAX_LENGTH } from "@/constants/post.constants";

export class PostContentDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(POST_MAX_LENGTH)
  content: string;

  @IsIn(POST_PRIVACY_LEVELS)
  privacy: PostPrivacy;
}
