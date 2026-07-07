import Link from "next/link";

import styles from "@/app/boards.module.css";

export default function DashboardSectionHead({
  title,
  shown,
  total,
  viewAllHref,
}: {
  title: string;
  shown: number;
  total: number;
  viewAllHref?: string;
}) {
  const suffix =
    total > shown ? `（最近 ${shown} 條，共 ${total} 條）` : total > 0 ? `（共 ${total} 條）` : "";

  return (
    <div className={styles.sectionHeadRow}>
      <div className={styles.sectionHead}>
        {title}
        {suffix}
      </div>
      {viewAllHref && total > shown ? (
        <Link href={viewAllHref} className={styles.sectionHeadLink}>
          查看全部 →
        </Link>
      ) : null}
    </div>
  );
}
