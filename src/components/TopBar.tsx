import Link from "next/link";

import SearchForm from "@/components/SearchForm";
import { getSessionUser } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/permissions";
import { ensureDatabase } from "@/lib/init";
import { countUnreadNotifications } from "@/server/services/notification.service";

import styles from "../app/boards.module.css";

export default async function TopBar() {
  await ensureDatabase();
  const user = await getSessionUser();
  const unreadCount = user ? await countUnreadNotifications(user.id) : 0;

  return (
    <header className={styles.siteHeader}>
      <nav className={styles.topBar} aria-label="導航">
        [<Link href="/" prefetch={false}>首頁</Link>]
        <span className={styles.topBarSep} />
        [<Link href="/search" prefetch={false}>搜尋</Link>]
        {user ? (
          <>
            <span className={styles.topBarSep} />
            [<Link href="/me" prefetch={false}>我的</Link>]
            <span className={styles.topBarSep} />
            [
            <Link href="/me?tab=notifications" prefetch={false}>
              通知{unreadCount > 0 ? `(${unreadCount})` : ""}
            </Link>
            ]
            <span className={styles.topBarSep}> | </span>
            [<span>{user.displayName}</span>]
            {canAccessAdmin(user) ? (
              <>
                <span className={styles.topBarSep} />
                [
                <Link href="/dashboard" prefetch={false}>
                  {user.role === "admin" ? "管理" : "版主"}
                </Link>
                ]
              </>
            ) : null}
            <span className={styles.topBarSep} />
            [
            <form action="/api/auth/logout" method="post" style={{ display: "inline" }}>
              <button type="submit">登出</button>
            </form>
            ]
          </>
        ) : (
          <>
            <span className={styles.topBarSep} />
            [<Link href="/login" prefetch={false}>登入</Link>]
            <span className={styles.topBarSep} />
            [<Link href="/register" prefetch={false}>註冊</Link>]
          </>
        )}
        <span className={styles.topBarSep}> | </span>
        [<Link href="/about" prefetch={false}>關於</Link>]
      </nav>
      <SearchForm />
    </header>
  );
}
