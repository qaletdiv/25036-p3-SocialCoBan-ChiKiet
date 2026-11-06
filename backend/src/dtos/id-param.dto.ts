import { Matches } from "class-validator";

export class IdParamDto {
  @Matches(/^\d{1,20}$/)
  id: string;
}
