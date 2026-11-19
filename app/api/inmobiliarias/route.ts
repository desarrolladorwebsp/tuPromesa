import { ObjectId } from "mongodb";
import { hasAdminSession, privateResponseHeaders, validAdminOrigin } from "@/lib/auth/admin";
import { getDb } from "@/lib/db/mongodb";
import { publicCompanyFilter } from "@/lib/db/public-companies";

const collectionName = "inmobiliarias";
const catalogProjection = { _id: 1, name: 1, logoUrl: 1 };
const adminProjection = { ...catalogProjection, slug: 1, observation: 1, website: 1, status: 1, createdAt: 1 };

export async function GET(req: Request) {
  const admin = new URL(req.url).searchParams.get("admin") === "1";
  if (admin && !await hasAdminSession()) return error("Sesión de administrador requerida.", 401);

  try {
    const db = await getDb();
    const data = await db.collection(collectionName)
      .find(admin ? {} : publicCompanyFilter, { projection: admin ? adminProjection : catalogProjection })
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json(data, { headers: admin ? privateResponseHeaders : { "Cache-Control": "no-store" } });
  } catch {
    return error("No se pudo cargar el catálogo de inmobiliarias.", 500);
  }
}

function error(message: string, status = 400) {
  return Response.json({ ok: false, error: message }, { status, headers: privateResponseHeaders });
}

function success(data = {}) {
  return Response.json({ ok: true, ...data }, { headers: privateResponseHeaders });
}

async function authorize(req: Request) {
  if (!await hasAdminSession()) return error("Sesión de administrador requerida.", 401);
  if (!validAdminOrigin(req)) return error("Origen de la solicitud no autorizado.", 403);
  return null;
}

async function readBody(req: Request): Promise<Record<string, unknown> | null> {
  const body = await req.json().catch(() => null);
  return body && typeof body === "object" && !Array.isArray(body) ? body : null;
}

function companyFields(body: Record<string, unknown>) {
  const field = (key: string) => typeof body[key] === "string" ? body[key].trim() : "";
  const name = field("name");
  const logoUrl = field("logoUrl");
  const status = field("status");
  if (!name || name.length > 120 || !logoUrl || (status !== "Activa" && status !== "Oculta")) return null;
  return { name, logoUrl, status, observation: field("observation"), website: field("website") };
}

export async function POST(req: Request) {
  const unauthorized = await authorize(req);
  if (unauthorized) return unauthorized;

  const body = await readBody(req);
  const company = body && companyFields(body);
  if (!company) return error("Completa el nombre, el logo y el estado de la inmobiliaria.");

  try {
    const db = await getDb();
    const result = await db.collection(collectionName).insertOne({ ...company, createdAt: new Date() });
    return success({ id: result.insertedId });
  } catch {
    return error("No se pudo crear la inmobiliaria.", 500);
  }
}

export async function PUT(req: Request) {
  const unauthorized = await authorize(req);
  if (unauthorized) return unauthorized;

  const body = await readBody(req);
  const id = body?.id;
  const company = body && companyFields(body);
  if (typeof id !== "string" || !ObjectId.isValid(id) || !company) {
    return error("La inmobiliaria o los campos enviados no son válidos.");
  }

  try {
    const db = await getDb();
    const result = await db.collection(collectionName).updateOne({ _id: new ObjectId(id) }, { $set: company });
    return result.matchedCount ? success() : error("La inmobiliaria no existe.", 404);
  } catch {
    return error("No se pudo actualizar la inmobiliaria.", 500);
  }
}

export async function DELETE(req: Request) {
  const unauthorized = await authorize(req);
  if (unauthorized) return unauthorized;

  const id = (await readBody(req))?.id;
  if (typeof id !== "string" || !ObjectId.isValid(id)) return error("La inmobiliaria no es válida.");

  try {
    const db = await getDb();
    const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount ? success() : error("La inmobiliaria no existe.", 404);
  } catch {
    return error("No se pudo eliminar la inmobiliaria.", 500);
  }
}
