import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { clearSessionCookieOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const jar = await cookies();
  jar.set(clearSessionCookieOptions());
  return NextResponse.redirect(new URL("/", request.url));
}
