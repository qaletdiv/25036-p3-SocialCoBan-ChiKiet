import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";
import { POST_MAX_LENGTH } from "@/constants/post.constants";

export class UpdatePostDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MaxLength(POST_MAX_LENGTH)
  content: string;

  @Transform(({ value }) => value === true || value === "true")
  @IsOptional()
  @IsBoolean()
  removeImage?: boolean;
}
