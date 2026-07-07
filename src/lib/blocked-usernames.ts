import { requireEnvPresent } from "@/lib/env";

function escapeRegex(value: string): string {
  return value.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
}

function patternToRegex(pattern: string): RegExp {
  const parts = pattern.split("*").map(escapeRegex);
  return new RegExp(`^${parts.join(".*")}$`);
}

export function getBlockedUsernamePatterns(): string[] {
  const raw = requireEnvPresent("REGISTRATION_BLOCKED_USERNAMES");
  if (!raw) return [];
  return raw
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

export function isUsernameBlocked(username: string): boolean {
  const normalized = username.trim().toLowerCase();
  if (!normalized) return false;

  for (const pattern of getBlockedUsernamePatterns()) {
    if (pattern.includes("*")) {
      if (patternToRegex(pattern).test(normalized)) return true;
    } else if (normalized === pattern) {
      return true;
    }
  }

  return false;
}

export const BLOCKED_USERNAME_MESSAGE = "該用戶名不可註冊";
