import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { PasswordField } from "@/components/ui/password-field";
import type { useResetPassword } from "@/hooks/use-reset-password";
import { resetPasswordValidation } from "@/lib/validations/reset-password";

type ResetPasswordFormProps = Pick<
  ReturnType<typeof useResetPassword>,
  "register" | "errors" | "onSubmit" | "passwordValue" | "serverError" | "isLoading"
>;

export function ResetPasswordForm({ register, errors, onSubmit, passwordValue, serverError, isLoading }: ResetPasswordFormProps) {
  return (
    <div className="w-full max-w-md space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-brand-900">Tạo mật khẩu mới</h1>
        <p className="text-sm text-zinc-500">Nhập mật khẩu mới cho tài khoản của bạn.</p>
      </header>

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div className="space-y-3">
          <PasswordField
            id="password"
            label="Mật khẩu mới"
            placeholder="Tạo mật khẩu mới"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password", resetPasswordValidation.password)}
          />
          <PasswordRequirements value={passwordValue} />
        </div>

        <PasswordField
          id="confirmPassword"
          label="Nhập lại mật khẩu mới"
          placeholder="Nhập lại mật khẩu mới"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", resetPasswordValidation.confirmPassword)}
        />

        {serverError && (
          <FormAlert variant="error">
            <p>{serverError}</p>
          </FormAlert>
        )}

        <Button type="submit" size="lg" isLoading={isLoading}>
          {isLoading ? "Đang lưu..." : "Đặt lại mật khẩu"}
        </Button>
      </form>

      <p className="text-center text-sm">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:text-brand-700 hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Quay lại đăng nhập
        </Link>
      </p>
    </div>
  );
}
