import type { Reply } from "@/lib/types";
import { canModerateThread } from "@/lib/permissions";
import type { SessionUser } from "@/lib/types";
import { getRepositories } from "@/server/repositories";
import { getThreadById } from "@/server/services/thread.service";

export async function assertCanModerateThread(
  viewer: SessionUser,
  threadId: string,
): Promise<
  | { thread: NonNullable<Awaited<ReturnType<typeof getThreadById>>> }
  | { error: string; status: number }
> {
  const thread = await getThreadById(threadId);
  if (!thread) return { error: "帖子不存在", status: 404 };
  if (!canModerateThread(viewer, thread.boardId)) return { error: "無權限", status: 403 };
  return { thread };
}

export async function assertCanModerateReply(
  viewer: SessionUser,
  replyId: string,
): Promise<{ reply: Reply } | { error: string; status: number }> {
  const reply = await getRepositories().replies.findById(replyId);
  if (!reply) return { error: "回覆不存在", status: 404 };
  const thread = await getThreadById(reply.threadId);
  if (!thread) return { error: "回覆不存在", status: 404 };
  if (!canModerateThread(viewer, thread.boardId)) return { error: "無權限", status: 403 };
  return { reply };
}
