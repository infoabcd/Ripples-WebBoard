import Link from "next/link";

import styles from "@/app/boards.module.css";
import { ReplyModerateButtons } from "@/components/AdminActions";
import PrefetchLink from "@/components/PrefetchLink";
import DashboardSubpageShell from "@/components/dashboard/DashboardSubpageShell";
import Pagination from "@/components/Pagination";
import { requireDashboardViewer } from "@/lib/dashboard-auth";
import { excerpt } from "@/lib/admin";
import { formatChanDate } from "@/lib/format";
import { parsePage } from "@/lib/pagination";
import { canManageUsers, scopedBoardIds } from "@/lib/permissions";
import type { ContentStatus } from "@/lib/types";
import { listAdminReplies } from "@/server/services/admin-list.service";
import { buildAuthorNameMap } from "@/server/services/dashboard.service";
import { listBoards } from "@/server/services/board.service";

const STATUS_OPTIONS: Array<{ value: ContentStatus | "all"; label: string }> = [
  { value: "all", label: "全部狀態" },
  { value: "pending", label: "待審核" },
  { value: "approved", label: "已通過" },
  { value: "rejected", label: "已駁回" },
];

export default async function DashboardRepliesPage({
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
  const boardIds = boardFilter ? [boardFilter.id] : scope ? scope : null;

  const { replies, total, page: safePage, totalPages } = await listAdminReplies({
    boardIds,
    status,
    page,
  });

  const authorNames = isSiteAdmin
    ? await buildAuthorNameMap(replies.map((reply) => reply.authorId))
    : {};

  function filterHref(next: { status?: string; board?: string | null }) {
    const params = new URLSearchParams();
    const nextStatus = next.status ?? statusRaw;
    const nextBoard = next.board === undefined ? boardSlug : next.board;
    if (nextStatus && nextStatus !== "all") params.set("status", nextStatus);
    if (nextBoard) params.set("board", nextBoard);
    const query = params.toString();
    return query ? `/dashboard/replies?${query}` : "/dashboard/replies";
  }

  return (
    <DashboardSubpageShell title="回覆管理" subtitle={`共 ${total} 條回覆`}>
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

      {replies.length === 0 ? (
        <p className={styles.empty}>沒有符合條件的回覆。</p>
      ) : (
        <div className={styles.catalogWrap}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>回覆內容</th>
                <th>所属主題</th>
                <th>分區</th>
                {isSiteAdmin ? <th>作者</th> : null}
                <th>狀態</th>
                <th>時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {replies.map((reply) => (
                <tr key={reply.id}>
                  <td className={styles.previewCell}>{excerpt(reply.body, 100)}</td>
                  <td>
                    <PrefetchLink href={`/threads/${reply.threadId}`}>{reply.threadTitle}</PrefetchLink>
                  </td>
                  <td>/{reply.boardSlug}</td>
                  {isSiteAdmin ? <td>{authorNames[reply.authorId] ?? "—"}</td> : null}
                  <td>
                    {reply.status === "approved"
                      ? "已通過"
                      : reply.status === "rejected"
                        ? "已駁回"
                        : "待審核"}
                  </td>
                  <td className={styles.catalogMeta}>{formatChanDate(reply.createdAt)}</td>
                  <td>
                    {reply.status === "pending" ? (
                      <ReplyModerateButtons replyId={reply.id} />
                    ) : (
                      <span className={styles.catalogMeta}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        basePath="/dashboard/replies"
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
