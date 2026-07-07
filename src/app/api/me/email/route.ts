import { apiError, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { ensureDatabase } from "@/lib/init";
import { validateEmail } from "@/lib/validate";
import { getUserById, setUserEmail } from "@/server/services/user.service";

export async function PATCH(request: Request) {
  await ensureDatabase();
  const viewer = await getSessionUser();
  if (!viewer) {
    return apiError("請先登入", 401);
  }

  const body = (await request.json()) as { email?: string };
  const raw = body.email?.trim() ?? "";
  const email = raw ? raw.toLowerCase() : null;

  if (email) {
    const emailError = validateEmail(email);
    if (emailError) {
      return apiError(emailError, 400);
    }
  }

  const user = await setUserEmail(viewer.id, email);
  if (!user) {
    return apiError("用戶不存在", 404);
  }

  return apiOk({ email: user.email });
}

export async function GET() {
  await ensureDatabase();
  const viewer = await getSessionUser();
  if (!viewer) {
    return apiError("請先登入", 401);
  }

  const user = await getUserById(viewer.id);
  return apiOk({ email: user?.email ?? null });
}
