import { cn } from "@/lib/cn";

type AvatarSize = "sm" | "md" | "lg";

interface UserAvatarProps {
  fullName: string;
  avatarUrl: string | null;
  size?: AvatarSize;
  className?: string;
}

const SIZE_STYLES: Record<AvatarSize, string> = {
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-20 text-2xl",
};

const getInitials = (fullName: string): string => {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0];
  const last = words[words.length - 1];
  return (words.length === 1 ? first.slice(0, 1) : `${first.slice(0, 1)}${last.slice(0, 1)}`).toUpperCase();
};

export function UserAvatar({ fullName, avatarUrl, size = "md", className }: UserAvatarProps) {
  const baseStyles = cn("shrink-0 rounded-full ring-2 ring-white", SIZE_STYLES[size], className);

  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl} alt={fullName} className={cn("object-cover", baseStyles)} />;
  }

  return (
    <span
      role="img"
      aria-label={fullName}
      className={cn(
        "inline-flex items-center justify-center bg-linear-to-br from-brand-400 to-brand-700 font-semibold text-white",
        baseStyles,
      )}
    >
      {getInitials(fullName)}
    </span>
  );
}
