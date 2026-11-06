import { IsNotEmpty, IsString, Matches, MaxLength } from "class-validator";
import { STRONG_PASSWORD_PATTERN } from "@/constants/validation.constants";
import { Match } from "@/validators/match.decorator";

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  token: string;

  @IsString()
  @Matches(STRONG_PASSWORD_PATTERN, {
    message: "password must be 8-128 characters with lowercase, uppercase, digit and special character",
  })
  password: string;

  @IsString()
  @Match("password")
  confirmPassword: string;
}
