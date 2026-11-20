"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function LegalSupportSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-bg-base)] py-14 md:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(215,38,46,0.08),transparent_28%)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45 }}
          className="space-y-6"
        >
          <div className="inline-flex rounded-full border border-gold bg-gold/10 px-4 py-1.5 text-sm font-semibold text-gold">
            Respaldo jurídico
          </div>

          <div>
            <h2 className="max-w-3xl text-3xl font-extrabold leading-tight text-[var(--color-text-primary)] sm:text-4xl md:text-5xl">
              Solicita una evaluación jurídica de tu caso
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white-secondary sm:text-lg">
              El equipo de TuPromesa revisará los antecedentes de tu solicitud. Si procede una derivación a un estudio jurídico, la coordinará contigo.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
            <Link href="/evaluacion-juridica" className="inline-flex justify-center rounded-md bg-red px-6 py-3 font-bold text-white hover:bg-red-hover">Solicitar evaluación de mi caso</Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="relative"
        >
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-white/10 bg-[var(--color-bg-surface)] shadow-[var(--shadow-strong)]">
            <div className="relative aspect-[4/5] w-full bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.18))]">
              <Image
                src="/images/reported-cases-secondary.jpg"
                alt="Personas revisando documentos de una propiedad"
                fill
                sizes="(min-width: 1280px) 550px, (min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>

            <div className="border-t border-white/10 p-5 md:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-2xl font-extrabold text-[var(--color-text-primary)]">
                    Estudios jurídicos
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    Revisión de antecedentes y eventual derivación, según el caso.
                  </p>
                </div>

                <div className="rounded-[var(--radius-md)] border border-white/10 bg-black/20 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                    Enfoque
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
                    Evaluación inicial de antecedentes
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-6 -right-4 hidden h-28 w-28 rounded-full bg-[var(--color-primary)]/20 blur-3xl md:block" />
        </motion.div>
      </div>
    </section>
  );
}
