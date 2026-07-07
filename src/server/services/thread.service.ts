import { getRepositories } from "@/server/repositories";
import { deleteThreadImage } from "@/server/storage/image.service";
import type { BoardSort, SessionUser, Thread, Viewer } from "@/lib/types";
import { isBoardModerator } from "@/lib/permissions";
import { canViewThread } from "@/lib/visibility";

export async function getThreadById(id: string): Promise<Thread | null> {
  return getRepositories().threads.findById(id);
}

export async function getThreadLatestActivity(threadId: string): Promise<string> {
  return getRepositories().threads.getLatestActivityAt(threadId);
}

export async function listThreadsForBoard(
  boardId: string,
  viewer: Viewer,
  options?: { sort?: BoardSort; page?: number; pageSize?: number },
): Promise<{ threads: Thread[]; total: number }> {
  const sort = options?.sort ?? "bump";
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, options?.pageSize ?? 20));

  const all = await getRepositories().threads.findByBoardId(boardId);
  const visible = all.filter((thread) => canViewThread(viewer, thread));

  const sorted = await Promise.all(
    visible.map(async (thread) => ({
      thread,
      bump: await getThreadLatestActivity(thread.id),
    })),
  );

  sorted.sort((a, b) => {
    if (sort === "created") {
      return b.thread.createdAt.localeCompare(a.thread.createdAt);
    }
    return b.bump.localeCompare(a.bump);
  });

  const threads = sorted.map((item) => item.thread);
  const start = (page - 1) * pageSize;
  return { threads: threads.slice(start, start + pageSize), total: threads.length };
}

export async function listUserThreads(userId: string): Promise<Thread[]> {
  return getRepositories().threads.findByAuthorId(userId);
}

export async function listPublicThreadsByUser(userId: string, viewer: Viewer): Promise<Thread[]> {
  const threads = await listUserThreads(userId);
  return threads.filter((thread) => canViewThread(viewer, thread));
}

export async function listRecentThreads(limit = 20): Promise<Thread[]> {
  return getRepositories().threads.findRecent(limit);
}

export async function createThread(input: {
  boardId: string;
  authorId: string;
  authorWasTrusted: boolean;
  title: string;
  body: string;
  imagePath?: string | null;
}): Promise<Thread> {
  return getRepositories().threads.create(input);
}

export async function updatePendingThread(
  threadId: string,
  actorId: string,
  input: { title?: string; body?: string; imagePath?: string | null },
): Promise<Thread | null> {
  const thread = await getThreadById(threadId);
  if (!thread || thread.authorId !== actorId || thread.status !== "pending") return null;

  if (input.imagePath !== undefined && input.imagePath !== thread.imagePath) {
    await deleteThreadImage(thread.imagePath);
  }

  await getRepositories().threads.updatePending(threadId, input);
  return getThreadById(threadId);
}

export async function incrementThreadView(threadId: string): Promise<void> {
  await getRepositories().threads.incrementView(threadId);
}

export async function deleteThread(threadId: string, viewer: SessionUser): Promise<boolean> {
  const thread = await getThreadById(threadId);
  if (!thread) return false;

  const isAuthor = thread.authorId === viewer.id;
  const canManage =
    viewer.role === "admin" || isBoardModerator(viewer, thread.boardId);
  if (!canManage && !(isAuthor && thread.status === "pending")) return false;

  await deleteThreadImage(thread.imagePath);
  await getRepositories().threads.delete(threadId);
  return true;
}

export async function moderateThread(
  threadId: string,
  status: "approved" | "rejected",
  rejectReason?: string,
): Promise<Thread | null> {
  return getRepositories().threads.moderate(threadId, status, rejectReason);
}

export function parseQuoteNo(body: string): number | null {
  const match = body.trim().match(/^>>(\d+)/);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}
