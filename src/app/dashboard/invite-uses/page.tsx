import { requireSiteAdmin } from "@/lib/dashboard-auth";
import { formatChanDate } from "@/lib/format";
import { parsePage } from "@/lib/pagination";
import DashboardSubpageShell from "@/components/dashboard/DashboardSubpageShell";
import Pagination from "@/components/Pagination";
import styles from "@/app/boards.module.css";
import { listAdminInviteUses } from "@/server/services/admin-list.service";

export default async function DashboardInviteUsesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireSiteAdmin();
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const { uses, total, page: safePage, totalPages } = await listAdminInviteUses({ page });

  return (
    <DashboardSubpageShell title="邀請碼使用記錄" subtitle={`共 ${total} 條記錄`}>
      {uses.length === 0 ? (
        <p className={styles.empty}>還沒有人使用邀請碼註冊。</p>
      ) : (
        <div className={styles.catalogWrap}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>時間</th>
                <th>邀請碼</th>
                <th>註冊用戶</th>
                <th>用戶名</th>
              </tr>
            </thead>
            <tbody>
              {uses.map((item) => (
                <tr key={item.id}>
                  <td className={styles.catalogMeta}>{formatChanDate(item.usedAt)}</td>
                  <td>
                    <code>{item.inviteCode}</code>
                  </td>
                  <td>{item.displayName}</td>
                  <td>@{item.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination basePath="/dashboard/invite-uses" page={safePage} totalPages={totalPages} />
    </DashboardSubpageShell>
  );
}
