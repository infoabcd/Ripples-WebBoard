import { requireDashboardViewer } from "@/lib/dashboard-auth";
import { loadDashboardOverview } from "@/server/services/dashboard.service";

import DashboardMenu from "@/components/dashboard/DashboardMenu";
import DashboardPendingReplies from "@/components/dashboard/DashboardPendingReplies";
import DashboardPendingThreads from "@/components/dashboard/DashboardPendingThreads";
import DashboardStats from "@/components/dashboard/DashboardStats";
import PageBackBar from "@/components/PageBackBar";
import styles from "@/app/boards.module.css";

export default async function DashboardPage() {
  const viewer = await requireDashboardViewer();
  const data = await loadDashboardOverview(viewer);

  const menuItems = [
    {
      href: "/dashboard/threads?status=pending",
      title: "待審主題",
      description: "審核新發布的主題",
      count: data.pendingThreadTotal,
      highlight: data.pendingThreadTotal > 0,
    },
    {
      href: "/dashboard/replies?status=pending",
      title: "待審回覆",
      description: "審核樓內回覆",
      count: data.pendingReplyTotal,
      highlight: data.pendingReplyTotal > 0,
    },
    {
      href: "/dashboard/threads",
      title: "全部主題",
      description: "瀏覽、篩選全部主題",
      count: data.threadTotal,
    },
    {
      href: "/dashboard/replies",
      title: "全部回覆",
      description: "瀏覽、篩選全部回覆",
    },
    ...(data.isSiteAdmin
      ? [
          {
            href: "/dashboard/users",
            title: "用戶與受信",
            description: "管理註冊用戶與受信狀態",
            count: data.userTotal,
          },
          {
            href: "/dashboard/logs",
            title: "操作日誌",
            description: "查看管理操作記錄",
            count: data.auditLogTotal,
          },
          {
            href: "/dashboard/invites",
            title: "邀請碼",
            description: "產生與管理邀請碼",
            count: data.inviteCodeTotal,
          },
          {
            href: "/dashboard/invite-uses",
            title: "邀請碼使用",
            description: "誰用哪個碼註冊了帳號",
            count: data.inviteUseTotal,
          },
          {
            href: "/dashboard/boards",
            title: "分區管理",
            description: "建立、編輯論壇分區",
            count: data.boardCount,
          },
          {
            href: "/dashboard/moderators",
            title: "版主指派",
            description: "為分區指派版主",
          },
        ]
      : []),
  ];

  return (
    <>
      <div className={styles.pageHead} id="overview">
        <h1 className={styles.siteTitle} style={{ fontSize: 24 }}>
          {data.isSiteAdmin ? "管理後台" : "版主後台"}
        </h1>
        <p className={styles.subtitle}>
          {data.isSiteAdmin ? (
            <>
              概覽與待審佇列。完整列表請從下方入口進入。資料庫目前使用：<code>{data.dialect}</code>
            </>
          ) : (
            <>
              管理所轄分區：
              {data.boards.map((board) => ` /${board.slug}/`).join("")}
            </>
          )}
        </p>
      </div>

      <PageBackBar />

      <DashboardStats stats={data.stats} isSiteAdmin={data.isSiteAdmin} />
      <DashboardMenu items={menuItems} />

      {data.pendingThreadTotal > 0 ? (
        <DashboardPendingThreads
          threads={data.pendingThreads}
          boards={data.boards}
          isSiteAdmin={data.isSiteAdmin}
          authorNames={data.authorNames}
          total={data.pendingThreadTotal}
        />
      ) : null}

      {data.pendingReplyTotal > 0 ? (
        <DashboardPendingReplies
          replies={data.pendingReplies}
          isSiteAdmin={data.isSiteAdmin}
          authorNames={data.authorNames}
          total={data.pendingReplyTotal}
        />
      ) : null}

      {data.pendingThreadTotal === 0 && data.pendingReplyTotal === 0 ? (
        <p className={styles.empty}>目前沒有待審內容。</p>
      ) : null}
    </>
  );
}
