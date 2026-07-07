import type { AuditLog, ContentStatus, InviteCodeUse, Reply, Thread, User } from "@/lib/types";
import {
  clampPage,
  DASHBOARD_PAGE_SIZE,
  pageOffset,
  parsePage,
  totalPages,
} from "@/lib/pagination";
import { getRepositories } from "@/server/repositories";

export { DASHBOARD_PAGE_SIZE, parsePage, totalPages, clampPage, pageOffset };

export async function listAdminThreads(input: {
  boardIds: string[] | null;
  status?: ContentStatus | null;
  page: number;
  pageSize?: number;
}): Promise<{ threads: Thread[]; total: number; page: number; totalPages: number }> {
  const pageSize = input.pageSize ?? DASHBOARD_PAGE_SIZE;
  const total = await getRepositories().threads.countFiltered({
    boardIds: input.boardIds,
    status: input.status ?? null,
  });
  const safePage = clampPage(input.page, total, pageSize);
  const threads = await getRepositories().threads.findPage(
    { boardIds: input.boardIds, status: input.status ?? null },
    pageSize,
    pageOffset(safePage, pageSize),
  );
  return { threads, total, page: safePage, totalPages: totalPages(total, pageSize) };
}

export async function listAdminUsers(input: {
  page: number;
  pageSize?: number;
}): Promise<{ users: User[]; total: number; page: number; totalPages: number }> {
  const pageSize = input.pageSize ?? DASHBOARD_PAGE_SIZE;
  const total = await getRepositories().users.count();
  const safePage = clampPage(input.page, total, pageSize);
  const users = await getRepositories().users.findPage(
    pageSize,
    pageOffset(safePage, pageSize),
  );
  return { users, total, page: safePage, totalPages: totalPages(total, pageSize) };
}

export async function listAdminAuditLogs(input: {
  page: number;
  pageSize?: number;
  action?: string | null;
}): Promise<{ logs: AuditLog[]; total: number; page: number; totalPages: number }> {
  const pageSize = input.pageSize ?? DASHBOARD_PAGE_SIZE;
  const action = input.action?.trim() || null;
  const total = await getRepositories().auditLogs.countFiltered(action);
  const safePage = clampPage(input.page, total, pageSize);
  const logs = await getRepositories().auditLogs.findRecent(
    pageSize,
    pageOffset(safePage, pageSize),
    action,
  );
  return { logs, total, page: safePage, totalPages: totalPages(total, pageSize) };
}

export async function listAdminInviteUses(input: {
  page: number;
  pageSize?: number;
}): Promise<{ uses: InviteCodeUse[]; total: number; page: number; totalPages: number }> {
  const pageSize = input.pageSize ?? DASHBOARD_PAGE_SIZE;
  const total = await getRepositories().inviteCodes.countUsages();
  const safePage = clampPage(input.page, total, pageSize);
  const uses = await getRepositories().inviteCodes.listRecentUses(
    pageSize,
    pageOffset(safePage, pageSize),
  );
  return { uses, total, page: safePage, totalPages: totalPages(total, pageSize) };
}

export async function buildReplyCountMap(threadIds: string[]): Promise<Record<string, number>> {
  if (threadIds.length === 0) return {};
  return getRepositories().replies.countByThreadIds(threadIds);
}

export type DashboardReplyRow = Reply & {
  threadTitle: string;
  boardSlug: string;
  boardId: string;
};

export async function listAdminReplies(input: {
  boardIds: string[] | null;
  status?: ContentStatus | null;
  page: number;
  pageSize?: number;
}): Promise<{
  replies: DashboardReplyRow[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const pageSize = input.pageSize ?? DASHBOARD_PAGE_SIZE;
  const total = await getRepositories().replies.countFiltered({
    boardIds: input.boardIds,
    status: input.status ?? null,
  });
  const safePage = clampPage(input.page, total, pageSize);
  const replies = await getRepositories().replies.findPage(
    { boardIds: input.boardIds, status: input.status ?? null },
    pageSize,
    pageOffset(safePage, pageSize),
  );

  const enriched = await Promise.all(
    replies.map(async (reply) => {
      const thread = await getRepositories().threads.findById(reply.threadId);
      const board = thread ? await getRepositories().boards.findById(thread.boardId) : null;
      return {
        ...reply,
        threadTitle: thread?.title ?? "（已刪除）",
        boardSlug: board?.slug ?? "?",
        boardId: thread?.boardId ?? "",
      };
    }),
  );

  return {
    replies: enriched,
    total,
    page: safePage,
    totalPages: totalPages(total, pageSize),
  };
}
