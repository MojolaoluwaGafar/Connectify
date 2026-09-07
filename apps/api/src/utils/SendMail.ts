import nodemailer from "nodemailer";
import { BrevoClient } from "@getbrevo/brevo";
import { env } from "../config/env.js";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const brevoApiKey = env.BREVO_API_KEY;
const fromAddress = env.EMAIL_FROM;
const brevoClient = brevoApiKey
  ? new BrevoClient({ apiKey: brevoApiKey })
  : null;

const createTransporter = () => {
  const user = env.APP_EMAIL;
  const pass = env.APP_PASSWORD.replace(/\s+/g, "").trim();
  const host = env.SMTP_HOST;
  const port = env.SMTP_PORT;
  const secure = env.SMTP_SECURE;

  if (!user || !pass) {
    throw new Error("Email credentials are not configured.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    requireTLS: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    family: 4,
  } as any);
};

const sendWithBrevo = async (
  to: string,
  subject: string,
  html: string,
) => {
  if (!brevoClient || !fromAddress) {
    return false;
  }

  await brevoClient.transactionalEmails.sendTransacEmail({
    sender: {
      email: fromAddress,
      name: "Connectify",
    },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  });

  console.log("Email sent via Brevo");
  return true;
};

export const SendEmail = async ({ to, subject, html }: EmailOptions) => {
  if (brevoClient && fromAddress) {
    try {
      await sendWithBrevo(to, subject, html);
      return { accepted: [to], rejected: [], response: "Email sent via Brevo" };
    } catch (error: any) {
      console.error("Brevo email failed:", error?.message || error);
      throw new Error("Failed to send email via Brevo.");
    }
  }

  if (env.NODE_ENV === "production") {
    console.warn("Production email delivery skipped because no valid mail provider is configured.");
    return {
      accepted: [to],
      rejected: [],
      response: "Production email delivery skipped because no valid mail provider is configured.",
    };
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"Connectify" <${env.APP_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent : ${info.response}`);
    return info;
  } catch (error: any) {
    console.error("Email failed to send:", error.message);
    if (error?.code) {
      console.error("SMTP code:", error.code);
    }
    if (error?.response) {
      console.error("SMTP response:", error.response);
    }

    throw new Error("Failed to send email.");
  }
};
