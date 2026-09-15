import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, JUDGE_COOKIE, expectedAdminValue, expectedJudgeValue } from "@/lib/access-token";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPath = pathname.startsWith("/admin");
  const role = isAdminPath ? "admin" : "judge";
  const cookieName = isAdminPath ? ADMIN_COOKIE : JUDGE_COOKIE;
  const expected = isAdminPath ? await expectedAdminValue() : await expectedJudgeValue();
  const value = req.cookies.get(cookieName)?.value;

  if (value === expected) return NextResponse.next();

  const url = new URL("/login", req.url);
  url.searchParams.set("role", role);
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*", "/judge/:path*"] };
