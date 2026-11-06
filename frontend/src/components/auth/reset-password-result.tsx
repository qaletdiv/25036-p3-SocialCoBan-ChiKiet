import { StatusPanel } from "@/components/auth/status-panel";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { LinkButton } from "@/components/ui/link-button";
import type { useResetPassword } from "@/hooks/use-reset-password";
import { LOGIN_PATH } from "@/lib/redirect";

type ResetPasswordResultProps = Pick<
  ReturnType<typeof useResetPassword>,
  "step" | "sessionOutcome" | "isRevoking" | "revokeError" | "revokeOtherSessions" | "keepSessions"
>;

export function ResetPasswordResult({
  step,
  sessionOutcome,
  isRevoking,
  revokeError,
  revokeOtherSessions,
  keepSessions,
}: ResetPasswordResultProps) {
  if (step === "decision") {
    return (
      <StatusPanel
        tone="success"
        title="Đặt lại mật khẩu thành công"
        description="Bạn có muốn đăng xuất tài khoản này khỏi tất cả thiết bị khác không? Nếu bạn nghi ngờ có người khác đang sử dụng tài khoản, hãy chọn đăng xuất."
      >
        <div className="space-y-3 text-left">
          {revokeError && (
            <FormAlert variant="error">
              <p>{revokeError}</p>
            </FormAlert>
          )}
          <Button size="lg" onClick={() => void revokeOtherSessions()} isLoading={isRevoking}>
            Đăng xuất khỏi các thiết bị khác
          </Button>
          <Button size="lg" variant="outline" onClick={keepSessions} disabled={isRevoking}>
            Giữ nguyên các phiên đăng nhập
          </Button>
        </div>
      </StatusPanel>
    );
  }

  return (
    <StatusPanel
      tone="success"
      title="Đã hoàn tất"
      description={
        sessionOutcome === "revoked"
          ? "Mật khẩu của bạn đã được thay đổi và các thiết bị khác đã bị đăng xuất. Hãy đăng nhập lại bằng mật khẩu mới."
          : "Mật khẩu của bạn đã được thay đổi. Các phiên đăng nhập hiện có được giữ nguyên. Hãy đăng nhập bằng mật khẩu mới."
      }
    >
      <LinkButton href={LOGIN_PATH}>Đến trang đăng nhập</LinkButton>
    </StatusPanel>
  );
}
