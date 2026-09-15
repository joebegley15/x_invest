import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, expectedAccessValue } from "@/lib/access-token";

export async function proxy(req: NextRequest) {
  const value = req.cookies.get(ACCESS_COOKIE)?.value;
  if (value === (await expectedAccessValue())) return NextResponse.next();

  const url = new URL("/login", req.url);
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*", "/judge/:path*"] };