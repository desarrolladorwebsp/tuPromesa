"use client";

import { useEffect, useState } from "react";
import FormNewInmobiliaria from "@/components/admin/FormNewInmobiliaria";
import InmobiliariasList from "@/components/admin/InmobiliariasList";
import CasesList from "@/components/admin/CasesList";
import VoteSummary from "@/components/admin/VoteSummary";

type CompanyFields = {
  name: string;
  observation: string;
  logoUrl: string;
  website: string;
  status: "Activa" | "Oculta";
};
type Company = CompanyFields & { _id: string; slug: string; createdAt: string };

export default function AdminPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editing, setEditing] = useState<Company | undefined>();
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/inmobiliarias?admin=1", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("No se pudo cargar el catálogo.");
        setCompanies(await res.json());
      })
      .catch(() => setError("No se pudo cargar el catálogo."));
  }, []);

  async function saveCompany(data: CompanyFields) {
    try {
      const res = await fetch("/api/inmobiliarias", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { ...data, id: editing._id } : data),
      });
      const result = await res.json();
      if (!res.ok || !result.ok) throw new Error(result.error || "No se pudo guardar la inmobiliaria.");

      const company = { ...data, _id: editing?._id ?? result.id, slug: editing?.slug ?? "", createdAt: editing?.createdAt ?? new Date().toISOString() };
      setCompanies((prev) => editing ? prev.map((entry) => entry._id === editing._id ? company : entry) : [company, ...prev]);
      setEditing(undefined);
      setError("");
      return { success: true };
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo guardar la inmobiliaria.");
      return { success: false };
    }
  }

  async function deleteCompany(id: string) {
    try {
      const res = await fetch("/api/inmobiliarias", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      setCompanies((prev) => prev.filter((c) => c._id !== id));
      if (editing?._id === id) setEditing(undefined);
      setError("");
    } catch {
      setError("No se pudo eliminar la inmobiliaria.");
    }
  }

  async function logout() {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (!res.ok) throw new Error();
      window.location.assign("/login");
    } catch {
      setError("No se pudo cerrar la sesión. Inténtalo de nuevo.");
    }
  }

  return (
    <main className="min-h-screen bg-elevated text-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold">Panel de administración</h1>
            <p className="mt-2 text-sm text-gray-400">Reclamos, publicaciones e inmobiliarias</p>
          </div>
          <button type="button" onClick={logout} className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold">
            Cerrar sesión
          </button>
        </header>

        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <CasesList companies={companies} />
        <VoteSummary />

        <section className="mt-8 grid gap-6 xl:grid-cols-[420px_1fr]">
          <div>
            {editing && <button type="button" onClick={() => setEditing(undefined)} className="mb-2 text-sm underline">Cancelar edición</button>}
            <FormNewInmobiliaria onSubmit={saveCompany} initialData={editing} />
          </div>
          <InmobiliariasList
            companies={companies}
            onEdit={(company) => setEditing(company)}
            onDelete={deleteCompany}
          />
        </section>
      </div>
    </main>
  );
}
