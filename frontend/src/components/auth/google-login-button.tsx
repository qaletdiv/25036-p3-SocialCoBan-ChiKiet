import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";

interface GoogleLoginButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

export function GoogleLoginButton({ onClick, disabled }: GoogleLoginButtonProps) {
  return (
    <Button type="button" variant="outline" onClick={onClick} disabled={disabled}>
      <FcGoogle className="size-5" aria-hidden="true" />
      Đăng nhập bằng Google
    </Button>
  );
}
