import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, Matches, MaxLength, ValidateIf } from "class-validator";
import { PROFILE_BIO_MAX_LENGTH, PROFILE_NAME_MAX_LENGTH } from "@/constants/profile.constants";
import { USERNAME_MAX_LENGTH, USERNAME_PATTERN } from "@/constants/username.constants";

export class UpdateProfileDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim().replace(/\s+/g, " ") : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(PROFILE_NAME_MAX_LENGTH)
  fullName: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @Matches(USERNAME_PATTERN)
  @MaxLength(USERNAME_MAX_LENGTH)
  username: string;

  @Transform(({ value }) => {
    if (value === null) return null;
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  })
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(PROFILE_BIO_MAX_LENGTH)
  bio: string | null;
}
