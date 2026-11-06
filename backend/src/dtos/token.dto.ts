import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class TokenDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  token: string;
}
