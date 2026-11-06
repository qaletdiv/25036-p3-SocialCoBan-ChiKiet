import { IsIn } from "class-validator";
import { REACTION_TYPES, type ReactionType } from "@/constants/reaction.constants";

export class SetReactionDto {
  @IsIn(REACTION_TYPES)
  type: ReactionType;
}
