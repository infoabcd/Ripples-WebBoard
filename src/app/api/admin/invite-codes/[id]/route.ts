import { apiError, apiNotFound, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { ensureDatabase } from "@/lib/init";
import { canManageUsers } from "@/lib/permissions";
import { deleteInviteCode } from "@/server/services/invite.service";
import { getRepositories } from "@/server/repositories";
import { recordAudit } from "@/server/services/notification.service";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await ensureDatabase();
  const viewer = await getSessionUser();
  if (!viewer || !canManageUsers(viewer)) {
    return apiNotFound();
  }

  const { id } = await context.params;
  const existing = await getRepositories().inviteCodes.findById(id);
  const ok = await deleteInviteCode(id);
  if (!ok) return apiError("邀請碼不存在", 404);

  if (existing) {
    await recordAudit({
      actor: viewer,
      action: "invite.delete",
      targetType: "invite_code",
      targetId: existing.id,
      summary: `刪除邀請碼 ${existing.code}`,
    });
  }

  return apiOk();
}
