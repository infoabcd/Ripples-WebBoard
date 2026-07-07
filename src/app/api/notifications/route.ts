import { apiError, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { ensureDatabase } from "@/lib/init";
import {
  listUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/server/services/notification.service";

export async function GET() {
  await ensureDatabase();
  const viewer = await getSessionUser();
  if (!viewer) {
    return apiError("請先登入", 401);
  }

  const notifications = await listUserNotifications(viewer.id);
  return apiOk({ notifications });
}

export async function POST(request: Request) {
  await ensureDatabase();
  const viewer = await getSessionUser();
  if (!viewer) {
    return apiError("請先登入", 401);
  }

  const body = (await request.json()) as { id?: string; all?: boolean };
  if (body.all) {
    await markAllNotificationsRead(viewer.id);
    return apiOk();
  }

  if (!body.id) {
    return apiError("參數錯誤", 400);
  }

  const ok = await markNotificationRead(viewer.id, body.id);
  if (!ok) {
    return apiError("通知不存在", 404);
  }

  return apiOk();
}
