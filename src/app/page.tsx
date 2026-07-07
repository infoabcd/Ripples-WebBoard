import Link from "next/link";

import styles from "./boards.module.css";
import PageHeadBrand from "@/components/PageHeadBrand";
import TopBar from "@/components/TopBar";
import { getSessionUser } from "@/lib/auth";
import { ensureDatabase } from "@/lib/init";
import { listBoards } from "@/server/services/board.service";

export default async function HomePage() {
  await ensureDatabase();
  const boards = await listBoards();
  const user = await getSessionUser();

  return (
    <main className={styles.shell}>
      <TopBar />

      <PageHeadBrand
        title="Ripples WebBoard - 漣漪社區"
        subtitle="知識應該被傳遞，工具應該能被使用，痛苦應該能被聽見，人應該重新連結。"
      />

      <div className={styles.infoStrip}>
        <span>
          <strong>{boards.length}</strong> 個分區
        </span>
        <span>{user ? `目前用戶：${user.displayName}` : "目前為訪客模式"}</span>
      </div>

      <section aria-label="分區列表">
        <div className={styles.boardGrid}>
          {boards.map((board) => (
            <article key={board.id} className={styles.boardCard}>
              <div className={styles.boardCardHead}>
                <Link href={`/boards/${board.slug}`} className={styles.boardSlug}>
                  /{board.slug}/
                </Link>
                <span className={styles.boardName}>{board.name}</span>
              </div>
              <p className={styles.boardDesc}>{board.description}</p>
              <div className={styles.boardCardFoot}>
                [<Link href={`/boards/${board.slug}`}>進入分區</Link>]
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        Ripples WebBoard 漣漪看板 · {new Date().getFullYear()} ·{" "}
        {/* [<Link href="/about">關於</Link>] ·{" "} */}
        <a href="https://dontalk.org" target="_blank" rel="noopener noreferrer">Dontalk(.org)</a>
      </footer>
    </main>
  );
}
