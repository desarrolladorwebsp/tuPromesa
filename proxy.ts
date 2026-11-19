import { NextResponse, type NextRequest } from "next/server";
import { adminCookie, privateResponseHeaders, validAdminSession } from "@/lib/auth/admin";

export function proxy(req: NextRequest) {
  const response = validAdminSession(req.cookies.get(adminCookie)?.value)
    ? NextResponse.next()
    : NextResponse.redirect(new URL("/login", req.url));

  response.headers.set("Cache-Control", privateResponseHeaders["Cache-Control"]);
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
