import { requireSiteAdmin } from "@/lib/dashboard-auth";
import { formatChanDate } from "@/lib/format";
import { parsePage } from "@/lib/pagination";
import { TrustToggle } from "@/components/AdminActions";
import DashboardSubpageShell from "@/components/dashboard/DashboardSubpageShell";
import Pagination from "@/components/Pagination";
import styles from "@/app/boards.module.css";
import { listAdminUsers } from "@/server/services/admin-list.service";

export default async function DashboardUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireSiteAdmin();
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const { users, total, page: safePage, totalPages } = await listAdminUsers({ page });

  return (
    <DashboardSubpageShell title="用戶與受信" subtitle={`共 ${total} 位用戶`}>
      {users.length === 0 ? (
        <p className={styles.empty}>暫無用戶。</p>
      ) : (
        <div className={styles.catalogWrap}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>顯示名稱</th>
                <th>用戶名</th>
                <th>角色</th>
                <th>受信</th>
                <th>註冊時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.displayName}</td>
                  <td>{user.username}</td>
                  <td>
                    {user.role === "admin"
                      ? "站長 (admin)"
                      : user.role === "moderator"
                        ? "版主 (moderator)"
                        : "會員 (member)"}
                  </td>
                  <td>{user.isTrusted ? "是" : "否"}</td>
                  <td className={styles.catalogMeta}>{formatChanDate(user.createdAt)}</td>
                  <td>
                    {user.role === "admin" ? (
                      <span className={styles.catalogMeta}>站長</span>
                    ) : user.role === "moderator" ? (
                      <span className={styles.catalogMeta}>版主</span>
                    ) : (
                      <TrustToggle userId={user.id} isTrusted={user.isTrusted} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination basePath="/dashboard/users" page={safePage} totalPages={totalPages} />
    </DashboardSubpageShell>
  );
}
