import { renderActionEmail, type RenderedEmail } from "@/templates/action-email.template";

interface PasswordResetEmailParams {
  fullName: string;
  actionUrl: string;
  expiresInMinutes: number;
}

export const renderPasswordResetEmail = (params: PasswordResetEmailParams): RenderedEmail =>
  renderActionEmail({
    ...params,
    subject: "Đặt lại mật khẩu Kircle của bạn",
    heading: "Đặt lại mật khẩu",
    intro: "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Kircle của bạn. Bấm nút bên dưới để tạo mật khẩu mới.",
    buttonLabel: "Đặt lại mật khẩu",
    ignoreNote: "Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi.",
  });
