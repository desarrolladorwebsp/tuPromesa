import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const adminCookie = "admin_auth";
export const sessionSeconds = 8 * 60 * 60;

function sameString(a: string, b: string) {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
}

export function validAdminCredentials(email: unknown, password: unknown) {
  const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword ||
      typeof email !== "string" || typeof password !== "string" ||
      email.length > 254 || password.length > 512) return false;

  const emailMatches = sameString(email.trim().toLowerCase(), expectedEmail);
  const passwordMatches = sameString(password, expectedPassword);
  return emailMatches && passwordMatches;
}

function sign(payload: string) {
  const key = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!key) return null;

  return createHmac("sha256", key).update("tupromesa-admin-v1:").update(payload).digest("base64url");
}

export function makeAdminSession() {
  const expires = Math.floor(Date.now() / 1000) + sessionSeconds;
  const payload = `${expires}.${randomBytes(24).toString("base64url")}`;
  const signature = sign(payload);
  if (!signature) throw new Error("Falta configurar la sesión de administrador.");
  return `${payload}.${signature}`;
}

export function validAdminSession(token: string | undefined) {
  if (!token || !/^\d{10}\.[\w-]{32}\.[\w-]{43}$/.test(token)) return false;
  const [expiry, nonce, signature] = token.split(".");
  if (Number(expiry) <= Math.floor(Date.now() / 1000)) return false;
  const expected = sign(`${expiry}.${nonce}`);
  return expected !== null && sameString(signature, expected);
}

export async function hasAdminSession() {
  return validAdminSession((await cookies()).get(adminCookie)?.value);
}

export function validAdminOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin === null) return true;

  const { protocol, host } = new URL(request.url);
  return origin === `${protocol}//${request.headers.get("host") || host}`;
}

export const privateResponseHeaders = { "Cache-Control": "private, no-store" };
