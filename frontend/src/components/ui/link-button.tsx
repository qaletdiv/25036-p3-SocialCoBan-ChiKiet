import type { ComponentProps } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function LinkButton({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "inline-flex h-12 w-full items-center justify-center rounded-xl bg-linear-to-r from-brand-600 to-brand-500 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:from-brand-700 hover:to-brand-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200",
        className,
      )}
      {...props}
    />
  );
}
