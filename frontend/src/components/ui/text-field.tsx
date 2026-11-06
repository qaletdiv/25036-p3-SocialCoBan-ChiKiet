import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface TextFieldProps extends ComponentProps<"input"> {
  id: string;
  label: string;
  error?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  labelAside?: ReactNode;
}

export function TextField({ id, label, error, leftIcon, rightSlot, labelAside, className, ...props }: TextFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-brand-400">
            {leftIcon}
          </span>
        )}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-12 w-full rounded-xl border bg-white px-4 text-sm text-foreground shadow-sm transition-all duration-200 placeholder:text-zinc-400 focus:outline-none focus:ring-4",
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
              : "border-brand-100 hover:border-brand-200 focus:border-brand-500 focus:ring-brand-100",
            leftIcon && "pl-11",
            rightSlot && "pr-12",
            className,
          )}
          {...props}
        />
        {rightSlot && <span className="absolute inset-y-0 right-0 flex items-center pr-2">{rightSlot}</span>}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
