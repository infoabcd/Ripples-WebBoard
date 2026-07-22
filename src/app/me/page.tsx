import Link from "next/link";
import { redirect } from "next/navigation";

import styles from "@/app/boards.module.css";
import EmailSettings from "@/components/EmailSettings";
import NotificationList from "@/components/NotificationList";
import PageBackBar from "@/components/PageBackBar";
import ProfilePrivacyNotice from "@/components/ProfilePrivacyNotice";
import TopBar from "@/components/TopBar";
import TrustedNotice from "@/components/TrustedNotice";
import UserThreadCatalog from "@/components/UserThreadCatalog";
import { getSessionUser } from "@/lib/auth";
import { formatChanDate } from "@/lib/format";
import { ensureDatabase } from "@/lib/init";
import { canViewThread } from "@/lib/visibility";
import { listBoards } from "@/server/services/board.service";
import { isEmailConfigured } from "@/server/services/email.service";
import {
  listUserFavoriteThreads,
  listUserLikedThreads,
} from "@/server/services/engagement.service";
import {
  countUnreadNotifications,
  listUserNotifications,
} from "@/server/services/notification.service";
import { listUserThreads } from "@/server/services/thread.service";
import { getUserById } from "@/server/services/user.service";

const tabs = [
  { id: "posts", label: "我的主題" },
  { id: "likes", label: "我的點讚" },
  { id: "favorites", label: "我的收藏" },
  { id: "notifications", label: "通知" },
  { id: "settings", label: "設定" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default async function MePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await ensureDatabase();
  const viewer = await getSessionUser();
  if (!viewer) redirect("/login");

  const { tab: rawTab } = await searchParams;
  const tab: TabId = tabs.some((t) => t.id === rawTab) ? (rawTab as TabId) : "posts";

  const boards = await listBoards();
  const user = await getUserById(viewer.id);
  const myThreads = await listUserThreads(viewer.id);
  const likedThreads = (await listUserLikedThreads(viewer.id)).filter((t) =>
    canViewThread(viewer, t),
  );
  const favoriteThreads = (await listUserFavoriteThreads(viewer.id)).filter((t) =>
    canViewThread(viewer, t),
  );
  const notifications = await listUserNotifications(viewer.id);
  const unreadCount = await countUnreadNotifications(viewer.id);

  const list =
    tab === "likes" ? likedThreads : tab === "favorites" ? favoriteThreads : myThreads;

  const showPrivacyNotice =
    tab === "posts" || tab === "likes" || tab === "favorites";

  return (
    <main className={styles.shell}>
      <TopBar />

      <div className={styles.pageHead}>
        <h1 className={styles.siteTitle} style={{ fontSize: 24 }}>
          {viewer.displayName}
        </h1>
        <p className={styles.subtitle}>
          @{viewer.username} · {viewer.isTrusted ? "受信會員" : "普通會員"}
          {viewer.role === "admin" ? " · 站長" : viewer.role === "moderator" ? " · 版主" : ""} ·{" "}
          [<Link href={`/u/${viewer.username}`}>公開主頁</Link>]
          {unreadCount > 0 ? (
            <>
              {" "}
              · <strong>{unreadCount}</strong> 條未讀通知
            </>
          ) : null}
        </p>
      </div>

      <PageBackBar />
      <TrustedNotice />

      {showPrivacyNotice ? <ProfilePrivacyNotice /> : null}

      <nav className={styles.meNav} aria-label="個人中心">
        {tabs.map((item) => (
          <Link
            key={item.id}
            href={`/me?tab=${item.id}`}
            className={tab === item.id ? styles.meActive : undefined}
          >
            {item.label}
            {item.id === "notifications" && unreadCount > 0 ? ` (${unreadCount})` : ""}
          </Link>
        ))}
      </nav>

      {tab === "notifications" ? (
        <NotificationList initialNotifications={notifications} />
      ) : tab === "settings" ? (
        <EmailSettings initialEmail={user?.email ?? null} emailEnabled={isEmailConfigured()} />
      ) : list.length === 0 ? (
        <p className={styles.empty}>這裡還沒有內容。</p>
      ) : (
        <UserThreadCatalog threads={list} boards={boards} />
      )}
    </main>
  );
}
