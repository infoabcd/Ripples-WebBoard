import { NextResponse } from "next/server";

export function apiError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/** 隱藏管理接口：對無權用戶统一返回 404 */
export function apiNotFound(message = "不存在") {
  return NextResponse.json({ ok: false, error: message }, { status: 404 });
}

export function apiOk<T extends Record<string, unknown>>(data: T = {} as T) {
  return NextResponse.json({ ok: true, ...data });
}
