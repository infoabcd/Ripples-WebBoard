import Link from "next/link";

import styles from "@/app/boards.module.css";
import { auditActionLabels } from "@/lib/audit-labels";
import { requireSiteAdmin } from "@/lib/dashboard-auth";
import { formatChanDate } from "@/lib/format";
import { parsePage } from "@/lib/pagination";
import DashboardSubpageShell from "@/components/dashboard/DashboardSubpageShell";
import Pagination from "@/components/Pagination";
import { listAdminAuditLogs } from "@/server/services/admin-list.service";

const FILTER_ACTIONS = [
  "invite.use",
  "invite.create",
  "thread.approve",
  "thread.reject",
  "reply.approve",
  "reply.reject",
  "user.trust",
  "user.untrust",
] as const;

export default async function DashboardLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string }>;
}) {
  await requireSiteAdmin();
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const action = sp.action?.trim() || null;
  const { logs, total, page: safePage, totalPages } = await listAdminAuditLogs({ page, action });

  return (
    <DashboardSubpageShell title="操作日誌" subtitle={`共 ${total} 條記錄`}>
      <div className={styles.filterBar}>
        <span>篩選：</span>
        <Link href="/dashboard/logs" className={!action ? styles.filterActive : undefined}>
          全部
        </Link>
        {FILTER_ACTIONS.map((item) => (
          <Link
            key={item}
            href={`/dashboard/logs?action=${encodeURIComponent(item)}`}
            className={action === item ? styles.filterActive : undefined}
          >
            {auditActionLabels[item] ?? item}
          </Link>
        ))}
      </div>

      {logs.length === 0 ? (
        <p className={styles.empty}>暫無操作記錄。</p>
      ) : (
        <div className={styles.catalogWrap}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>時間</th>
                <th>操作者</th>
                <th>類型</th>
                <th>摘要</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className={styles.catalogMeta}>{formatChanDate(log.createdAt)}</td>
                  <td>{log.actorName}</td>
                  <td>{auditActionLabels[log.action] ?? log.action}</td>
                  <td>{log.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        basePath="/dashboard/logs"
        page={safePage}
        totalPages={totalPages}
        query={action ? { action } : undefined}
      />
    </DashboardSubpageShell>
  );
}
