const buckets = new Map<string, number[]>();

/** 滑動窗口頻率限制，返回 true 表示允許通過 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (timestamps.length >= limit) {
    buckets.set(key, timestamps);
    return false;
  }
  timestamps.push(now);
  buckets.set(key, timestamps);
  return true;
}

export function rateLimitKey(userId: string, action: string): string {
  return `${action}:${userId}`;
}
