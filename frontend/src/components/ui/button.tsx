import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex w-full items-center justify-center gap-2.5 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "bg-linear-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/25 hover:from-brand-700 hover:to-brand-600 hover:shadow-brand-600/35 focus-visible:ring-brand-200",
        outline:
          "border border-brand-100 bg-white text-foreground shadow-sm hover:border-brand-200 hover:bg-brand-50 focus-visible:ring-brand-100",
        danger:
          "bg-rose-600 text-white shadow-lg shadow-rose-600/25 hover:bg-rose-700 focus-visible:ring-rose-200",
        ghost: "w-auto text-brand-700 hover:bg-brand-50 focus-visible:ring-brand-100",
      },
      size: {
        md: "h-11 px-5",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

interface ButtonProps extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export function Button({ className, variant, size, isLoading = false, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
