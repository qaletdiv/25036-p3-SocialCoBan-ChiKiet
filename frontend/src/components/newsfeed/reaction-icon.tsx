import { REACTION_BY_TYPE } from "@/constants/reactions";
import { cn } from "@/lib/cn";
import type { ReactionType } from "@/types/post";

interface ReactionIconProps {
  type: ReactionType;
  className?: string;
}

export function ReactionIcon({ type, className }: ReactionIconProps) {
  const reaction = REACTION_BY_TYPE[type];
  const Icon = reaction.icon;
  return <Icon className={cn(reaction.colorClassName, className)} aria-hidden="true" />;
}
