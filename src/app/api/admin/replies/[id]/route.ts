import { apiError, apiNotFound, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { ensureDatabase } from "@/lib/init";
import { canAccessAdmin } from "@/lib/permissions";
import {
  notifyReplyModeration,
  recordAudit,
} from "@/server/services/notification.service";
import { moderateReply } from "@/server/services/reply.service";
import { assertCanModerateReply } from "@/server/services/moderation.service";

function excerpt(text: string, max = 60): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
}

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
  const access = await assertCanModerateReply(viewer, id);
  if ("error" in access) {
    return access.status === 403 ? apiNotFound() : apiError(access.error, access.status);
  }

  const body = (await request.json()) as { action?: "approve" | "reject" };
  if (body.action !== "approve" && body.action !== "reject") {
    return apiError("無效操作", 400);
  }

  const approved = body.action === "approve";
  const reply = await moderateReply(id, approved ? "approved" : "rejected");
  if (!reply) {
    return apiError("回覆不存在", 404);
  }

  await recordAudit({
    actor: viewer,
    action: approved ? "reply.approve" : "reply.reject",
    targetType: "reply",
    targetId: reply.id,
    summary: `${approved ? "通過" : "駁回"}回覆（主題 ${reply.threadId}）`,
  });

  await notifyReplyModeration({
    replyId: reply.id,
    threadId: reply.threadId,
    authorId: reply.authorId,
    approved,
    excerpt: excerpt(reply.body),
  });

  return apiOk({ reply });
}
