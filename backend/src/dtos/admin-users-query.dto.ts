import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString, Matches, MaxLength } from "class-validator";
import { ACCOUNT_STATUSES, type AccountStatus } from "@/constants/account-status.constants";
import { SEARCH_QUERY_MAX_LENGTH } from "@/constants/search.constants";
import { USER_ROLES, type UserRole } from "@/constants/user-role.constants";

const emptyToUndefined = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export class AdminUsersQueryDto {
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(SEARCH_QUERY_MAX_LENGTH)
  q?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsIn(ACCOUNT_STATUSES)
  status?: AccountStatus;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsIn(USER_ROLES)
  role?: UserRole;

  @IsOptional()
  @Matches(/^\d{1,20}$/)
  cursor?: string;
}
