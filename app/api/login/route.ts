import { cookies } from "next/headers";
import {
  adminCookie, makeAdminSession, privateResponseHeaders, sessionSeconds,
  validAdminCredentials, validAdminOrigin,
} from "@/lib/auth/admin";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!validAdminOrigin(req) || !validAdminCredentials(body?.email, body?.password)) {
    return Response.json(
      { ok: false, error: "Credenciales incorrectas" },
      { status: 401, headers: privateResponseHeaders },
    );
  }

  (await cookies()).set(adminCookie, makeAdminSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: sessionSeconds,
  });

  return Response.json({ ok: true }, { headers: privateResponseHeaders });
}
