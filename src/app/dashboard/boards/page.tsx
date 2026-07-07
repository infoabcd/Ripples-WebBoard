import { requireSiteAdmin } from "@/lib/dashboard-auth";
import DashboardBoards from "@/components/dashboard/DashboardBoards";
import DashboardSubpageShell from "@/components/dashboard/DashboardSubpageShell";
import { loadDashboardBoardDetails } from "@/server/services/dashboard.service";

export default async function DashboardBoardsPage() {
  await requireSiteAdmin();
  const boards = await loadDashboardBoardDetails();

  return (
    <DashboardSubpageShell title="分區管理" subtitle={`共 ${boards.length} 個分區`}>
      <DashboardBoards boards={boards} />
    </DashboardSubpageShell>
  );
}
