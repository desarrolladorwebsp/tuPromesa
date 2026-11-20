"use client";

import { useEffect, useState } from "react";

type Summary = {
  id: string;
  companyName: string;
  total: number;
  verified: number;
  lastVote?: string;
  reasons: { label: string; count: number }[];
};

const voteDate = new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeZone: "America/Santiago" });

export default function VoteSummary() {
  const [summaries, setSummaries] = useState<Summary[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/votaciones/resumen", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("No se pudieron cargar los resultados de votación.");
        setSummaries((await response.json()).summaries);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError("No se pudieron cargar los resultados de votación.");
      });

    return () => controller.abort();
  }, []);

  return (
    <section aria-labelledby="vote-summary-title" className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-surface p-5 sm:p-6">
      <h2 id="vote-summary-title" className="text-2xl font-bold">Votación por inmobiliaria</h2>
      {error && <p role="alert" className="text-red-300">{error}</p>}
      {!error && !summaries && <p role="status">Cargando votaciones…</p>}
      {summaries?.length === 0 && <p className="text-sm text-white-secondary">Todavía no hay votos registrados.</p>}
      {summaries?.map((summary) => (
        <details key={summary.id} className="rounded-lg border border-white/15 px-4 py-3">
          <summary className="cursor-pointer font-semibold">
            {summary.companyName} · {summary.total} {summary.total === 1 ? "voto" : "votos"} ({summary.verified} con correo verificado)
          </summary>
          <div className="mt-3 space-y-2 text-sm text-white-secondary">
            {summary.lastVote && <p>Último voto · {voteDate.format(new Date(summary.lastVote))}</p>}
            <ul className="space-y-1" aria-label="Motivos seleccionados">
              {summary.reasons.map(({ label, count }) => <li key={label}>{label} · {count}</li>)}
            </ul>
          </div>
        </details>
      ))}
    </section>
  );
}
