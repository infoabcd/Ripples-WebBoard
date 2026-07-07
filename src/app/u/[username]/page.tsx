import Link from "next/link";
import { notFound } from "next/navigation";

import styles from "@/app/boards.module.css";
import BackLink from "@/components/BackLink";
import PageBackBar from "@/components/PageBackBar";
import ProfilePrivacyNotice from "@/components/ProfilePrivacyNotice";
import TopBar from "@/components/TopBar";
import UserThreadCatalog from "@/components/UserThreadCatalog";
import { getSessionUser } from "@/lib/auth";
import { formatChanDate } from "@/lib/format";
import { ensureDatabase } from "@/lib/init";
import { canViewThread } from "@/lib/visibility";
import { listBoards } from "@/server/services/board.service";
import { listUserLikedThreads } from "@/server/services/engagement.service";
import { listPublicThreadsByUser } from "@/server/services/thread.service";
import { getUserByUsername } from "@/server/services/user.service";

const profileTabs = [
  { id: "posts", label: "公開主題" },
  { id: "likes", label: "點讚" },
] as const;

type ProfileTabId = (typeof profileTabs)[number]["id"];

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  await ensureDatabase();
  const { username } = await params;
  const user = await getUserByUsername(username.toLowerCase());
  if (!user) notFound();

  const viewer = await getSessionUser();
  if (!viewer) {
    return (
      <main className={styles.shell}>
        <TopBar />
        <div className={styles.pageHead}>
          <h1 className={styles.siteTitle} style={{ fontSize: 24 }}>
            會員主頁
          </h1>
        </div>
        <PageBackBar />
        <p className={styles.empty}>未登入會員無法查看正式會員的個人介面。</p>
        <p className={styles.subtitle} style={{ marginTop: 12 }}>
          [<Link href="/login">登入</Link>]<span className={styles.topBarSep} />[
          <Link href="/register">註冊</Link>]
        </p>
      </main>
    );
  }

  const sp = await searchParams;
  const tab: ProfileTabId = profileTabs.some((t) => t.id === sp.tab)
    ? (sp.tab as ProfileTabId)
    : "posts";

  const boards = await listBoards();
  const isSelf = viewer.id === user.id;
  const posts = await listPublicThreadsByUser(user.id, viewer);
  const likedThreads = (await listUserLikedThreads(user.id)).filter((thread) =>
    canViewThread(viewer, thread),
  );
  const list = tab === "likes" ? likedThreads : posts;

  return (
    <main className={styles.shell}>
      <TopBar />

      <div className={styles.pageHead}>
        <h1 className={styles.siteTitle} style={{ fontSize: 24 }}>
          {user.displayName}
        </h1>
        <p className={styles.subtitle}>
          @{user.username} · {user.isTrusted ? "受信會員" : "普通會員"}
          {user.role === "admin" ? " · 站長" : user.role === "moderator" ? " · 版主" : ""} · 加入於{" "}
          {formatChanDate(user.createdAt)}
        </p>
      </div>

      {isSelf ? <ProfilePrivacyNotice /> : null}

      <div className={styles.actionBar}>
        [<BackLink />]
        <span className={styles.topBarSep} />
        [<Link href="/">返回首頁</Link>]
        {isSelf ? (
          <>
            <span className={styles.topBarSep} />
            [<Link href="/me">個人中心</Link>]
          </>
        ) : null}
      </div>

      <nav className={styles.meNav} aria-label="用戶主页">
        {profileTabs.map((item) => (
          <Link
            key={item.id}
            href={`/u/${user.username}?tab=${item.id}`}
            className={tab === item.id ? styles.meActive : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.infoStrip}>
        <span>
          {tab === "likes" ? "點讚" : "公開主題"} <strong>{list.length}</strong>
        </span>
      </div>

      {list.length === 0 ? (
        <p className={styles.empty}>
          {tab === "likes" ? "暫無對你可見的點讚主題。" : "該用戶暫無對你可見的主題。"}
        </p>
      ) : (
        <UserThreadCatalog threads={list} boards={boards} />
      )}
    </main>
  );
}
