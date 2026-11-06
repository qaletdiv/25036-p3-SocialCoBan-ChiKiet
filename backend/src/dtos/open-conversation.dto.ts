import { Matches } from "class-validator";

export class OpenConversationDto {
  @Matches(/^\d{1,20}$/)
  userId: string;
}
