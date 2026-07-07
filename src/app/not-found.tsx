import Link from "next/link";

import styles from "./boards.module.css";
import BackLink from "@/components/BackLink";
import TopBar from "@/components/TopBar";

export default function NotFound() {
  return (
    <main className={styles.shell}>
      <TopBar />
      <div className={styles.notFoundWrap}>
        <h1 className={styles.notFoundCode}>404</h1>
        <p className={styles.notFoundText}>頁面不存在</p>
        <p className={styles.notFoundLink}>
          [<BackLink />]
          <span className={styles.topBarSep} />
          [<Link href="/">返回首頁</Link>]
        </p>
      </div>
    </main>
  );
}
