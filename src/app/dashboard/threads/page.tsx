import Link from "next/link";

import styles from "@/app/boards.module.css";
import { ModerateButtons } from "@/components/AdminActions";
import PrefetchLink from "@/components/PrefetchLink";
import DashboardSubpageShell from "@/components/dashboard/DashboardSubpageShell";
import Pagination from "@/components/Pagination";
import { requireDashboardViewer } from "@/lib/dashboard-auth";
import { formatChanDate } from "@/lib/format";
import { parsePage } from "@/lib/pagination";
import { canManageUsers, scopedBoardIds } from "@/lib/permissions";
import type { ContentStatus } from "@/lib/types";
import { buildReplyCountMap, listAdminThreads } from "@/server/services/admin-list.service";
import { listBoards } from "@/server/services/board.service";
import { buildAuthorNameMap } from "@/server/services/dashboard.service";

function statusClass(status: string): string {
  if (status === "approved") return styles.statusApproved;
  if (status === "rejected") return styles.statusRejected;
  return styles.statusPending;
}

const STATUS_OPTIONS: Array<{ value: ContentStatus | "all"; label: string }> = [
  { value: "all", label: "全部狀態" },
  { value: "pending", label: "待審核" },
  { value: "approved", label: "已通過" },
  { value: "rejected", label: "已駁回" },
];

export default async function DashboardThreadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; board?: string }>;
}) {
  const viewer = await requireDashboardViewer();
  const isSiteAdmin = canManageUsers(viewer);
  const scope = scopedBoardIds(viewer);
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const statusRaw = sp.status?.trim() || "all";
  const status =
    statusRaw === "pending" || statusRaw === "approved" || statusRaw === "rejected"
      ? statusRaw
      : null;
  const boardSlug = sp.board?.trim() || null;

  const allBoards = await listBoards();
  const boards = scope ? allBoards.filter((board) => scope.includes(board.id)) : allBoards;
  const boardFilter = boardSlug ? boards.find((board) => board.slug === boardSlug) : null;
  const boardIds = boardFilter
    ? [boardFilter.id]
    : scope
      ? scope
      : null;

  const { threads, total, page: safePage, totalPages } = await listAdminThreads({
    boardIds,
    status,
    page,
  });

  const authorNames = isSiteAdmin
    ? await buildAuthorNameMap(threads.map((thread) => thread.authorId))
    : {};
  const replyCounts = await buildReplyCountMap(threads.map((thread) => thread.id));

  function filterHref(next: { status?: string; board?: string | null }) {
    const params = new URLSearchParams();
    const nextStatus = next.status ?? statusRaw;
    const nextBoard = next.board === undefined ? boardSlug : next.board;
    if (nextStatus && nextStatus !== "all") params.set("status", nextStatus);
    if (nextBoard) params.set("board", nextBoard);
    const query = params.toString();
    return query ? `/dashboard/threads?${query}` : "/dashboard/threads";
  }

  return (
    <DashboardSubpageShell title="全部主題" subtitle={`共 ${total} 條主題`}>
      <div className={styles.filterBar}>
        <span>狀態：</span>
        {STATUS_OPTIONS.map((item) => (
          <Link
            key={item.value}
            href={filterHref({ status: item.value })}
            className={
              (item.value === "all" && !status) || item.value === status
                ? styles.filterActive
                : undefined
            }
          >
            {item.label}
          </Link>
        ))}
      </div>

      {boards.length > 1 ? (
        <div className={styles.filterBar}>
          <span>分區：</span>
          <Link
            href={filterHref({ board: null })}
            className={!boardSlug ? styles.filterActive : undefined}
          >
            全部
          </Link>
          {boards.map((board) => (
            <Link
              key={board.id}
              href={filterHref({ board: board.slug })}
              className={boardSlug === board.slug ? styles.filterActive : undefined}
            >
              /{board.slug}/
            </Link>
          ))}
        </div>
      ) : null}

      {threads.length === 0 ? (
        <p className={styles.empty}>沒有符合條件的主題。</p>
      ) : (
        <div className={styles.catalogWrap}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>主題</th>
                <th>分區</th>
                {isSiteAdmin ? <th>作者</th> : null}
                <th>狀態</th>
                <th>回覆</th>
                <th>時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {threads.map((thread) => {
                const board = boards.find((item) => item.id === thread.boardId);
                return (
                  <tr key={thread.id}>
                    <td>
                      <PrefetchLink href={`/threads/${thread.id}`}>{thread.title}</PrefetchLink>
                    </td>
                    <td>/{board?.slug ?? "?"}</td>
                    {isSiteAdmin ? <td>{authorNames[thread.authorId] ?? "—"}</td> : null}
                    <td className={statusClass(thread.status)}>
                      {thread.status === "approved"
                        ? "已通過"
                        : thread.status === "rejected"
                          ? "已駁回"
                          : "待審核"}
                      {thread.status === "rejected" && thread.rejectReason ? (
                        <div className={styles.catalogMeta}>{thread.rejectReason}</div>
                      ) : null}
                    </td>
                    <td>{replyCounts[thread.id] ?? 0}</td>
                    <td className={styles.catalogMeta}>{formatChanDate(thread.createdAt)}</td>
                    <td>
                      {thread.status === "pending" ? (
                        <ModerateButtons threadId={thread.id} compact />
                      ) : (
                        <span className={styles.catalogMeta}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        basePath="/dashboard/threads"
        page={safePage}
        totalPages={totalPages}
        query={{
          ...(status ? { status } : undefined),
          ...(boardSlug ? { board: boardSlug } : undefined),
        }}
      />
    </DashboardSubpageShell>
  );
}
