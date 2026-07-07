import type { AdminDashboardData } from "@/server/services/admin.service";
import type { Board, Reply, SessionUser, Thread } from "@/lib/types";
import { DASHBOARD_PREVIEW_LIMIT } from "@/lib/pagination";
import { canManageUsers, scopedBoardIds } from "@/lib/permissions";
import { getDatabaseDialect } from "@/server/db/config";
import { getRepositories } from "@/server/repositories";
import { getAdminStats } from "@/server/services/admin.service";
import { listBoards } from "@/server/services/board.service";
import { listPendingReplies } from "@/server/services/reply.service";
import { getDisplayName } from "@/server/services/user.service";

export const DASHBOARD_QUEUE_PREVIEW_LIMIT = 5;

export type DashboardPendingReply = Reply & {
  threadTitle: string;
  boardSlug: string;
  boardId: string;
};

export type DashboardBoard = Board & { threadCount: number };

export type DashboardOverviewData = {
  isSiteAdmin: boolean;
  dialect: string;
  boards: Board[];
  stats: AdminDashboardData;
  pendingThreads: Thread[];
  pendingThreadTotal: number;
  pendingReplies: DashboardPendingReply[];
  pendingReplyTotal: number;
  threadTotal: number;
  userTotal: number;
  auditLogTotal: number;
  inviteCodeTotal: number;
  inviteUseTotal: number;
  boardCount: number;
  authorNames: Record<string, string>;
};

export async function buildAuthorNameMap(authorIds: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(authorIds.filter(Boolean))];
  const map: Record<string, string> = {};
  await Promise.all(
    unique.map(async (id) => {
      map[id] = await getDisplayName(id);
    }),
  );
  return map;
}

export async function loadDashboardOverview(viewer: SessionUser): Promise<DashboardOverviewData> {
  const isSiteAdmin = canManageUsers(viewer);
  const scope = scopedBoardIds(viewer);
  const allBoards = await listBoards();
  const boards = scope ? allBoards.filter((board) => scope.includes(board.id)) : allBoards;
  const boardIds = scope ?? null;

  const pendingThreadsAll = await getRepositories().threads.findPending(boardIds);
  const pendingRepliesAll = await listPendingReplies(scope);

  const authorIds = isSiteAdmin
    ? [
        ...pendingThreadsAll.map((thread) => thread.authorId),
        ...pendingRepliesAll.map((reply) => reply.authorId),
      ]
    : [];

  return {
    isSiteAdmin,
    dialect: getDatabaseDialect(),
    boards,
    stats: await getAdminStats(scope),
    pendingThreads: pendingThreadsAll.slice(0, DASHBOARD_QUEUE_PREVIEW_LIMIT),
    pendingThreadTotal: pendingThreadsAll.length,
    pendingReplies: pendingRepliesAll.slice(0, DASHBOARD_QUEUE_PREVIEW_LIMIT),
    pendingReplyTotal: pendingRepliesAll.length,
    threadTotal: await getRepositories().threads.countFiltered({ boardIds }),
    userTotal: isSiteAdmin ? await getRepositories().users.count() : 0,
    auditLogTotal: isSiteAdmin ? await getRepositories().auditLogs.count() : 0,
    inviteCodeTotal: isSiteAdmin ? (await getRepositories().inviteCodes.findAll()).length : 0,
    inviteUseTotal: isSiteAdmin ? await getRepositories().inviteCodes.countUsages() : 0,
    boardCount: boards.length,
    authorNames: isSiteAdmin ? await buildAuthorNameMap(authorIds) : {},
  };
}

export async function loadDashboardBoardDetails(): Promise<DashboardBoard[]> {
  const boards = await listBoards();
  return Promise.all(
    boards.map(async (board) => ({
      ...board,
      threadCount: await getRepositories().threads.countByBoardId(board.id),
    })),
  );
}

// 子页面等仍可使用完整预览上限
export { DASHBOARD_PREVIEW_LIMIT };
