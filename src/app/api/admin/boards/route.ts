import { apiError, apiNotFound, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { ensureDatabase } from "@/lib/init";
import { canManageUsers } from "@/lib/permissions";
import { createBoard } from "@/server/services/board.service";
import { recordAudit } from "@/server/services/notification.service";

export async function POST(request: Request) {
  await ensureDatabase();
  const viewer = await getSessionUser();
  if (!viewer || !canManageUsers(viewer)) {
    return apiNotFound();
  }

  const body = (await request.json()) as {
    slug?: string;
    name?: string;
    description?: string;
    sortOrder?: number;
  };

  const result = await createBoard({
    slug: body.slug ?? "",
    name: body.name ?? "",
    description: body.description ?? "",
    sortOrder: body.sortOrder,
  });

  if ("error" in result) {
    return apiError(result.error, 400);
  }

  await recordAudit({
    actor: viewer,
    action: "board.create",
    targetType: "board",
    targetId: result.id,
    summary: `建立分區 /${result.slug}/（${result.name}）`,
  });

  return apiOk({ board: result });
}
