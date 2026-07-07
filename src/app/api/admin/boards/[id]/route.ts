import { apiError, apiNotFound, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { ensureDatabase } from "@/lib/init";
import { canManageUsers } from "@/lib/permissions";
import { deleteBoard, getBoardById, updateBoard } from "@/server/services/board.service";
import { recordAudit } from "@/server/services/notification.service";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await ensureDatabase();
  const viewer = await getSessionUser();
  if (!viewer || !canManageUsers(viewer)) {
    return apiNotFound();
  }

  const { id } = await context.params;
  const body = (await request.json()) as {
    slug?: string;
    name?: string;
    description?: string;
    sortOrder?: number;
  };

  const result = await updateBoard(id, {
    slug: body.slug ?? "",
    name: body.name ?? "",
    description: body.description ?? "",
    sortOrder: Number(body.sortOrder) || 0,
  });

  if (!result) return apiError("分區不存在", 404);
  if ("error" in result) return apiError(result.error, 400);

  await recordAudit({
    actor: viewer,
    action: "board.update",
    targetType: "board",
    targetId: result.id,
    summary: `更新分區 /${result.slug}/（${result.name}）`,
  });

  return apiOk({ board: result });
}

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
  const board = await getBoardById(id);
  const result = await deleteBoard(id);

  if (result === false) return apiError("分區不存在", 404);
  if (typeof result === "object" && "error" in result) {
    return apiError(result.error, 400);
  }

  if (board) {
    await recordAudit({
      actor: viewer,
      action: "board.delete",
      targetType: "board",
      targetId: board.id,
      summary: `刪除分區 /${board.slug}/（${board.name}）`,
    });
  }

  return apiOk();
}
