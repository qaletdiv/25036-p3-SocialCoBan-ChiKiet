import { Globe, Lock, Users, type LucideIcon } from "lucide-react";
import type { PostPrivacy } from "@/constants/privacy";
import { cn } from "@/lib/cn";

interface PrivacyOption {
  value: PostPrivacy;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const PRIVACY_OPTIONS: PrivacyOption[] = [
  { value: "public", label: "Công khai", description: "Mọi người đều xem được", icon: Globe },
  { value: "followers", label: "Người theo dõi", description: "Chỉ người đang theo dõi bạn", icon: Users },
  { value: "only_me", label: "Chỉ mình tôi", description: "Chỉ bạn xem được bài này", icon: Lock },
];

export const PRIVACY_LABELS: Record<PostPrivacy, string> = {
  public: "Công khai",
  followers: "Người theo dõi",
  only_me: "Chỉ mình tôi",
};

interface PrivacyPickerProps {
  value: PostPrivacy;
  disabled?: boolean;
  onChange: (value: PostPrivacy) => void;
}

export function PrivacyPicker({ value, disabled = false, onChange }: PrivacyPickerProps) {
  return (
    <fieldset disabled={disabled}>
      <legend className="sr-only">Quyền riêng tư</legend>
      <div className="flex flex-wrap gap-2">
        {PRIVACY_OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              title={option.description}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                selected
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-brand-100 bg-white text-zinc-600 hover:border-brand-200 hover:bg-brand-50/60",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="radio"
                name="privacy"
                className="sr-only"
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
              />
              <Icon className="size-4" aria-hidden="true" />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
