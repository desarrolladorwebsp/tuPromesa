"use client";

import { useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { votingReasons } from "@/constants/voting";
import Image from "next/image";

const fieldClass =
  "w-full rounded-xl border border-default bg-white px-4 py-3 text-sm text-dark outline-none focus:ring-2 focus:ring-primary/20";

export default function VoteButton({ inmobiliariaId, inmobiliariaName, inmobiliariaLogo }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const inFlight = useRef(false);
  const titleId = useId();

  function close() {
    if (!inFlight.current) setOpen(false);
  }

  async function submit(event) {
    event.preventDefault();
    if (inFlight.current || feedback?.ok) return;

    const fields = new FormData(event.currentTarget);
    const vote = {
      inmobiliariaId,
      name: fields.get("name"),
      email: fields.get("email"),
      reasons: fields.getAll("reasons"),
      otherReason: fields.get("otherReason"),
      acceptPrivacy: fields.has("acceptPrivacy"),
    };

    inFlight.current = true;
    setSubmitting(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/votaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vote),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        setFeedback({
          ok: false,
          message: data?.error || "No se pudo registrar el voto. Inténtalo de nuevo.",
        });
        return;
      }

      setFeedback({ ok: true, message: data.message });
    } catch {
      setFeedback({ ok: false, message: "Error de conexión. Inténtalo de nuevo." });
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setFeedback(null);
          setOpen(true);
        }}
        className="relative z-30 inline-flex items-center gap-1.5 rounded-sm border border-red/30 bg-red/10 px-3 py-1.5 text-xs font-bold text-red transition hover:bg-primary hover:text-white cursor-pointer"
      >
        Votar
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={(event) => {
              if (event.currentTarget === event.target) close();
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              onKeyDown={(event) => {
                if (event.key === "Escape") close();
              }}
              className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-[24px] border border-default bg-light text-dark shadow-xl"
            >
              <header className="flex items-center gap-4 border-b border-default bg-white/50 px-6 py-4">
                {inmobiliariaLogo && (
                  <Image
                    src={inmobiliariaLogo}
                    alt=""
                    width={100}
                    height={50}
                    className="h-auto w-24 rounded-sm object-contain"
                  />
                )}
                <div>
                  <h3 className="text-base font-semibold text-red">{inmobiliariaName}</h3>
                  <h4 id={titleId} className="text-lg font-semibold">Registrar voto</h4>
                </div>
              </header>

              <form onSubmit={submit} className="space-y-4 p-6" aria-busy={submitting}>
                <fieldset disabled={submitting || feedback?.ok} className="space-y-4">
                  <label className="block text-sm font-medium">
                    Nombre
                    <input name="name" type="text" autoComplete="name" required maxLength={120} className={fieldClass} />
                  </label>

                  <label className="block text-sm font-medium">
                    Correo electrónico
                    <input name="email" type="email" autoComplete="email" required maxLength={254} className={fieldClass} />
                  </label>

                  <fieldset className="space-y-2">
                    <legend className="text-sm font-medium">¿Por qué votas por esta inmobiliaria?</legend>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {votingReasons.map((reason) => (
                        <label key={reason} className="flex items-center gap-2 rounded-lg border border-default bg-white/60 px-3 py-2 text-sm">
                          <input type="checkbox" name="reasons" value={reason} className="accent-primary" />
                          {reason}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <label className="block text-sm font-medium">
                    Otros motivos
                    <textarea name="otherReason" rows={3} maxLength={1000} className={fieldClass} />
                  </label>

                  <label className="flex items-start gap-2 text-xs">
                    <input type="checkbox" name="acceptPrivacy" required className="mt-1 accent-primary" />
                    <span>
                      Acepto que mi información sea tratada conforme a la
                      legislación chilena (Ley N° 21.719) y autorizo el
                      contacto según la{" "}
                      <a href="/politica-privacidad" target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline">
                        política de privacidad
                      </a>
                      .
                    </span>
                  </label>
                </fieldset>

                {feedback && (
                  <p role={feedback.ok ? "status" : "alert"} className={feedback.ok ? "text-sm font-semibold text-green-900" : "text-sm font-semibold text-red-900"}>
                    {feedback.message}
                  </p>
                )}

                <div className="flex justify-center gap-3 pt-2">
                  <button type="button" onClick={close} disabled={submitting} className="rounded-lg border border-default px-4 py-2 text-sm font-medium transition hover:bg-white/60 disabled:opacity-50">
                    {feedback?.ok ? "Cerrar" : "Cancelar"}
                  </button>

                  {!feedback?.ok && (
                    <button type="submit" disabled={submitting} className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50">
                      {submitting ? "Enviando…" : "Enviar voto"}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
