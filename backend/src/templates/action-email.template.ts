export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

interface ActionEmailParams {
  subject: string;
  heading: string;
  fullName: string;
  intro: string;
  buttonLabel: string;
  actionUrl: string;
  expiresInMinutes: number;
  ignoreNote: string;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const renderActionEmail = (params: ActionEmailParams): RenderedEmail => {
  const { subject, heading, fullName, intro, buttonLabel, actionUrl, expiresInMinutes, ignoreNote } = params;
  const safeUrl = escapeHtml(actionUrl);

  const html = `<!DOCTYPE html>
<html lang="vi">
<body style="margin:0;padding:0;background-color:#f5f2ff;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f2ff;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#2a1163,#6d33e0);background-color:#3f1a8a;padding:28px 32px;">
              <span style="font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Kircle</span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 12px 32px;color:#1e1536;">
              <h1 style="margin:0 0 16px 0;font-size:22px;line-height:1.3;color:#2a1163;">${escapeHtml(heading)}</h1>
              <p style="margin:0 0 12px 0;font-size:15px;line-height:1.6;">Xin chào <strong>${escapeHtml(fullName)}</strong>,</p>
              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;">${escapeHtml(intro)}</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 32px 24px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" bgcolor="#6d33e0" style="border-radius:12px;">
                    <a href="${safeUrl}" target="_blank" style="display:inline-block;padding:14px 36px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;background-color:#6d33e0;">
                      ${escapeHtml(buttonLabel)}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px 32px;color:#52496b;">
              <p style="margin:0 0 12px 0;font-size:13px;line-height:1.6;">
                Liên kết có hiệu lực trong <strong>${expiresInMinutes} phút</strong>. Nếu nút không hoạt động, hãy sao chép đường dẫn sau và dán vào trình duyệt:
              </p>
              <p style="margin:0 0 20px 0;font-size:12px;line-height:1.5;word-break:break-all;color:#6d33e0;">${safeUrl}</p>
              <p style="margin:0;font-size:13px;line-height:1.6;">${escapeHtml(ignoreNote)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `Xin chào ${fullName},`,
    "",
    intro,
    actionUrl,
    "",
    `Liên kết có hiệu lực trong ${expiresInMinutes} phút.`,
    ignoreNote,
  ].join("\n");

  return { subject, html, text };
};
