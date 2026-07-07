import { requireEnvInt } from "@/lib/env";

const buckets = new Map<string, number[]>();

/** 滑動窗口頻率限制，返回 true 表示允許通過 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (timestamps.length >= limit) {
    buckets.set(key, timestamps);
    return false;
  }
  timestamps.push(now);
  buckets.set(key, timestamps);
  return true;
}

export function rateLimitKey(userId: string, action: string): string {
  return `${action}:${userId}`;
}

type GuardBucket = {
  timestamps: number[];
  lockedUntil: number;
};

const guardBuckets = new Map<string, GuardBucket>();

export function getRequestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "local";
}

function getGuardBucket(key: string): GuardBucket {
  const existing = guardBuckets.get(key);
  if (existing) return existing;
  const bucket: GuardBucket = { timestamps: [], lockedUntil: 0 };
  guardBuckets.set(key, bucket);
  return bucket;
}

export type AuthGuardResult = { ok: true } | { ok: false; retryAfterSec: number };

/**
 * 檢查是否處於封禁/超限狀態（不記錄新嘗試）
 */
export function checkAuthGuard(
  key: string,
  options: {
    maxAttempts: number;
    windowMs: number;
    lockoutMs: number;
  },
): AuthGuardResult {
  const now = Date.now();
  const bucket = getGuardBucket(key);

  if (bucket.lockedUntil > now) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.lockedUntil - now) / 1000) };
  }

  bucket.timestamps = bucket.timestamps.filter((t) => now - t < options.windowMs);
  if (bucket.timestamps.length >= options.maxAttempts) {
    bucket.lockedUntil = now + options.lockoutMs;
    bucket.timestamps = [];
    return { ok: false, retryAfterSec: Math.ceil(options.lockoutMs / 1000) };
  }

  return { ok: true };
}

/** 記錄一次失敗或敏感操作嘗試 */
export function recordAuthAttempt(key: string, windowMs: number): void {
  const now = Date.now();
  const bucket = getGuardBucket(key);
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);
  bucket.timestamps.push(now);
}

export function clearAuthGuard(key: string): void {
  guardBuckets.delete(key);
}

const LOGIN_IP = {
  maxAttempts: () => requireEnvInt("LOGIN_IP_MAX_ATTEMPTS"),
  windowMs: () => requireEnvInt("LOGIN_IP_WINDOW_MS"),
  lockoutMs: () => requireEnvInt("LOGIN_IP_LOCKOUT_MS"),
};

const LOGIN_USER = {
  maxAttempts: () => requireEnvInt("LOGIN_USER_MAX_ATTEMPTS"),
  windowMs: () => requireEnvInt("LOGIN_USER_WINDOW_MS"),
  lockoutMs: () => requireEnvInt("LOGIN_USER_LOCKOUT_MS"),
};

const REGISTER_IP = {
  maxAttempts: () => requireEnvInt("REGISTER_IP_MAX_ATTEMPTS"),
  windowMs: () => requireEnvInt("REGISTER_IP_WINDOW_MS"),
  lockoutMs: () => requireEnvInt("REGISTER_IP_LOCKOUT_MS"),
};

function loginIpKey(ip: string): string {
  return `login:ip:${ip}`;
}

function loginUserKey(username: string): string {
  return `login:user:${username.trim().toLowerCase()}`;
}

function registerIpKey(ip: string): string {
  return `register:ip:${ip}`;
}

function loginIpOptions() {
  return {
    maxAttempts: LOGIN_IP.maxAttempts(),
    windowMs: LOGIN_IP.windowMs(),
    lockoutMs: LOGIN_IP.lockoutMs(),
  };
}

function loginUserOptions() {
  return {
    maxAttempts: LOGIN_USER.maxAttempts(),
    windowMs: LOGIN_USER.windowMs(),
    lockoutMs: LOGIN_USER.lockoutMs(),
  };
}

function registerIpOptions() {
  return {
    maxAttempts: REGISTER_IP.maxAttempts(),
    windowMs: REGISTER_IP.windowMs(),
    lockoutMs: REGISTER_IP.lockoutMs(),
  };
}

export function checkLoginAllowed(request: Request, username: string): AuthGuardResult {
  const ip = getRequestIp(request);
  const ipGuard = checkAuthGuard(loginIpKey(ip), loginIpOptions());
  if (!ipGuard.ok) return ipGuard;

  if (username) {
    const userGuard = checkAuthGuard(loginUserKey(username), loginUserOptions());
    if (!userGuard.ok) return userGuard;
  }

  return { ok: true };
}

export function recordLoginFailure(request: Request, username: string): void {
  const ip = getRequestIp(request);
  recordAuthAttempt(loginIpKey(ip), LOGIN_IP.windowMs());
  if (username) {
    recordAuthAttempt(loginUserKey(username), LOGIN_USER.windowMs());
  }
}

export function clearLoginFailures(username: string): void {
  clearAuthGuard(loginUserKey(username));
}

export function checkRegisterAllowed(request: Request): AuthGuardResult {
  const ip = getRequestIp(request);
  return checkAuthGuard(registerIpKey(ip), registerIpOptions());
}

export function recordRegisterAttempt(request: Request): void {
  const ip = getRequestIp(request);
  recordAuthAttempt(registerIpKey(ip), REGISTER_IP.windowMs());
}

export function formatRetryMessage(retryAfterSec: number, action: "login" | "register"): string {
  const minutes = Math.max(1, Math.ceil(retryAfterSec / 60));
  if (action === "login") {
    return `登入嘗試過於頻繁，請 ${minutes} 分鐘後再試`;
  }
  return `註冊過於頻繁，請 ${minutes} 分鐘後再試`;
}
