function missing(name: string): never {
  throw new Error(`缺少必填環境變數：${name}`);
}

/** 必須存在且不可為空字串 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    missing(name);
  }
  return value.trim();
}

/** 必須存在於環境中，允許空字串 */
export function requireEnvPresent(name: string): string {
  const value = process.env[name];
  if (value === undefined) {
    missing(name);
  }
  return value.trim();
}

export function requireEnvBool(name: string): boolean {
  const value = requireEnv(name).toLowerCase();
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${name} 必須為 true 或 false`);
}

export function requireEnvInt(name: string): number {
  const value = Number(requireEnv(name));
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} 必須為正整數`);
  }
  return value;
}

export function validateEnv(): void {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET 未設定或長度不足 16");
  }

  requireEnv("DATABASE_DIALECT");
  requireEnv("DATABASE_URL");
  requireEnv("SITE_URL");

  const inviteRequired = requireEnvBool("REGISTRATION_INVITE_REQUIRED");
  const contactEmail = requireEnvPresent("REGISTRATION_CONTACT_EMAIL");
  if (inviteRequired && !contactEmail) {
    throw new Error("REGISTRATION_INVITE_REQUIRED=true 時必須設定 REGISTRATION_CONTACT_EMAIL");
  }
  requireEnvPresent("REGISTRATION_BLOCKED_USERNAMES");

  const emailEnabled = requireEnvBool("NOTIFY_EMAIL_ENABLED");
  requireEnvPresent("SMTP_HOST");
  requireEnv("SMTP_PORT");
  requireEnvBool("SMTP_SECURE");
  requireEnvPresent("SMTP_USER");
  requireEnvPresent("SMTP_PASS");
  requireEnv("SMTP_FROM");
  if (emailEnabled) {
    requireEnv("SMTP_HOST");
  }

  requireEnvInt("LOGIN_IP_MAX_ATTEMPTS");
  requireEnvInt("LOGIN_IP_WINDOW_MS");
  requireEnvInt("LOGIN_IP_LOCKOUT_MS");
  requireEnvInt("LOGIN_USER_MAX_ATTEMPTS");
  requireEnvInt("LOGIN_USER_WINDOW_MS");
  requireEnvInt("LOGIN_USER_LOCKOUT_MS");
  requireEnvInt("REGISTER_IP_MAX_ATTEMPTS");
  requireEnvInt("REGISTER_IP_WINDOW_MS");
  requireEnvInt("REGISTER_IP_LOCKOUT_MS");
}
