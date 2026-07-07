import Link from "next/link";

import { requireSiteAdmin } from "@/lib/dashboard-auth";
import DashboardInviteCodes from "@/components/dashboard/DashboardInviteCodes";
import DashboardSubpageShell from "@/components/dashboard/DashboardSubpageShell";
import styles from "@/app/boards.module.css";
import { listInviteCodes } from "@/server/services/invite.service";

export default async function DashboardInvitesPage() {
  await requireSiteAdmin();
  const codes = await listInviteCodes();

  return (
    <DashboardSubpageShell
      title="邀請碼"
      subtitle={`共 ${codes.length} 個邀請碼`}
    >
      <p className={styles.subtitle} style={{ marginBottom: 12 }}>
        <Link href="/dashboard/invite-uses">查看邀請碼使用記錄 →</Link>
      </p>
      <DashboardInviteCodes codes={codes} />
    </DashboardSubpageShell>
  );
}
