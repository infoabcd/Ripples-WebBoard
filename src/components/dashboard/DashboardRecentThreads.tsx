import styles from "@/app/boards.module.css";
import { ModerateButtons } from "@/components/AdminActions";
import DashboardSectionHead from "@/components/dashboard/DashboardSectionHead";
import PrefetchLink from "@/components/PrefetchLink";
import { formatChanDate } from "@/lib/format";
import type { Board, Thread } from "@/lib/types";

function statusClass(status: string): string {
  if (status === "approved") return styles.statusApproved;
  if (status === "rejected") return styles.statusRejected;
  return styles.statusPending;
}

export default function DashboardRecentThreads({
  threads,
  boards,
  isSiteAdmin,
  authorNames,
  replyCounts,
  total,
}: {
  threads: Thread[];
  boards: Board[];
  isSiteAdmin: boolean;
  authorNames: Record<string, string>;
  replyCounts: Record<string, number>;
  total: number;
}) {
  return (
    <section id="all-threads">
      <DashboardSectionHead
        title="全部主題"
        shown={threads.length}
        total={total}
        viewAllHref="/dashboard/threads"
      />
      {threads.length === 0 ? (
        <p className={styles.empty}>暫無主題。</p>
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
    </section>
  );
}
