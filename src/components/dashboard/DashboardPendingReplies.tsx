import styles from "@/app/boards.module.css";
import { ReplyModerateButtons } from "@/components/AdminActions";
import PrefetchLink from "@/components/PrefetchLink";
import DashboardSectionHead from "@/components/dashboard/DashboardSectionHead";
import { excerpt } from "@/lib/admin";
import { formatChanDate } from "@/lib/format";
import type { DashboardPendingReply } from "@/server/services/dashboard.service";

export default function DashboardPendingReplies({
  replies,
  isSiteAdmin,
  authorNames,
  total,
}: {
  replies: DashboardPendingReply[];
  isSiteAdmin: boolean;
  authorNames: Record<string, string>;
  total?: number;
}) {
  const shown = replies.length;
  const allTotal = total ?? shown;

  return (
    <section id="queue-replies">
      <DashboardSectionHead
        title="待審回覆"
        shown={shown}
        total={allTotal}
        viewAllHref={allTotal > shown ? "/dashboard/replies?status=pending" : undefined}
      />
      {replies.length === 0 ? (
        <p className={styles.empty}>沒有待審回覆。</p>
      ) : (
        <div className={styles.catalogWrap}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>回覆內容</th>
                <th>所属主題</th>
                <th>分區</th>
                {isSiteAdmin ? <th>作者</th> : null}
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
                  <td className={styles.catalogMeta}>{formatChanDate(reply.createdAt)}</td>
                  <td>
                    <ReplyModerateButtons replyId={reply.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
