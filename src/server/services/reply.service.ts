import { getRepositories } from "@/server/repositories";
import { getBoardById } from "@/server/services/board.service";
import { getThreadById } from "@/server/services/thread.service";
import type { Reply } from "@/lib/types";

export async function listRepliesForThread(threadId: string): Promise<Reply[]> {
  return getRepositories().replies.findByThreadId(threadId);
}

export async function getReplyCount(threadId: string): Promise<number> {
  return getRepositories().replies.countByThreadId(threadId);
}

export async function createReply(input: {
  threadId: string;
  authorId: string;
  body: string;
  imagePath?: string | null;
  quoteNo?: number | null;
}): Promise<Reply> {
  return getRepositories().replies.create(input);
}

export async function moderateReply(
  replyId: string,
  status: "approved" | "rejected",
): Promise<Reply | null> {
  return getRepositories().replies.moderate(replyId, status);
}

export async function listPendingReplies(
  boardIds?: string[] | null,
): Promise<Array<Reply & { threadTitle: string; boardSlug: string; boardId: string }>> {
  const { replies, threads, boards } = getRepositories();
  const pending = await replies.findPending();

  const result = await Promise.all(
    pending.map(async (reply) => {
      const thread = await threads.findById(reply.threadId);
      const board = thread ? await boards.findById(thread.boardId) : null;
      return {
        ...reply,
        threadTitle: thread?.title ?? "（已刪除）",
        boardSlug: board?.slug ?? "?",
        boardId: thread?.boardId ?? "",
      };
    }),
  );

  if (!boardIds) return result;
  return result.filter((item) => boardIds.includes(item.boardId));
}

export async function getReplyThreadTitle(threadId: string): Promise<string> {
  const thread = await getThreadById(threadId);
  return thread?.title ?? "（已刪除）";
}

export async function getReplyBoardSlug(threadId: string): Promise<string> {
  const thread = await getThreadById(threadId);
  if (!thread) return "?";
  const board = await getBoardById(thread.boardId);
  return board?.slug ?? "?";
}
