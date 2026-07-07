import Link from "next/link";

import styles from "@/app/boards.module.css";
import BackLink from "@/components/BackLink";

export default function PageBackBar({
  fallbackHref = "/",
  showHome = true,
  children,
}: {
  fallbackHref?: string;
  showHome?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.actionBar}>
      [<BackLink fallbackHref={fallbackHref} />]
      {showHome ? (
        <>
          <span className={styles.topBarSep} />
          [<Link href="/">返回首頁</Link>]
        </>
      ) : null}
      {children}
    </div>
  );
}
