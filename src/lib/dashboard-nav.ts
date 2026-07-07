export type DashboardNavItem = {
  href: string;
  label: string;
  siteAdminOnly?: boolean;
};

export const dashboardNavItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "概覽" },
  { href: "/dashboard/threads", label: "主題" },
  { href: "/dashboard/replies", label: "回覆" },
  { href: "/dashboard/users", label: "用戶", siteAdminOnly: true },
  { href: "/dashboard/logs", label: "日誌", siteAdminOnly: true },
  { href: "/dashboard/invites", label: "邀請碼", siteAdminOnly: true },
  { href: "/dashboard/boards", label: "分區", siteAdminOnly: true },
  { href: "/dashboard/moderators", label: "版主", siteAdminOnly: true },
];
