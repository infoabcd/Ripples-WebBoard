import styles from "@/app/boards.module.css";
import type { AdminDashboardData } from "@/server/services/admin.service";

export default function DashboardStats({
  stats,
  isSiteAdmin,
}: {
  stats: AdminDashboardData;
  isSiteAdmin: boolean;
}) {
  return (
    <div className={styles.statGrid}>
      <div className={styles.statCard}>
        <strong>{stats.threads.pending}</strong>
        <span>待審主題</span>
      </div>
      <div className={styles.statCard}>
        <strong>{stats.replies.pending}</strong>
        <span>待審回覆</span>
      </div>
      <div className={styles.statCard}>
        <strong>{stats.threads.approved}</strong>
        <span>已過審主題</span>
      </div>
      {isSiteAdmin ? (
        <div className={styles.statCard}>
          <strong>{stats.users}</strong>
          <span>註冊用戶</span>
        </div>
      ) : null}
      <div className={styles.statCard}>
        <strong>{stats.boards}</strong>
        <span>{isSiteAdmin ? "分區" : "所轄分區"}</span>
      </div>
      {isSiteAdmin ? (
        <>
          <div className={styles.statCard}>
            <strong>{stats.likes}</strong>
            <span>點讚記錄</span>
          </div>
          <div className={styles.statCard}>
            <strong>{stats.favorites}</strong>
            <span>收藏記錄</span>
          </div>
        </>
      ) : null}
    </div>
  );
}
