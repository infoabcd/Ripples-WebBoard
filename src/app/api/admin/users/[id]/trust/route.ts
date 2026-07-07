import { apiError, apiNotFound, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { canManageUsers } from "@/lib/permissions";
import { ensureDatabase } from "@/lib/init";
import {
  notifyTrustChange,
  recordAudit,
} from "@/server/services/notification.service";
import { getUserById, setUserTrusted } from "@/server/services/user.service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await ensureDatabase();
  const viewer = await getSessionUser();
  if (!viewer || !canManageUsers(viewer)) {
    return apiNotFound();
  }

  const { id } = await context.params;
  const body = (await request.json()) as { isTrusted?: boolean };
  if (typeof body.isTrusted !== "boolean") {
    return apiError("參數錯誤", 400);
  }

  const before = await getUserById(id);
  const user = await setUserTrusted(id, body.isTrusted);
  if (!user) {
    return apiError("用戶不存在", 404);
  }

  if (before && before.isTrusted !== user.isTrusted) {
    await recordAudit({
      actor: viewer,
      action: user.isTrusted ? "user.trust" : "user.untrust",
      targetType: "user",
      targetId: user.id,
      summary: `${user.isTrusted ? "設為受信" : "撤銷受信"}：${user.displayName} (@${user.username})`,
    });
    await notifyTrustChange({ userId: user.id, isTrusted: user.isTrusted });
  }

  return apiOk({ user });
}
