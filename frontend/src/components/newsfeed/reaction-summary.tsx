import { ReactionIcon } from "@/components/newsfeed/reaction-icon";
import { getTopReactions } from "@/lib/reactions";
import type { ReactionSummary as ReactionSummaryData } from "@/types/post";

interface ReactionSummaryProps {
  summary: ReactionSummaryData;
}

export function ReactionSummary({ summary }: ReactionSummaryProps) {
  if (summary.total === 0) return null;

  return (
    <p className="flex items-center gap-1.5 text-sm text-zinc-500">
      <span className="flex items-center -space-x-1">
        {getTopReactions(summary).map((type) => (
          <span
            key={type}
            className="flex size-5 items-center justify-center rounded-full bg-white ring-2 ring-white"
          >
            <ReactionIcon type={type} className="size-4" />
          </span>
        ))}
      </span>
      <span>{summary.total.toLocaleString("vi-VN")}</span>
    </p>
  );
}
