export const DASHBOARD_PREVIEW_LIMIT = 20;
export const DASHBOARD_PAGE_SIZE = 50;

export function parsePage(raw?: string): number {
  return Math.max(1, Number(raw) || 1);
}

export function totalPages(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function clampPage(page: number, total: number, pageSize: number): number {
  return Math.min(page, totalPages(total, pageSize));
}

export function pageOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}
