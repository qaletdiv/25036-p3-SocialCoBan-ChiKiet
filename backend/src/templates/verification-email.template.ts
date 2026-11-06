import { renderActionEmail, type RenderedEmail } from "@/templates/action-email.template";

interface VerificationEmailParams {
  fullName: string;
  actionUrl: string;
  expiresInMinutes: number;
}

export const renderVerificationEmail = (params: VerificationEmailParams): RenderedEmail =>
  renderActionEmail({
    ...params,
    subject: "Xác thực tài khoản Kircle của bạn",
    heading: "Xác thực địa chỉ email của bạn",
    intro: "Cảm ơn bạn đã đăng ký tài khoản Kircle. Vui lòng bấm nút bên dưới để xác thực email và kích hoạt tài khoản của bạn.",
    buttonLabel: "Xác thực tài khoản",
    ignoreNote: "Nếu bạn không thực hiện đăng ký này, hãy bỏ qua email này.",
  });
