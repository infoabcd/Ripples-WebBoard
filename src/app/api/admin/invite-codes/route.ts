import { apiError, apiNotFound, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { ensureDatabase } from "@/lib/init";
import { canManageUsers } from "@/lib/permissions";
import { createInviteCode, formatInviteMaxUses, listInviteCodes } from "@/server/services/invite.service";
import { recordAudit } from "@/server/services/notification.service";

export async function GET() {
  await ensureDatabase();
  const viewer = await getSessionUser();
  if (!viewer || !canManageUsers(viewer)) {
    return apiNotFound();
  }

  const codes = await listInviteCodes();
  return apiOk({ codes });
}

export async function POST(request: Request) {
  await ensureDatabase();
  const viewer = await getSessionUser();
  if (!viewer || !canManageUsers(viewer)) {
    return apiNotFound();
  }

  const body = (await request.json()) as {
    code?: string;
    note?: string;
    maxUses?: number;
    directTrust?: boolean;
  };

  const result = await createInviteCode({
    code: body.code,
    note: body.note,
    maxUses: body.maxUses,
    directTrust: body.directTrust === true,
    createdBy: viewer.id,
  });

  if ("error" in result) {
    return apiError(result.error, 400);
  }

  await recordAudit({
    actor: viewer,
    action: "invite.create",
    targetType: "invite_code",
    targetId: result.id,
    summary: `建立邀請碼 ${result.code}（${formatInviteMaxUses(result.maxUses)}${result.directTrust ? "，直接受信" : ""}）`,
    metadata: { note: result.note ?? "", directTrust: result.directTrust },
  });

  return apiOk({ code: result });
}
