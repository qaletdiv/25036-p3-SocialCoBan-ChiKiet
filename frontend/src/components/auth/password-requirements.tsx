import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/cn";
import { PASSWORD_REQUIREMENTS } from "@/lib/validations/common";

export function PasswordRequirements({ value }: { value: string }) {
  return (
    <ul className="grid gap-1.5 sm:grid-cols-2" aria-label="Yêu cầu mật khẩu">
      {PASSWORD_REQUIREMENTS.map(({ id, label, test }) => {
        const isMet = test(value);
        return (
          <li key={id} className={cn("flex items-center gap-2 text-xs transition-colors", isMet ? "text-emerald-600" : "text-zinc-500")}>
            {isMet ? <Check className="size-3.5" aria-hidden="true" /> : <Circle className="size-3.5" aria-hidden="true" />}
            <span>{label}</span>
          </li>
        );
      })}
    </ul>
  );
}
