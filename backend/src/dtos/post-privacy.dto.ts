import { IsIn } from "class-validator";
import { POST_PRIVACY_LEVELS, type PostPrivacy } from "@/constants/privacy.constants";

export class PostPrivacyDto {
  @IsIn(POST_PRIVACY_LEVELS)
  privacy: PostPrivacy;
}
