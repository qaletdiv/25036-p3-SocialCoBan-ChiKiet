import { IsOptional, Matches } from "class-validator";

export class MessageListQueryDto {
  @IsOptional()
  @Matches(/^\d{1,20}$/)
  cursor?: string;

  @IsOptional()
  @Matches(/^\d{1,20}$/)
  after?: string;

  @IsOptional()
  @Matches(/^\d{1,20}$/)
  focus?: string;
}
