import Link from "next/link";

import styles from "@/app/boards.module.css";

type MenuItem = {
  href: string;
  title: string;
  description: string;
  count?: number;
  highlight?: boolean;
};

export default function DashboardMenu({
  items,
}: {
  items: MenuItem[];
}) {
  return (
    <section id="menu">
      <div className={styles.sectionHead}>管理入口</div>
      <div className={styles.adminMenuGrid}>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            className={item.highlight ? styles.adminMenuCardHighlight : styles.adminMenuCard}
          >
            <strong>
              {item.title}
              {item.count !== undefined ? ` (${item.count})` : ""}
            </strong>
            <span>{item.description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
