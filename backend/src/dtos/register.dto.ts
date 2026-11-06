import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength } from "class-validator";
import { USERNAME_MAX_LENGTH, USERNAME_PATTERN } from "@/constants/username.constants";
import { STRONG_PASSWORD_PATTERN } from "@/constants/validation.constants";
import { Match } from "@/validators/match.decorator";

export class RegisterDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim().replace(/\s+/g, " ") : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @Matches(USERNAME_PATTERN)
  @MaxLength(USERNAME_MAX_LENGTH)
  username: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @Matches(STRONG_PASSWORD_PATTERN, {
    message: "password must be 8-128 characters with lowercase, uppercase, digit and special character",
  })
  password: string;

  @IsString()
  @Match("password")
  confirmPassword: string;
}
