import { REACTIONS } from "@/constants/reactions";
import { cn } from "@/lib/cn";
import type { ReactionType } from "@/types/post";

interface ReactionPickerProps {
  selected: ReactionType | null;
  onSelect: (type: ReactionType) => void;
}

export function ReactionPicker({ selected, onSelect }: ReactionPickerProps) {
  return (
    <div
      role="listbox"
      aria-label="Chọn cảm xúc"
      className="flex items-center gap-1 rounded-full border border-brand-100 bg-white p-1.5 shadow-xl shadow-brand-900/15"
    >
      {REACTIONS.map((reaction) => {
        const Icon = reaction.icon;
        const isSelected = selected === reaction.type;
        return (
          <button
            key={reaction.type}
            type="button"
            role="option"
            aria-selected={isSelected}
            aria-label={reaction.label}
            title={reaction.label}
            onClick={() => onSelect(reaction.type)}
            className={cn(
              "flex size-10 items-center justify-center rounded-full transition-transform hover:scale-125 focus-visible:scale-125 focus-visible:outline-none",
              isSelected && "bg-brand-50 ring-2 ring-brand-200",
            )}
          >
            <Icon className={cn("size-7", reaction.colorClassName)} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
