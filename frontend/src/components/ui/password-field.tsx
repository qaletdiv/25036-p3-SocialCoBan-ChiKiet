"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { TextField } from "@/components/ui/text-field";

type PasswordFieldProps = Omit<ComponentProps<typeof TextField>, "type" | "leftIcon" | "rightSlot">;

export function PasswordField(props: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={isVisible ? "text" : "password"}
      leftIcon={<LockKeyhole className="size-4" aria-hidden="true" />}
      rightSlot={
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="flex size-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
        >
          {isVisible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      }
    />
  );
}
