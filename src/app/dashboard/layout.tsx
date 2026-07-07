import { notFound } from "next/navigation";

import TopBar from "@/components/TopBar";
import DashboardNav from "@/components/dashboard/DashboardNav";
import styles from "@/app/boards.module.css";
import { getSessionUser } from "@/lib/auth";
import { ensureDatabase } from "@/lib/init";
import { canAccessAdmin, canManageUsers } from "@/lib/permissions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await ensureDatabase();
  const viewer = await getSessionUser();
  if (!viewer || !canAccessAdmin(viewer)) notFound();

  return (
    <main className={styles.shell}>
      <TopBar />
      <DashboardNav showSiteAdminSections={canManageUsers(viewer)} />
      {children}
    </main>
  );
}
