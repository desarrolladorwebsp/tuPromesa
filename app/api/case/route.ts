import { createHash, randomUUID } from "node:crypto";
import { MongoServerError, ObjectId } from "mongodb";
import {
  amountOptions, communicationOptions, isLegalReviewStatus, isPublicationCategory, isPublicationResolution,
} from "@/constants/cases";
import { hasAdminSession, privateResponseHeaders, validAdminOrigin } from "@/lib/auth/admin";
import { getDb } from "@/lib/db/mongodb";
import { publicCompanyFilter } from "@/lib/db/public-companies";

const privateTextFields = {
  firstName: 100,
  lastName: 100,
  rut: 20,
  email: 254,
  phone: 25,
  incidentDate: 10,
  claimedAmount: 50,
  issueDescription: 5000,
  expectedSolution: 2000,
  priorCommunication: 80,
  claimObjective: 2000,
} as const;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function response(data: object, status = 200) {
  return Response.json(data, { status, headers: privateResponseHeaders });
}

function failure(error: string, status = 400) {
  return response({ ok: false, error }, status);
}

async function readBody(req: Request): Promise<Record<string, unknown> | null> {
  const body = await req.json().catch(() => null);
  return body && typeof body === "object" && !Array.isArray(body) ? body : null;
}

export async function POST(req: Request) {
  const body = await readBody(req);
  if (!body) return failure("El formato del reclamo no es válido.");

  const fields = Object.fromEntries(
    Object.keys(privateTextFields).map((key) => [key, text(body[key])]),
  ) as Record<keyof typeof privateTextFields, string>;

  for (const [key, limit] of Object.entries(privateTextFields)) {
    const value = fields[key as keyof typeof privateTextFields];
    if (!value || value.length > limit) {
      return failure("Completa los campos obligatorios y revisa la extensión de los textos.");
    }
  }

  fields.email = fields.email.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    return failure("El correo electrónico no es válido.");
  }
  if (!/^[\d.]+-?[\dkK]$/.test(fields.rut) ||
      !/^\+?[\d ()-]+$/.test(fields.phone) ||
      !/^\d{7,15}$/.test(fields.phone.replace(/\D/g, ""))) {
    return failure("Revisa el RUT y el teléfono.");
  }

  const incident = new Date(`${fields.incidentDate}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.incidentDate) ||
      !Number.isFinite(incident.valueOf()) ||
      incident.toISOString().slice(0, 10) !== fields.incidentDate ||
      !amountOptions.includes(fields.claimedAmount) ||
      !communicationOptions.includes(fields.priorCommunication) ||
      fields.issueDescription.length < 30) {
    return failure("Revisa la fecha, el monto y el detalle del reclamo.");
  }

  const companyId = text(body.inmobiliariaId);
  const suggestedCompany = text(body.suggestedCompany);
  if ((!companyId && !suggestedCompany) || (companyId && (!ObjectId.isValid(companyId) || suggestedCompany)) ||
      suggestedCompany.length > 120) {
    return failure("Selecciona una inmobiliaria o indica el nombre de la empresa.");
  }

  if (body.acceptTerms !== true || body.declaracionVeracidad !== true) {
    return failure("Debes aceptar el tratamiento de datos y confirmar la veracidad del reclamo.");
  }

  const submissionKey = text(body.submissionKey);
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(submissionKey)) {
    return failure("Actualiza el formulario e inténtalo de nuevo.");
  }

  // An opaque submission key lets a retry reuse the same receipt after a lost response.
  const caseId = new ObjectId(createHash("sha256").update(submissionKey).digest("hex").slice(0, 24));
  try {
    const db = await getDb();
    const cases = db.collection("casos");
    const company = companyId
      ? await db.collection("inmobiliarias").findOne(
        { ...publicCompanyFilter, _id: new ObjectId(companyId) },
        { projection: { name: 1 } },
      )
      : null;

    if (companyId && !company) return failure("La inmobiliaria seleccionada ya no está disponible.");

    const receipt = { ok: true, id: caseId.toHexString(), message: "Reclamo recibido para revisión." };
    const now = new Date();
    try {
      await cases.insertOne({
        _id: caseId,
        ...fields,
        inmobiliariaId: company?._id ?? null,
        inmobiliariaName: company?.name ?? null,
        suggestedCompany: suggestedCompany || null,
        acceptTerms: true,
        declaracionVeracidad: true,
        allowPublication: body.allowPublication === true,
        createdAt: now,
        ...(body.legalEvaluation === true && {
          legalReview: { status: "solicitada", requestedAt: now, updatedAt: now },
        }),
        status: "pendiente",
        revision: 0,
      });
      return response(receipt, 201);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        const existing = await cases.findOne({ _id: caseId, email: fields.email }, { projection: { _id: 1 } });
        if (existing) return response(receipt);
      }
      throw error;
    }
  } catch {
    return failure("No se pudo guardar el reclamo. Inténtalo de nuevo.", 500);
  }
}

export async function GET() {
  if (!await hasAdminSession()) return failure("Sesión de administrador requerida.", 401);

  try {
    const db = await getDb();
    const casos = await db.collection("casos").aggregate([
      {
        $set: {
          companyObjectId: { $convert: { input: "$inmobiliariaId", to: "objectId", onError: null, onNull: null } },
        },
      },
      { $lookup: { from: "inmobiliarias", localField: "companyObjectId", foreignField: "_id", as: "company" } },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          rut: 1,
          email: 1,
          phone: 1,
          inmobiliariaId: 1,
          inmobiliariaName: {
            $ifNull: [{ $arrayElemAt: ["$company.name", 0] }, "$inmobiliariaName", "$suggestedCompany", "Sin asignar"],
          },
          suggestedCompany: 1,
          incidentDate: 1,
          claimedAmount: 1,
          issueDescription: 1,
          expectedSolution: 1,
          priorCommunication: 1,
          claimObjective: 1,
          acceptTerms: 1,
          declaracionVeracidad: 1,
          allowPublication: 1,
          createdAt: 1,
          reviewedAt: 1,
          legalReview: 1,
          status: { $ifNull: ["$status", "pendiente"] },
          revision: { $ifNull: ["$revision", 0] },
          "publication.category": 1,
          "publication.resolution": 1,
          "publication.companyId": 1,
        },
      },
      { $sort: { createdAt: -1, _id: -1 } },
    ]).toArray();

    return response({ ok: true, casos });
  } catch {
    return failure("No se pudieron cargar los reclamos.", 500);
  }
}

export async function PATCH(req: Request) {
  if (!await hasAdminSession()) return failure("Sesión de administrador requerida.", 401);
  if (!validAdminOrigin(req)) return failure("Origen de la solicitud no autorizado.", 403);

  const body = await readBody(req);
  const id = text(body?.id);
  const action = body?.action;
  const revision = body?.revision;

  if (!ObjectId.isValid(id) || (action !== "publish" && action !== "withdraw" && action !== "legal-review") ||
      typeof revision !== "number" || !Number.isSafeInteger(revision) || revision < 0) {
    return failure("La solicitud de revisión no es válida.");
  }

  try {
    const db = await getDb();
    const cases = db.collection("casos");
    const _id = new ObjectId(id);
    const revisionFilter = revision === 0
      ? { $or: [{ revision: 0 }, { revision: { $exists: false } }] }
      : { revision };
    const filter = { _id, ...revisionFilter };
    if (action === "legal-review") {
      const status = body?.legalStatus;
      if (!isLegalReviewStatus(status)) return failure("El estado de evaluación no es válido.");
      const result = await cases.updateOne(
        { ...filter, "legalReview.status": { $exists: true } },
        { $set: { "legalReview.status": status, "legalReview.updatedAt": new Date() }, $inc: { revision: 1 } },
      );
      return result.matchedCount
        ? response({ ok: true, legalStatus: status })
        : failure("La solicitud de evaluación cambió o ya no está disponible.", 409);
    }

    const current = await cases.findOne(
      { _id },
      { projection: { allowPublication: 1, inmobiliariaId: 1, publication: 1, status: 1 } },
    );
    if (!current) return failure("El reclamo no existe.", 404);

    const reviewedAt = new Date();
    if (action === "withdraw") {
      const result = await cases.updateOne(
        { ...filter, status: "publicado" },
        { $set: { status: "retirado", reviewedAt }, $inc: { revision: 1 } },
      );
      return result.matchedCount
        ? response({ ok: true, status: "retirado" })
        : failure("El estado cambió. Recarga el panel antes de continuar.", 409);
    }

    if (current.allowPublication !== true) {
      return failure("El reclamo requiere autorización explícita para publicar una ficha anónima.", 422);
    }
    if (!body || body.confirmed !== true ||
        !isPublicationCategory(body.category) || !isPublicationResolution(body.resolution)) {
      return failure("Selecciona una categoría y la solicitud pública, y confirma la revisión.");
    }

    const originalCompanyId = current.inmobiliariaId?.toString() ?? "";
    const companyId = originalCompanyId || text(body.companyId);
    if (!ObjectId.isValid(companyId)) return failure("Asigna una inmobiliaria activa del catálogo.");
    const company = await db.collection("inmobiliarias").findOne(
      { ...publicCompanyFilter, _id: new ObjectId(companyId) },
      { projection: { name: 1 } },
    );
    if (!company) return failure("La inmobiliaria ya no está activa en el catálogo.");

    const result = await cases.updateOne(
      { ...filter, allowPublication: true },
      {
        $set: {
          status: "publicado",
          reviewedAt,
          publication: {
            id: current.publication?.id ?? randomUUID(),
            companyId: company._id,
            companyName: company.name,
            category: body.category,
            resolution: body.resolution,
            publishedAt: current.status === "publicado" && current.publication?.publishedAt
              ? current.publication.publishedAt
              : reviewedAt,
          },
        },
        $inc: { revision: 1 },
      },
    );
    return result.matchedCount
      ? response({ ok: true, status: "publicado" })
      : failure("El estado cambió. Recarga el panel antes de continuar.", 409);
  } catch {
    return failure("No se pudo guardar la decisión de publicación.", 500);
  }
}
