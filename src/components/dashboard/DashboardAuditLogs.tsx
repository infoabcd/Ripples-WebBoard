import { auditActionLabels } from "@/lib/audit-labels";
import type { AuditLog } from "@/lib/types";

import styles from "@/app/boards.module.css";
import DashboardSectionHead from "@/components/dashboard/DashboardSectionHead";
import { formatChanDate } from "@/lib/format";

export default function DashboardAuditLogs({
  logs,
  total,
}: {
  logs: AuditLog[];
  total: number;
}) {
  return (
    <section id="audit-logs">
      <DashboardSectionHead
        title="操作日誌"
        shown={logs.length}
        total={total}
        viewAllHref="/dashboard/logs"
      />
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
    </section>
  );
}
