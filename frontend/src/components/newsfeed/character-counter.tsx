import { POST_MAX_LENGTH } from "@/constants/post";
import { cn } from "@/lib/cn";

interface CharacterCounterProps {
  length: number;
  maxLength?: number;
}

export function CharacterCounter({ length, maxLength = POST_MAX_LENGTH }: CharacterCounterProps) {
  const isOver = length > maxLength;

  return (
    <span
      className={cn("text-xs tabular-nums", isOver ? "font-semibold text-rose-600" : "text-zinc-400")}
      aria-live="polite"
    >
      {length.toLocaleString("vi-VN")}/{maxLength.toLocaleString("vi-VN")}
    </span>
  );
}
