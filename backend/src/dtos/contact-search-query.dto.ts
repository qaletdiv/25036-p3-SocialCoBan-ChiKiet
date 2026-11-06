import { Transform } from "class-transformer";
import { IsString, MaxLength, MinLength } from "class-validator";
import { SEARCH_QUERY_MAX_LENGTH } from "@/constants/search.constants";

export class ContactSearchQueryDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(SEARCH_QUERY_MAX_LENGTH)
  q: string;
}
