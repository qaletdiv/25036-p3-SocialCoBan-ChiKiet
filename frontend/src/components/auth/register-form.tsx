import Link from "next/link";
import { AtSign, Mail, UserRound } from "lucide-react";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { PasswordField } from "@/components/ui/password-field";
import { TextField } from "@/components/ui/text-field";
import type { useRegister } from "@/hooks/use-register";
import { registerValidation } from "@/lib/validations/register";

type RegisterFormProps = ReturnType<typeof useRegister>;

export function RegisterForm({ register, errors, onSubmit, passwordValue, serverError, isLoading }: RegisterFormProps) {
  return (
    <div className="w-full max-w-md space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-brand-900">Tạo tài khoản mới</h1>
        <p className="text-sm text-zinc-500">Tham gia Kircle để kết nối với bạn bè và chia sẻ khoảnh khắc.</p>
      </header>

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <TextField
          id="fullName"
          label="Họ và tên"
          placeholder="Nguyễn Văn A"
          autoComplete="name"
          leftIcon={<UserRound className="size-4" aria-hidden="true" />}
          error={errors.fullName?.message}
          {...register("fullName", registerValidation.fullName)}
        />

        <TextField
          id="username"
          label="Tên đăng nhập"
          placeholder="ten_dang_nhap"
          autoComplete="username"
          leftIcon={<AtSign className="size-4" aria-hidden="true" />}
          error={errors.username?.message}
          {...register("username", registerValidation.username)}
        />

        <TextField
          id="email"
          type="email"
          label="Email"
          placeholder="ten@example.com"
          autoComplete="email"
          leftIcon={<Mail className="size-4" aria-hidden="true" />}
          error={errors.email?.message}
          {...register("email", registerValidation.email)}
        />

        <div className="space-y-3">
          <PasswordField
            id="password"
            label="Mật khẩu"
            placeholder="Tạo mật khẩu của bạn"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password", registerValidation.password)}
          />
          <PasswordRequirements value={passwordValue} />
        </div>

        <PasswordField
          id="confirmPassword"
          label="Nhập lại mật khẩu"
          placeholder="Nhập lại mật khẩu"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", registerValidation.confirmPassword)}
        />

        {serverError && (
          <FormAlert variant="error">
            <p>{serverError}</p>
          </FormAlert>
        )}

        <Button type="submit" size="lg" isLoading={isLoading}>
          {isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
