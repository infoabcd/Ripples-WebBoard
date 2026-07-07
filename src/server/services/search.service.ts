import { getRepositories } from "@/server/repositories";
import type { Thread, Viewer } from "@/lib/types";
import { canViewReply, canViewThread } from "@/lib/visibility";
import { getBoardById } from "./board.service";

export async function searchThreads(
  query: string,
  viewer: Viewer,
  options?: { page?: number; pageSize?: number },
): Promise<{
  threads: Array<Thread & { boardSlug: string; matchSource: "thread" | "reply" }>;
  total: number;
}> {
  const q = query.trim().toLowerCase();
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, options?.pageSize ?? 20));

  if (!q) return { threads: [], total: 0 };

  const all = await getRepositories().threads.findAll();
  const matched: Array<Thread & { boardSlug: string; matchSource: "thread" | "reply" }> = [];

  for (const thread of all) {
    if (!canViewThread(viewer, thread)) continue;

    const inThread = `${thread.title} ${thread.body}`.toLowerCase().includes(q);
    let matchSource: "thread" | "reply" | null = inThread ? "thread" : null;

    if (!matchSource) {
      const replies = await getRepositories().replies.findByThreadId(thread.id);
      const inReply = replies.some(
        (reply) =>
          canViewReply(viewer, thread, reply.status) &&
          reply.body.toLowerCase().includes(q),
      );
      if (inReply) matchSource = "reply";
    }

    if (!matchSource) continue;
    const board = await getBoardById(thread.boardId);
    matched.push({ ...thread, boardSlug: board?.slug ?? "?", matchSource });
  }

  matched.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const start = (page - 1) * pageSize;
  return { threads: matched.slice(start, start + pageSize), total: matched.length };
}
