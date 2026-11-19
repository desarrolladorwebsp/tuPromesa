import {
  isPublicationCategory, isPublicationResolution, publicationCategories,
  publicationResolutions, type PublicCase,
} from "@/constants/cases";
import { getDb } from "@/lib/db/mongodb";

const headers = { "Cache-Control": "no-store" };
type PublicationProjection = {
  publication?: {
    id?: unknown;
    companyName?: unknown;
    category?: unknown;
    resolution?: unknown;
    publishedAt?: unknown;
  };
};

export async function GET() {
  try {
    const db = await getDb();
    const rows = await db.collection<PublicationProjection>("casos")
      .find(
        { status: "publicado", allowPublication: true },
        { projection: { _id: 0, publication: 1 } },
      )
      .sort({ "publication.publishedAt": -1 })
      .toArray();

    const cases = rows.flatMap<PublicCase>(({ publication }) => {
      if (!publication || !isPublicationCategory(publication.category) ||
          !isPublicationResolution(publication.resolution) ||
          typeof publication.id !== "string" || typeof publication.companyName !== "string" ||
          !(publication.publishedAt instanceof Date)) return [];

      const category = publicationCategories[publication.category];
      return [{
        id: publication.id,
        companyName: publication.companyName,
        title: category.title,
        summary: category.summary,
        requestedResolution: publicationResolutions[publication.resolution],
        month: publication.publishedAt.toISOString().slice(0, 7),
      }];
    });
    return Response.json({ cases }, { headers });
  } catch {
    return Response.json({ error: "No se pudieron cargar los reclamos publicados." }, { status: 500, headers });
  }
}
