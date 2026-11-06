import type { IconType } from "react-icons";
import {
  BsEmojiAngryFill,
  BsEmojiFrownFill,
  BsEmojiLaughingFill,
  BsEmojiSurpriseFill,
  BsHandThumbsUpFill,
  BsHeartFill,
} from "react-icons/bs";
import type { ReactionType } from "@/types/post";

export interface ReactionDefinition {
  type: ReactionType;
  label: string;
  icon: IconType;
  colorClassName: string;
}

export const REACTIONS: ReactionDefinition[] = [
  { type: "like", label: "Thích", icon: BsHandThumbsUpFill, colorClassName: "text-brand-600" },
  { type: "love", label: "Yêu thích", icon: BsHeartFill, colorClassName: "text-rose-500" },
  { type: "haha", label: "Haha", icon: BsEmojiLaughingFill, colorClassName: "text-amber-500" },
  { type: "wow", label: "Ngạc nhiên", icon: BsEmojiSurpriseFill, colorClassName: "text-amber-500" },
  { type: "sad", label: "Buồn", icon: BsEmojiFrownFill, colorClassName: "text-amber-500" },
  { type: "angry", label: "Phẫn nộ", icon: BsEmojiAngryFill, colorClassName: "text-orange-600" },
];

export const REACTION_BY_TYPE = Object.fromEntries(
  REACTIONS.map((reaction) => [reaction.type, reaction]),
) as Record<ReactionType, ReactionDefinition>;
