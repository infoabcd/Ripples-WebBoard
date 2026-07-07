import { apiError, apiNotFound, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { ensureDatabase } from "@/lib/init";
import { canAccessAdmin } from "@/lib/permissions";
import {
  notifyThreadModeration,
  recordAudit,
} from "@/server/services/notification.service";
import { moderateThread } from "@/server/services/thread.service";
import { assertCanModerateThread } from "@/server/services/moderation.service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await ensureDatabase();
  const viewer = await getSessionUser();
  if (!viewer || !canAccessAdmin(viewer)) {
    return apiNotFound();
  }

  const { id } = await context.params;
  const access = await assertCanModerateThread(viewer, id);
  if ("error" in access) {
    return access.status === 403 ? apiNotFound() : apiError(access.error, access.status);
  }

  const body = (await request.json()) as {
    action?: "approve" | "reject";
    rejectReason?: string;
  };

  if (body.action !== "approve" && body.action !== "reject") {
    return apiError("無效操作", 400);
  }

  const approved = body.action === "approve";
  const thread = await moderateThread(
    id,
    approved ? "approved" : "rejected",
    body.rejectReason,
  );
  if (!thread) {
    return apiError("帖子不存在", 404);
  }

  await recordAudit({
    actor: viewer,
    action: approved ? "thread.approve" : "thread.reject",
    targetType: "thread",
    targetId: thread.id,
    summary: `${approved ? "通過" : "駁回"}主題「${thread.title}」`,
    metadata: approved ? undefined : { rejectReason: body.rejectReason ?? "" },
  });

  await notifyThreadModeration({
    threadId: thread.id,
    authorId: thread.authorId,
    title: thread.title,
    approved,
    rejectReason: body.rejectReason,
  });

  return apiOk({ thread });
}
