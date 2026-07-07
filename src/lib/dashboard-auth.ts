import { notFound } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { ensureDatabase } from "@/lib/init";
import { canAccessAdmin, canManageUsers } from "@/lib/permissions";
import type { SessionUser } from "@/lib/types";

export async function requireDashboardViewer(): Promise<SessionUser> {
  await ensureDatabase();
  const viewer = await getSessionUser();
  if (!viewer || !canAccessAdmin(viewer)) notFound();
  return viewer;
}

export async function requireSiteAdmin(): Promise<SessionUser> {
  const viewer = await requireDashboardViewer();
  if (!canManageUsers(viewer)) notFound();
  return viewer;
}
