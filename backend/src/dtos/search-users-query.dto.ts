import { Transform } from "class-transformer";
import { IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { SEARCH_QUERY_MAX_LENGTH } from "@/constants/search.constants";

export class SearchUsersQueryDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(SEARCH_QUERY_MAX_LENGTH)
  q: string;

  @IsOptional()
  @Matches(/^\d{1,20}$/)
  cursor?: string;
}
