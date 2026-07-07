import styles from "@/app/boards.module.css";
import { TrustToggle } from "@/components/AdminActions";
import DashboardSectionHead from "@/components/dashboard/DashboardSectionHead";
import { formatChanDate } from "@/lib/format";
import type { User } from "@/lib/types";

export default function DashboardUsers({
  users,
  total,
}: {
  users: User[];
  total: number;
}) {
  return (
    <section id="users">
      <DashboardSectionHead
        title="用戶與受信"
        shown={users.length}
        total={total}
        viewAllHref="/dashboard/users"
      />
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
    </section>
  );
}
