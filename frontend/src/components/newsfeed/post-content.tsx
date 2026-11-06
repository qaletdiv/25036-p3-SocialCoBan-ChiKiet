"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

const COLLAPSE_CHAR_LIMIT = 400;
const COLLAPSE_LINE_LIMIT = 8;

interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = content.length > COLLAPSE_CHAR_LIMIT || content.split("\n").length > COLLAPSE_LINE_LIMIT;

  return (
    <div>
      <p
        className={cn(
          "wrap-break-word whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-800",
          isLong && !isExpanded && "line-clamp-6",
        )}
      >
        {content}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="mt-1.5 rounded text-sm font-semibold text-brand-600 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
        >
          {isExpanded ? "Thu gọn" : "Xem thêm"}
        </button>
      )}
    </div>
  );
}
