import bcrypt from "bcryptjs";

import { BLOCKED_USERNAME_MESSAGE, isUsernameBlocked } from "@/lib/blocked-usernames";
import { validateEmail } from "@/lib/validate";
import { getRepositories } from "@/server/repositories";
import type { User } from "@/lib/types";

export async function getUserById(id: string): Promise<User | null> {
  return getRepositories().users.findById(id);
}

export async function getUserByUsername(username: string): Promise<User | null> {
  return getRepositories().users.findByUsername(username);
}

export async function getDisplayName(userId: string): Promise<string> {
  const user = await getUserById(userId);
  return user?.displayName ?? "未知用戶";
}

export async function createUser(input: {
  username: string;
  password: string;
  displayName: string;
  email?: string | null;
}): Promise<User | null> {
  const username = input.username.trim().toLowerCase();
  const displayName = input.displayName.trim();
  const email = input.email?.trim().toLowerCase() || null;

  if (!/^[a-z0-9_]{3,20}$/.test(username)) return null;
  if (isUsernameBlocked(username)) return null;
  if (displayName.length < 2 || displayName.length > 24) return null;
  if (input.password.length < 6) return null;
  if (email && validateEmail(email)) return null;

  const existing = await getUserByUsername(username);
  if (existing) return null;

  const passwordHash = await bcrypt.hash(input.password, 10);
  return getRepositories().users.create({ username, passwordHash, displayName, email });
}

export async function setUserEmail(userId: string, email: string | null): Promise<User | null> {
  return getRepositories().users.setEmail(userId, email);
}

export async function setUserTrusted(userId: string, isTrusted: boolean): Promise<User | null> {
  return getRepositories().users.setTrusted(userId, isTrusted);
}
