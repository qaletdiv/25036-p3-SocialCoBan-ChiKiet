import { Transform } from "class-transformer";
import { IsString, MaxLength } from "class-validator";
import { POST_MAX_LENGTH } from "@/constants/post.constants";

export class UpdatePostDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MaxLength(POST_MAX_LENGTH)
  content: string;
}
