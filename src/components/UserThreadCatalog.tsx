import Link from "next/link";

import styles from "@/app/boards.module.css";
import StatusBadge from "@/components/StatusBadge";
import { formatChanDate } from "@/lib/format";
import type { Board, Thread } from "@/lib/types";
import { getReplyCount } from "@/server/services/reply.service";

export default async function UserThreadCatalog({
  threads,
  boards,
}: {
  threads: Thread[];
  boards: Board[];
}) {
  return (
    <div className={styles.catalogWrap}>
      <table className={styles.catalogTable}>
        <thead>
          <tr>
            <th>主題</th>
            <th>分區</th>
            <th>狀態</th>
            <th>R</th>
            <th>時間</th>
          </tr>
        </thead>
        <tbody>
          {await Promise.all(
            threads.map(async (thread) => {
              const board = boards.find((b) => b.id === thread.boardId);
              const replies = await getReplyCount(thread.id);
              return (
                <tr key={thread.id}>
                  <td className={styles.catalogSubject}>
                    <Link href={`/threads/${thread.id}`}>{thread.title}</Link>
                  </td>
                  <td>/{board?.slug ?? "?"}</td>
                  <td>
                    <StatusBadge thread={thread} />
                  </td>
                  <td className={styles.catalogReplies}>{replies}</td>
                  <td className={styles.catalogLast}>{formatChanDate(thread.createdAt)}</td>
                </tr>
              );
            }),
          )}
        </tbody>
      </table>
    </div>
  );
}
