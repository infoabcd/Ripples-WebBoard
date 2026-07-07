import { apiError, apiNotFound, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { ensureDatabase } from "@/lib/init";
import { canManageUsers } from "@/lib/permissions";
import { getBoardById } from "@/server/services/board.service";
import {
  assignBoardModerator,
  unassignBoardModerator,
} from "@/server/services/moderator.service";
import { recordAudit } from "@/server/services/notification.service";
import { getUserById } from "@/server/services/user.service";

export async function POST(request: Request) {
  await ensureDatabase();
  const viewer = await getSessionUser();
  if (!viewer || !canManageUsers(viewer)) {
    return apiNotFound();
  }

  const body = (await request.json()) as { userId?: string; boardId?: string };
  if (!body.userId || !body.boardId) {
    return apiError("參數不完整", 400);
  }

  const result = await assignBoardModerator(body.userId, body.boardId);
  if ("error" in result) return apiError(result.error, 400);

  const board = await getBoardById(body.boardId);
  await recordAudit({
    actor: viewer,
    action: "moderator.assign",
    targetType: "user",
    targetId: result.id,
    summary: `指派版主 ${result.displayName} → /${board?.slug ?? "?"}/`,
  });

  return apiOk({ user: result });
}

export async function DELETE(request: Request) {
  await ensureDatabase();
  const viewer = await getSessionUser();
  if (!viewer || !canManageUsers(viewer)) {
    return apiNotFound();
  }

  const body = (await request.json()) as { userId?: string; boardId?: string };
  if (!body.userId || !body.boardId) {
    return apiError("參數不完整", 400);
  }

  const result = await unassignBoardModerator(body.userId, body.boardId);
  if (result && "error" in result) return apiError(result.error, 400);

  const user = result ?? (await getUserById(body.userId));
  const board = await getBoardById(body.boardId);
  if (user) {
    await recordAudit({
      actor: viewer,
      action: "moderator.unassign",
      targetType: "user",
      targetId: user.id,
      summary: `移除版主 ${user.displayName} ← /${board?.slug ?? "?"}/`,
    });
  }

  return apiOk({ user: result });
}
