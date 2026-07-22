import { cookies } from "next/headers";

import {
  checkRegisterAllowed,
  formatRetryMessage,
  recordRegisterAttempt,
} from "@/lib/auth-rate-limit";
import { apiError, apiOk } from "@/lib/api";
import { createSessionToken, sessionCookieOptions } from "@/lib/auth";
import { BLOCKED_USERNAME_MESSAGE, isUsernameBlocked } from "@/lib/blocked-usernames";
import { ensureDatabase } from "@/lib/init";
import { validateEmail } from "@/lib/validate";
import { validateInviteCode, recordInviteRegistration } from "@/server/services/invite.service";
import { createUser, getUserByUsername } from "@/server/services/user.service";

export async function POST(request: Request) {
  await ensureDatabase();

  const guard = checkRegisterAllowed(request);
  if (!guard.ok) {
    return apiError(formatRetryMessage(guard.retryAfterSec, "register"), 429);
  }

  const body = (await request.json()) as {
    username?: string;
    password?: string;
    displayName?: string;
    email?: string;
    inviteCode?: string;
  };

  const username = body.username?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const displayName = body.displayName?.trim() ?? username;
  const email = body.email?.trim() || null;

  if (!username || !password) {
    recordRegisterAttempt(request);
    return apiError("請填寫用戶名和密碼", 400);
  }

  if (email) {
    const emailError = validateEmail(email);
    if (emailError) {
      recordRegisterAttempt(request);
      return apiError(emailError, 400);
    }
  }

  const inviteCheck = await validateInviteCode(body.inviteCode ?? "");
  if (!inviteCheck.ok) {
    recordRegisterAttempt(request);
    return apiError(inviteCheck.error, 400);
  }

  if (isUsernameBlocked(username)) {
    recordRegisterAttempt(request);
    return apiError(BLOCKED_USERNAME_MESSAGE, 400);
  }

  if (await getUserByUsername(username)) {
    recordRegisterAttempt(request);
    return apiError("用戶名已被使用", 409);
  }

  const user = await createUser({
    username,
    password,
    displayName,
    email,
    isTrusted: inviteCheck.invite?.directTrust ?? false,
  });
  if (!user) {
    recordRegisterAttempt(request);
    return apiError("用戶名須 3-20 位小寫字母/數字/底線，密碼至少 6 位，顯示名稱 2-24 字", 400);
  }

  if (inviteCheck.invite) {
    await recordInviteRegistration({
      invite: inviteCheck.invite,
      user: { id: user.id, username: user.username, displayName: user.displayName },
    });
  }

  const token = createSessionToken(user.id);
  const jar = await cookies();
  jar.set(sessionCookieOptions(token));

  return apiOk({
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
    },
  });
}
