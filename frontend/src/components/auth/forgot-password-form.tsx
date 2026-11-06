import Link from "next/link";
import { ArrowLeft, Mail, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { TextField } from "@/components/ui/text-field";
import type { useForgotPassword } from "@/hooks/use-forgot-password";
import { forgotPasswordValidation } from "@/lib/validations/forgot-password";

type ForgotPasswordFormProps = ReturnType<typeof useForgotPassword>;

export function ForgotPasswordForm({ register, errors, onSubmit, serverError, isSent, isLoading }: ForgotPasswordFormProps) {
  return (
    <div className="w-full max-w-md space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-brand-900">Quên mật khẩu?</h1>
        <p className="text-sm text-zinc-500">
          Nhập email bạn đã dùng để đăng ký. Chúng tôi sẽ gửi liên kết giúp bạn đặt lại mật khẩu.
        </p>
      </header>

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <TextField
          id="email"
          type="email"
          label="Email"
          placeholder="ten@example.com"
          autoComplete="email"
          leftIcon={<Mail className="size-4" aria-hidden="true" />}
          error={errors.email?.message}
          {...register("email", forgotPasswordValidation.email)}
        />

        {isSent && (
          <FormAlert variant="success" icon={MailCheck}>
            <p>
              Nếu email này đã được đăng ký, chúng tôi đã gửi liên kết đặt lại mật khẩu đến hộp thư của bạn. Vui lòng kiểm
              tra email (kể cả thư rác). Liên kết có hiệu lực trong 15 phút.
            </p>
          </FormAlert>
        )}

        {serverError && (
          <FormAlert variant="error">
            <p>{serverError}</p>
          </FormAlert>
        )}

        <Button type="submit" size="lg" isLoading={isLoading}>
          {isLoading ? "Đang gửi..." : "Gửi liên kết khôi phục"}
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
