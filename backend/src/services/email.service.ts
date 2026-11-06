import nodemailer from "nodemailer";
import { env } from "@/config/env";
import type { RenderedEmail } from "@/templates/action-email.template";
import { renderPasswordResetEmail } from "@/templates/password-reset-email.template";
import { renderVerificationEmail } from "@/templates/verification-email.template";
import { AppError } from "@/utils/app-error";

const transporter = nodemailer.createTransport({
  service: env.email.service,
  auth: { user: env.email.user, pass: env.email.password },
});

interface ActionEmailParams {
  to: string;
  fullName: string;
  actionUrl: string;
  expiresInMinutes: number;
}

const deliver = async (to: string, { subject, html, text }: RenderedEmail): Promise<void> => {
  try {
    await transporter.sendMail({ from: `"Kircle" <${env.email.user}>`, to, subject, html, text });
  } catch (error) {
    console.error(`Failed to send email "${subject}"`, error);
    throw AppError.emailDeliveryFailed();
  }
};

export const emailService = {
  sendVerificationEmail: ({ to, ...params }: ActionEmailParams): Promise<void> =>
    deliver(to, renderVerificationEmail(params)),

  sendPasswordResetEmail: ({ to, ...params }: ActionEmailParams): Promise<void> =>
    deliver(to, renderPasswordResetEmail(params)),
};
