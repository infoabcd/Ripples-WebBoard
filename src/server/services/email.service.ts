import nodemailer from "nodemailer";

import { requireEnv, requireEnvBool, requireEnvInt, requireEnvPresent } from "@/lib/env";

export type SmtpConfig = {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  siteUrl: string;
};

export function getSmtpConfig(): SmtpConfig {
  const enabled = requireEnvBool("NOTIFY_EMAIL_ENABLED");
  const host = requireEnvPresent("SMTP_HOST");
  if (enabled && !host) {
    throw new Error("NOTIFY_EMAIL_ENABLED=true 時必須設定 SMTP_HOST");
  }

  return {
    enabled: enabled && host.length > 0,
    host,
    port: requireEnvInt("SMTP_PORT"),
    secure: requireEnvBool("SMTP_SECURE"),
    user: requireEnvPresent("SMTP_USER"),
    pass: requireEnvPresent("SMTP_PASS"),
    from: requireEnv("SMTP_FROM"),
    siteUrl: requireEnv("SITE_URL"),
  };
}

export function isEmailConfigured(): boolean {
  return getSmtpConfig().enabled;
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const config = getSmtpConfig();
  if (!config.enabled) return;

  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user ? { user: config.user, pass: config.pass } : undefined,
  });

  await transport.sendMail({
    from: config.from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html ?? input.text.replace(/\n/g, "<br>"),
  });
}
