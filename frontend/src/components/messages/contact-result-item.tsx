import { Loader2 } from "lucide-react";
import { UserAvatar } from "@/components/common/user-avatar";
import type { ChatParticipant } from "@/types/conversation";

interface ContactResultItemProps {
  contact: ChatParticipant;
  isOpening: boolean;
  disabled: boolean;
  onSelect: () => void;
}

export function ContactResultItem({ contact, isOpening, disabled, onSelect }: ContactResultItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 disabled:opacity-60"
      >
        <UserAvatar fullName={contact.fullName} avatarUrl={contact.avatarUrl} />
        <span className="min-w-0 flex-1 truncate font-semibold text-brand-900">{contact.fullName}</span>
        {isOpening && <Loader2 className="size-4 shrink-0 animate-spin text-brand-600" aria-hidden="true" />}
      </button>
    </li>
  );
}
