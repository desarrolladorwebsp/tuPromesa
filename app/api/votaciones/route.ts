import { MongoServerError, ObjectId } from "mongodb";
import { votingReasons } from "@/constants/voting";
import { getDb } from "@/lib/db/mongodb";

type VoteBody = {
  inmobiliariaId?: unknown;
  name?: unknown;
  email?: unknown;
  reasons?: unknown;
  otherReason?: unknown;
  acceptPrivacy?: unknown;
};

function voteError(error: string, status = 400) {
  return Response.json({ ok: false, error }, { status });
}

function trimField(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: Request) {
  const body: VoteBody | null = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return voteError("El formato del voto no es válido.");
  }

  const id = trimField(body.inmobiliariaId);
  const name = trimField(body.name);
  const email = trimField(body.email).toLowerCase();
  const reasons = body.reasons ?? [];
  const otherReason = trimField(body.otherReason);

  if (!ObjectId.isValid(id)) {
    return voteError("El id de la inmobiliaria no es válido.");
  }

  if (!name || name.length > 120) {
    return voteError("Ingresa un nombre válido de hasta 120 caracteres.");
  }

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return voteError("El correo electrónico no es válido.");
  }

  if (!Array.isArray(reasons) || reasons.length > votingReasons.length ||
      reasons.some((reason) => typeof reason !== "string" || !votingReasons.includes(reason))) {
    return voteError("Selecciona motivos válidos.");
  }

  if (otherReason.length > 1000) {
    return voteError("Otros motivos admite hasta 1000 caracteres.");
  }

  if (body.acceptPrivacy !== true) {
    return voteError("Debes aceptar el tratamiento de tus datos para votar.");
  }

  try {
    const db = await getDb();
    const companyId = new ObjectId(id);
    const company = await db.collection("inmobiliarias").findOne(
      { _id: companyId },
      { projection: { _id: 1 } },
    );

    if (!company) {
      return voteError("La inmobiliaria no existe.", 404);
    }

    const result = await db.collection("votos_inmobiliarias").insertOne({
      inmobiliariaId: companyId.toHexString(),
      name,
      email,
      reasons: [...new Set(reasons)],
      otherReason,
      acceptPrivacy: true,
      createdAt: new Date(),
    });

    return Response.json(
      { ok: true, message: "Voto registrado correctamente.", id: result.insertedId.toString() },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return voteError("Este correo ya registró un voto para esta inmobiliaria.", 409);
    }

    console.error("Error registrando voto", error instanceof Error ? error.name : "Error");
    return voteError("No se pudo registrar el voto. Inténtalo de nuevo.", 500);
  }
}
