import { Loader2 } from "lucide-react";

interface FullPageLoaderProps {
  message?: string;
}

export function FullPageLoader({ message = "Đang tải..." }: FullPageLoaderProps) {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 text-brand-700" role="status">
      <Loader2 className="size-8 animate-spin" aria-hidden="true" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
