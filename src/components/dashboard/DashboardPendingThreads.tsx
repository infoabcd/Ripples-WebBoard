import Link from "next/link";

import styles from "@/app/boards.module.css";
import { ModerateButtons } from "@/components/AdminActions";
import PrefetchLink from "@/components/PrefetchLink";
import StatusBadge from "@/components/StatusBadge";
import DashboardSectionHead from "@/components/dashboard/DashboardSectionHead";
import { excerpt } from "@/lib/admin";
import { formatChanDate } from "@/lib/format";
import type { Board, Thread } from "@/lib/types";
import { getThreadVisibilityHint, visibilityLabel } from "@/lib/visibility";

export default async function DashboardPendingThreads({
  threads,
  boards,
  isSiteAdmin,
  authorNames,
  total,
}: {
  threads: Thread[];
  boards: Board[];
  isSiteAdmin: boolean;
  authorNames: Record<string, string>;
  total?: number;
}) {
  const shown = threads.length;
  const allTotal = total ?? shown;

  return (
    <section id="queue-threads">
      <DashboardSectionHead
        title="待審主題"
        shown={shown}
        total={allTotal}
        viewAllHref={allTotal > shown ? "/dashboard/threads?status=pending" : undefined}
      />
      {threads.length === 0 ? (
        <p className={styles.empty}>佇列為空。</p>
      ) : (
        <div className={styles.catalogWrap}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>主題</th>
                <th>摘要</th>
                <th>分區</th>
                {isSiteAdmin ? <th>作者</th> : null}
                {isSiteAdmin ? <th>受信</th> : null}
                <th>可見性</th>
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
                    <td className={styles.previewCell}>{excerpt(thread.body)}</td>
                    <td>/{board?.slug ?? "?"}</td>
                    {isSiteAdmin ? <td>{authorNames[thread.authorId] ?? "—"}</td> : null}
                    {isSiteAdmin ? <td>{thread.authorWasTrusted ? "是" : "否"}</td> : null}
                    <td>
                      <StatusBadge thread={thread} />
                      <div className={styles.catalogMeta}>
                        {visibilityLabel(getThreadVisibilityHint(thread))}
                      </div>
                    </td>
                    <td className={styles.catalogMeta}>{formatChanDate(thread.createdAt)}</td>
                    <td>
                      <ModerateButtons threadId={thread.id} />
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
