import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type FormAlertVariant = "error" | "success";

interface FormAlertProps {
  variant: FormAlertVariant;
  icon?: LucideIcon;
  children: ReactNode;
}

const VARIANT_STYLES: Record<FormAlertVariant, { container: string; defaultIcon: LucideIcon; role: "alert" | "status" }> = {
  error: { container: "border-rose-200 bg-rose-50 text-rose-700", defaultIcon: AlertCircle, role: "alert" },
  success: { container: "border-emerald-200 bg-emerald-50 text-emerald-800", defaultIcon: CheckCircle2, role: "status" },
};

export function FormAlert({ variant, icon, children }: FormAlertProps) {
  const { container, defaultIcon, role } = VARIANT_STYLES[variant];
  const Icon = icon ?? defaultIcon;

  return (
    <div role={role} className={cn("flex items-start gap-3 rounded-xl border px-4 py-3 text-sm", container)}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1 space-y-2">{children}</div>
    </div>
  );
}
