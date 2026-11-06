import { Transform } from "class-transformer";
import { IsIn, IsInt, IsOptional, Matches, Max, Min } from "class-validator";
import { PROFILE_POST_KINDS, type ProfilePostKind } from "@/constants/profile.constants";
import { FEED_MAX_PAGE_SIZE } from "@/constants/post.constants";

export class ProfilePostsQueryDto {
  @IsIn(PROFILE_POST_KINDS)
  kind: ProfilePostKind;

  @IsOptional()
  @Matches(/^\d{1,20}$/)
  cursor?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? Number(value) : value))
  @IsInt()
  @Min(1)
  @Max(FEED_MAX_PAGE_SIZE)
  limit?: number;
}
