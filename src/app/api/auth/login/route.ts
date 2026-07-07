import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  checkLoginAllowed,
  clearLoginFailures,
  formatRetryMessage,
  recordLoginFailure,
} from "@/lib/auth-rate-limit";
import { apiError, apiOk } from "@/lib/api";
import {
  createSessionToken,
  getSessionUser,
  sessionCookieOptions,
} from "@/lib/auth";
import { ensureDatabase } from "@/lib/init";
import { getUserByUsername } from "@/server/services/user.service";

export async function POST(request: Request) {
  await ensureDatabase();
  const body = (await request.json()) as { username?: string; password?: string };
  const username = body.username?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  if (!username || !password) {
    return apiError("請輸入用戶名和密碼", 400);
  }

  const guard = checkLoginAllowed(request, username);
  if (!guard.ok) {
    return apiError(formatRetryMessage(guard.retryAfterSec, "login"), 429);
  }

  const user = await getUserByUsername(username);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    recordLoginFailure(request, username);
    return apiError("用戶名或密碼錯誤", 401);
  }

  clearLoginFailures(username);
  const token = createSessionToken(user.id);
  const jar = await cookies();
  jar.set(sessionCookieOptions(token));
  return apiOk();
}

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ ok: true, user });
}
