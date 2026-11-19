import { cookies } from "next/headers";
import { adminCookie, privateResponseHeaders, validAdminOrigin } from "@/lib/auth/admin";

export async function POST(req: Request) {
  if (!validAdminOrigin(req)) {
    return Response.json({ ok: false }, { status: 403, headers: privateResponseHeaders });
  }

  (await cookies()).delete(adminCookie);
  return Response.json({ ok: true }, { headers: privateResponseHeaders });
}
