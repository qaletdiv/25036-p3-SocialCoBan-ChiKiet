import Link from "next/link";
import { AtSign, Loader2, MailCheck } from "lucide-react";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { PasswordField } from "@/components/ui/password-field";
import { TextField } from "@/components/ui/text-field";
import type { useLogin } from "@/hooks/use-login";
import { loginValidation } from "@/lib/validations/login";

type LoginFormProps = ReturnType<typeof useLogin> & { justRegistered: boolean };

export function LoginForm({
  register,
  errors,
  onSubmit,
  serverError,
  isLoading,
  needsVerification,
  isResending,
  resendNotice,
  resendVerificationEmail,
  justRegistered,
}: LoginFormProps) {
  const isResendSuccess = resendNotice?.type === "success";
  const showRegisteredNotice = justRegistered && !serverError && !isResendSuccess;

  return (
    <div className="w-full max-w-md space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-brand-900">Chào mừng trở lại</h1>
        <p className="text-sm text-zinc-500">Đăng nhập để tiếp tục kết nối với bạn bè của bạn.</p>
      </header>

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <TextField
          id="identifier"
          type="text"
          label="Email hoặc tên đăng nhập"
          placeholder="Nhập email hoặc username"
          autoComplete="username"
          leftIcon={<AtSign className="size-4" aria-hidden="true" />}
          error={errors.identifier?.message}
          {...register("identifier", loginValidation.identifier)}
        />

        <PasswordField
          id="password"
          label="Mật khẩu"
          placeholder="Nhập mật khẩu của bạn"
          autoComplete="current-password"
          error={errors.password?.message}
          labelAside={
            <Link href="/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline">
              Quên mật khẩu?
            </Link>
          }
          {...register("password", loginValidation.password)}
        />

        {showRegisteredNotice && (
          <FormAlert variant="success">
            <p>Đăng ký thành công! Vui lòng kiểm tra email và bấm vào liên kết xác thực để kích hoạt tài khoản trước khi đăng nhập.</p>
          </FormAlert>
        )}

        {isResendSuccess ? (
          <FormAlert variant="success" icon={MailCheck}>
            <p>{resendNotice.text}</p>
          </FormAlert>
        ) : (
          serverError && (
            <FormAlert variant="error">
              <p>{serverError}</p>
              {needsVerification && (
                <button
                  type="button"
                  onClick={() => void resendVerificationEmail()}
                  disabled={isResending}
                  className="inline-flex items-center gap-2 font-semibold text-brand-700 underline-offset-2 hover:underline disabled:opacity-60"
                >
                  {isResending && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
                  {isResending ? "Đang gửi..." : "Gửi lại email xác thực"}
                </button>
              )}
              {resendNotice?.type === "error" && <p className="font-medium">{resendNotice.text}</p>}
            </FormAlert>
          )
        )}

        <Button type="submit" size="lg" isLoading={isLoading}>
          {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>

        <div className="flex items-center gap-4" role="separator">
          <span className="h-px flex-1 bg-brand-100" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">hoặc</span>
          <span className="h-px flex-1 bg-brand-100" />
        </div>

        <GoogleLoginButton disabled={isLoading} />
      </form>

      <p className="text-center text-sm text-zinc-500">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
