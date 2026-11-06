import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "field-sizing-content max-h-80 min-h-24 w-full resize-none overflow-y-auto rounded-xl border border-brand-100 bg-brand-50/40 px-4 py-3 text-[15px] leading-relaxed text-foreground transition placeholder:text-zinc-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
