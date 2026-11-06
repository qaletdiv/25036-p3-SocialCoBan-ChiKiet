import { cn } from "@/lib/cn";

interface BrandLogoProps {
  className?: string;
  tone?: "dark" | "light";
}

export function BrandLogo({ className, tone = "dark" }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <circle cx="13" cy="18" r="10" fill={tone === "light" ? "#ffffff" : "#6d33e0"} fillOpacity="0.95" />
        <circle cx="23" cy="18" r="10" fill={tone === "light" ? "#d9ccff" : "#bda6ff"} fillOpacity="0.85" />
      </svg>
      <span className={cn("text-2xl font-bold tracking-tight", tone === "light" ? "text-white" : "text-brand-900")}>
        Kircle
      </span>
    </div>
  );
}
