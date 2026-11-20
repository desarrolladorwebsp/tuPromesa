import { hasAdminSession, privateResponseHeaders } from "@/lib/auth/admin";
import { getDb } from "@/lib/db/mongodb";
import { votingReasons } from "@/constants/voting";

export async function GET() {
  if (!await hasAdminSession()) {
    return Response.json({ error: "Sesión de administrador requerida." }, {
      status: 401, headers: privateResponseHeaders,
    });
  }

  try {
    const db = await getDb();
    const summaries = await db.collection("votos_inmobiliarias").aggregate([
      {
        $project: {
          companyId: { $convert: { input: "$inmobiliariaId", to: "objectId", onError: null, onNull: null } },
          date: "$createdAt",
          verified: { $eq: [{ $type: "$verifiedAt" }, "date"] },
          reasons: { $cond: [{ $isArray: "$reasons" }, "$reasons", []] },
        },
      },
      { $match: { companyId: { $ne: null } } },
      {
        $group: {
          _id: "$companyId",
          total: { $sum: 1 },
          verified: { $sum: { $cond: ["$verified", 1, 0] } },
          lastVote: { $max: "$date" },
          ...Object.fromEntries(votingReasons.map((reason, index) => [
            `reason${index}`, { $sum: { $cond: [{ $in: [reason, "$reasons"] }, 1, 0] } },
          ])),
        },
      },
      { $lookup: { from: "inmobiliarias", localField: "_id", foreignField: "_id", as: "company" } },
      { $set: { companyName: { $ifNull: [{ $arrayElemAt: ["$company.name", 0] }, "Inmobiliaria retirada"] } } },
      { $sort: { total: -1, companyName: 1 } },
    ]).toArray();

    return Response.json({
      summaries: summaries.map(({ _id, companyName, total, verified, lastVote, ...counts }) => ({
        id: String(_id), companyName, total, verified, lastVote,
        reasons: votingReasons.map((label, index) => ({ label, count: counts[`reason${index}`] })),
      })),
    }, { headers: privateResponseHeaders });
  } catch {
    return Response.json({ error: "No se pudieron cargar los resultados." }, {
      status: 500, headers: privateResponseHeaders,
    });
  }
}
