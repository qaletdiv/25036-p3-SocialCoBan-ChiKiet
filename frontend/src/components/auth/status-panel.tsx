import type { ReactNode } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

type StatusTone = "loading" | "success" | "error";

interface StatusPanelProps {
  tone: StatusTone;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function StatusPanel({ tone, title, description, children }: StatusPanelProps) {
  return (
    <div className="w-full max-w-md space-y-6 text-center" role="status">
      {tone === "loading" && <Loader2 className="mx-auto size-12 animate-spin text-brand-600" aria-hidden="true" />}
      {tone === "success" && (
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="size-9 text-emerald-600" aria-hidden="true" />
        </span>
      )}
      {tone === "error" && (
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-rose-50">
          <XCircle className="size-9 text-rose-600" aria-hidden="true" />
        </span>
      )}

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-brand-900">{title}</h1>
        {description && <p className="text-sm text-zinc-500">{description}</p>}
      </div>

      {children}
    </div>
  );
}
