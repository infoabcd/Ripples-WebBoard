import Link from "next/link";

import styles from "@/app/boards.module.css";
import BackLink from "@/components/BackLink";

export default function DashboardSubpageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.siteTitle} style={{ fontSize: 24 }}>
          {title}
        </h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        <p className={styles.subtitle}>
          [<BackLink />]
          <span className={styles.topBarSep} />
          [<Link href="/dashboard">返回概覽</Link>]
        </p>
      </div>
      {children}
    </>
  );
}
