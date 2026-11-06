import { Matches } from "class-validator";

export class MessageParamDto {
  @Matches(/^\d{1,20}$/)
  id: string;

  @Matches(/^\d{1,20}$/)
  messageId: string;
}
