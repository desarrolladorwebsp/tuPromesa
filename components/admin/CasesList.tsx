"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  legalReviewLabels, publicationCategories, publicationResolutions,
  type LegalReviewStatus,
  type PublicationCategory, type PublicationResolution,
} from "@/constants/cases";

type CaseStatus = "pendiente" | "publicado" | "retirado";

type CaseRecord = {
  _id: string;
  firstName?: string | null;
  lastName?: string | null;
  rut?: string | null;
  email?: string | null;
  phone?: string | null;
  inmobiliariaId?: string | null;
  inmobiliariaName: string;
  suggestedCompany?: string | null;
  incidentDate?: string | null;
  claimedAmount?: string | null;
  issueDescription?: string | null;
  expectedSolution?: string | null;
  priorCommunication?: string | null;
  claimObjective?: string | null;
  acceptTerms?: boolean | null;
  declaracionVeracidad?: boolean | null;
  allowPublication?: boolean | null;
  createdAt?: string;
  status: CaseStatus;
  revision: number;
  legalReview?: { status: LegalReviewStatus };
  publication?: {
    category: PublicationCategory;
    resolution: PublicationResolution;
    companyId: string;
  };
};

type CompanyOption = { _id: string; name: string; status: string };
const statusLabel: Record<CaseStatus, string> = {
  pendiente: "Pendiente de revisión",
  publicado: "Publicado",
  retirado: "Retirado",
};

const fieldClass = "w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white";

export default function CasesList({ companies }: { companies: CompanyOption[] }) {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CaseStatus | "todos">("todos");
  const [onlyLegal, setOnlyLegal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/case", { cache: "no-store" });
      if (res.status === 401) {
        window.location.assign("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudieron cargar los reclamos.");
      setCases(data.casos);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los reclamos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const query = search.trim().toLocaleLowerCase("es-CL");
  const filtered = cases.filter((item) =>
    (filter === "todos" || item.status === filter) &&
    (!onlyLegal || item.legalReview) &&
    [item._id, item.firstName, item.lastName, item.email, item.rut, item.inmobiliariaName]
      .some((value) => value?.toLocaleLowerCase("es-CL").includes(query)),
  );
  const selected = cases.find((item) => item._id === selectedId);

  return (
    <section className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-surface p-5 sm:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reclamos</h2>
          <p className="mt-1 text-sm text-white/65">Revisa los antecedentes y aprueba las fichas anónimas autorizadas.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            aria-label="Buscar reclamos"
            placeholder="Buscar por folio o contacto"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={fieldClass}
          />
          <select
            aria-label="Estado del reclamo"
            value={filter}
            onChange={(event) => setFilter(event.target.value as CaseStatus | "todos")}
            className={fieldClass}
          >
            <option value="todos">Todos los estados</option>
            {Object.entries(statusLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
      </header>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={onlyLegal} onChange={(event) => setOnlyLegal(event.target.checked)} />
        Solo solicitudes de evaluación jurídica
      </label>

      {isLoading && <p role="status">Cargando reclamos…</p>}
      {error && <p role="alert" className="text-red-300">{error}</p>}
      {!isLoading && !error && !filtered.length && <p className="text-sm text-white/65">No hay reclamos para mostrar.</p>}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <article key={item._id} className="space-y-2 rounded-xl border border-white/10 bg-black/25 p-4">
            <p className="text-sm font-bold">{item.inmobiliariaName}</p>
            <p className="text-sm text-white/70">{[item.firstName, item.lastName].filter(Boolean).join(" ") || "Sin nombre"}</p>
            <p className="text-xs text-white/55">Folio {item._id}</p>
            <p className="text-xs text-white/75">{statusLabel[item.status]}</p>
            {item.legalReview && <p className="text-xs text-amber-200">Evaluación jurídica · {legalReviewLabels[item.legalReview.status]}</p>}
            <button
              type="button"
              onClick={() => setSelectedId(item._id)}
              className="rounded-md border border-white/20 px-3 py-1.5 text-sm font-semibold hover:bg-white/10"
            >
              Ver detalle
            </button>
          </article>
        ))}
      </div>

      {selected && (
        <CaseReview
          key={selected._id}
          item={selected}
          companies={companies.filter((company) => company.status === "Activa")}
          onRefresh={load}
          onClose={() => setSelectedId(null)}
        />
      )}
    </section>
  );
}

function CaseReview({
  item, companies, onRefresh, onClose,
}: {
  item: CaseRecord;
  companies: CompanyOption[];
  onRefresh: () => Promise<void>;
  onClose: () => void;
}) {
  const [category, setCategory] = useState<PublicationCategory | "">(item.publication?.category ?? "");
  const [resolution, setResolution] = useState<PublicationResolution>(item.publication?.resolution ?? "ninguna");
  const [selectedCompanyId, setSelectedCompanyId] = useState(item.publication?.companyId ?? "");
  const [confirmed, setConfirmed] = useState(false);
  const [legalStatus, setLegalStatus] = useState(item.legalReview?.status);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string; legal: boolean } | null>(null);

  const companyId = item.inmobiliariaId || selectedCompanyId;
  const company = companies.find((option) => option._id === companyId);
  const preview = category ? publicationCategories[category] : null;
  const fields = [
    ["Nombre", [item.firstName, item.lastName].filter(Boolean).join(" ")],
    ["RUT", item.rut], ["Correo", item.email], ["Teléfono", item.phone],
    ["Inmobiliaria reportada", item.inmobiliariaName], ["Sugerencia de empresa", item.suggestedCompany],
    ["Fecha de los hechos", item.incidentDate], ["Monto reclamado", item.claimedAmount],
    ["Relato original", item.issueDescription], ["Solución esperada", item.expectedSolution],
    ["Comunicación previa", item.priorCommunication], ["Objetivo", item.claimObjective],
    ["Tratamiento de datos", item.acceptTerms ? "Autorizado" : "Sin constancia"],
    ["Declaración de veracidad", item.declaracionVeracidad ? "Registrada" : "Sin constancia"],
    ["Publicación anónima", item.allowPublication ? "Autorizada" : "Sin autorización"],
  ];

  async function update(action: "publish" | "withdraw" | "legal-review") {
    if (saving) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/case", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item._id, revision: item.revision, action, category, resolution, companyId, confirmed, legalStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) await onRefresh();
        throw new Error(data.error || "No se pudo guardar la decisión.");
      }
      await onRefresh();
      setConfirmed(false);
      setFeedback({ ok: true, legal: action === "legal-review", message: action === "publish" ? "Ficha aprobada y publicada." : action === "withdraw" ? "Ficha retirada de la web." : "Estado de evaluación guardado." });
    } catch (error) {
      setFeedback({ ok: false, legal: action === "legal-review", message: error instanceof Error ? error.message : "No se pudo guardar la decisión." });
    } finally {
      setSaving(false);
    }
  }

  function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (confirmed && preview && company) void update("publish");
  }

  return (
    <section aria-label="Detalle del reclamo" className="grid gap-5 rounded-xl border border-white/15 bg-black/30 p-4 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Detalle privado</h3>
            <p className="text-xs text-white/65">Folio {item._id} · {statusLabel[item.status]}</p>
          </div>
          <button type="button" onClick={onClose} className="text-sm font-semibold underline">Cerrar detalle</button>
        </div>
        {item.legalReview && (
          <form className="space-y-3 rounded-lg border border-white/15 p-3" onSubmit={(event) => {
            event.preventDefault();
            void update("legal-review");
          }}>
            <label className="block space-y-1 text-sm font-medium">
              Estado de evaluación jurídica
              <select className={fieldClass} value={legalStatus} onChange={(event) => setLegalStatus(event.target.value as LegalReviewStatus)}>
                {Object.entries(legalReviewLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
            <button type="submit" disabled={saving || legalStatus === item.legalReview.status} className="rounded-md border border-white/20 px-3 py-2 text-sm font-semibold disabled:opacity-50">
              Guardar estado
            </button>
            {feedback?.legal && <p role={feedback.ok ? "status" : "alert"} className={feedback.ok ? "text-sm text-green-300" : "text-sm text-red-300"}>{feedback.message}</p>}
          </form>
        )}
        <dl className="space-y-3 break-words">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-bold text-white/65">{label}</dt>
              <dd className="whitespace-pre-wrap text-sm">{value || "—"}</dd>
            </div>
          ))}
        </dl>
      </div>

      <form onSubmit={publish} className="space-y-4 rounded-lg border border-white/10 bg-surface p-4">
        <h3 className="text-lg font-bold">Ficha pública anónima</h3>
        <p className="text-sm text-white/65">La ficha muestra la inmobiliaria, la categoría y la solicitud que selecciones.</p>
        {item.allowPublication ? (
          <>
            <label className="block space-y-1 text-sm font-medium">
              Inmobiliaria de la ficha
              {item.inmobiliariaId ? (
                <span className="block">{company?.name ?? "Inmobiliaria fuera del catálogo activo"}</span>
              ) : (
                <select className={fieldClass} value={selectedCompanyId} onChange={(event) => {
                  setSelectedCompanyId(event.target.value);
                  setConfirmed(false);
                }} required>
                  <option value="">Selecciona una inmobiliaria activa</option>
                  {companies.map((option) => <option key={option._id} value={option._id}>{option.name}</option>)}
                </select>
              )}
            </label>

            <label className="block space-y-1 text-sm font-medium">
              Categoría pública
              <select className={fieldClass} value={category} onChange={(event) => {
                setCategory(event.target.value as PublicationCategory | "");
                setConfirmed(false);
              }} required>
                <option value="">Selecciona una categoría</option>
                {Object.entries(publicationCategories).map(([key, value]) => <option key={key} value={key}>{value.title}</option>)}
              </select>
            </label>

            <label className="block space-y-1 text-sm font-medium">
              Solicitud pública
              <select className={fieldClass} value={resolution} onChange={(event) => {
                setResolution(event.target.value as PublicationResolution);
                setConfirmed(false);
              }}>
                {Object.entries(publicationResolutions).map(([key, value]) => <option key={key} value={key}>{value || "Omitir solicitud"}</option>)}
              </select>
            </label>

            {preview && company && (
              <div className="space-y-1 rounded-lg border border-white/15 bg-black/30 p-3">
                <p className="text-xs font-semibold text-white/65">Vista previa pública</p>
                <p className="font-bold">{company.name}</p>
                <p className="text-sm font-semibold">{preview.title}</p>
                <p className="text-sm">{preview.summary} {publicationResolutions[resolution]}</p>
              </div>
            )}

            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1" />
              Revisé la ficha y confirmo que representa el reclamo.
            </label>

            <button
              type="submit"
              disabled={saving || !confirmed || !preview || !company}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {item.status === "publicado" ? "Actualizar ficha pública" : "Aprobar y publicar"}
            </button>
          </>
        ) : (
          <p className="text-sm text-white/75">Este reclamo puede revisarse en privado. Para publicarlo hace falta la autorización del denunciante.</p>
        )}

        {item.status === "publicado" && (
          <button
            type="button"
            disabled={saving}
            onClick={() => void update("withdraw")}
            className="block rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Retirar publicación
          </button>
        )}

        {feedback && !feedback.legal && <p role={feedback.ok ? "status" : "alert"} className={feedback.ok ? "text-sm text-green-300" : "text-sm text-red-300"}>{feedback.message}</p>}
      </form>
    </section>
  );
}
