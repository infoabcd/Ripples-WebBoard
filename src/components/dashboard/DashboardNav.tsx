"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "@/app/boards.module.css";
import { dashboardNavItems } from "@/lib/dashboard-nav";

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardNav({ showSiteAdminSections }: { showSiteAdminSections: boolean }) {
  const pathname = usePathname();
  const items = dashboardNavItems.filter(
    (item) => showSiteAdminSections || !item.siteAdminOnly,
  );

  return (
    <nav className={styles.adminNav} aria-label="管理導航">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          prefetch={false}
          className={isActive(pathname, item.href) ? styles.adminNavActive : undefined}
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
