import { requireSiteAdmin } from "@/lib/dashboard-auth";
import DashboardModerators from "@/components/dashboard/DashboardModerators";
import DashboardSubpageShell from "@/components/dashboard/DashboardSubpageShell";
import { loadDashboardBoardDetails } from "@/server/services/dashboard.service";
import { listAllUsers } from "@/server/services/admin.service";
import { listModeratorRows } from "@/server/services/moderator.service";

export default async function DashboardModeratorsPage() {
  await requireSiteAdmin();
  const [boards, users, moderatorRows] = await Promise.all([
    loadDashboardBoardDetails(),
    listAllUsers(),
    listModeratorRows(),
  ]);

  return (
    <DashboardSubpageShell title="版主指派" subtitle="為各分區指派或移除版主">
      <DashboardModerators
        boards={boards}
        users={users.filter((user) => user.role !== "admin")}
        moderatorRows={moderatorRows}
      />
    </DashboardSubpageShell>
  );
}
