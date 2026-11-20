"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import VoteButton from "@/components/VoteButton";
import FeaturedCase from "@/components/FeaturedCase";
import type { PublicCase } from "@/constants/cases";

interface Inmobiliaria {
  _id: string;
  name: string;
  logoUrl: string;
}
const cases = [
  {
    inmobiliariaName: "Inmobiliaria SSILVA",
    date: "25 Jun 2025",
    dateTime: "2025-06-25",
    userName: "P. I.",
    comment: "se comprometieron a realizar la devolución del dinero a 30 días corridos, plazo el cual finalizó el día 25 de mayo.",
    context: "La persona señala que firmó un acuerdo escrito para dejar sin efecto la promesa de compraventa del departamento en Mira al Mar.",
    sourceUrl: "https://www.reclamos.cl/inmobiliaria-ssilva/reclamo/2025/jun/inmobiliaria-ssilva-devoluci-n-pie",
  },
  {
    inmobiliariaName: "Inmobiliaria SSILVA",
    date: "06 May 2025",
    dateTime: "2025-05-06",
    userName: "P. P.",
    comment: "por supuesto decidí que no dada la Mala experiencia y quedaron de devolverme mis cheques y reserva, hasta ahora han pasado dos meses",
    context: "La compradora cuenta que desistió tras un atraso del proyecto y pidió recuperar los trescientos mil pesos de la reserva.",
    sourceUrl: "https://www.reclamos.cl/inmobiliaria-ssilva/reclamo/2025/may/inmobiliaria-ssilva-no-existe-comunciaci-n-ni-devoluci-n-de-reserva",
  },
  {
    inmobiliariaName: "Inmobiliaria SSILVA",
    date: "09 Oct 2024",
    dateTime: "2024-10-09",
    userName: "C. I.",
    comment: "ya que el mal servicio, parte desde que jamás te informan cómo va el proceso de la recepción fnal, ni de compraventa.",
    context: "La persona señala que compró en 2022 y cuestiona cómo la inmobiliaria comunicó el avance de los trámites durante la compra.",
    sourceUrl: "https://www.reclamos.cl/inmobiliaria-ssilva/reclamo/2024/oct/inmobiliaria-ssilva-pesimo-servicio",
  },
  {
    inmobiliariaName: "Inmobiliaria SSILVA",
    date: "22 Ago 2024",
    dateTime: "2024-08-22",
    userName: "P. R.",
    comment: "termina ofreciéndonos en el papel el departamento 1507, supuestamente de 1b1d, cuando en realidad se trataba de un departamento estudio",
    context: "La persona relata que buscaba comprar dos departamentos y que descubrió la diferencia en la distribución de uno cuando se acercaba la entrega.",
    sourceUrl: "https://www.reclamos.cl/inmobiliaria-ssilva/reclamo/2024/aug/inmobiliaria-ssilva-p-sima-gesti-n",
  },
  {
    inmobiliariaName: "Inmobiliaria SSILVA",
    date: "22 Jul 2024",
    dateTime: "2024-07-22",
    userName: "J. O.",
    comment: "Pague el $1.000.000, envié mis antecedentes en Marzo y nunca más me contactaron.",
    context: "La persona señala que el pago correspondía a la reserva de un sitio en Panguipulli. La empresa también ofrecía evaluar sus antecedentes para un crédito hipotecario durante el proceso comercial.",
    sourceUrl: "https://www.reclamos.cl/inmobiliaria-ssilva/reclamo/2024/jul/inmobiliaria-ssilva-sin-devolucion-de-reserva",
  },
  {
    inmobiliariaName: "Inmobiliaria SSILVA e Inmobiliaria Los Sargazos",
    date: "27 Nov 2023",
    dateTime: "2023-11-27",
    userName: "A. M.",
    comment: "y han pasado dos años y aún no tenemos una fecha concreta de cuando se realizará la entrega.",
    context: "La persona indica que la entrega del departamento ubicado en Reñaca estaba prevista para diciembre de 2021 y pide recuperar el pie y la reserva.",
    sourceUrl: "https://www.reclamos.cl/reclamo/2023/nov/inmobiliaria-ssilva-inmobiliaria-los-sargazos-spa-sin-respuesta-sobre-fecha-entrega-departa",
  },
  {
    inmobiliariaName: "Inmobiliaria SSILVA",
    date: "23 Jul 2023",
    dateTime: "2023-07-23",
    userName: "A. B.",
    comment: "Me entregaron un departamento de viña del mar canal beagle, donde pasando sólo dos semanas ya tiene imperfecciones, post venta no se hace cargo.",
    context: "La publicación se refiere a un departamento en Canal Beagle. La persona menciona fallas en ascensores y agua caliente.",
    sourceUrl: "https://www.reclamos.cl/inmobiliaria-ssilva/reclamo/2023/jul/inmobiliaria-ssilva-departamento-en-mal-estado-entregado-solo-hace-un-m",
  },
  {
    inmobiliariaName: "Inmobiliaria SSILVA e Inmobiliaria Los Sargazos",
    date: "03 Mar 2023",
    dateTime: "2023-03-03",
    userName: "T. F.",
    comment: "NECESITO DEVOLUCION TOTAL DEL PIE MAS LA RESERVA Y TODO LO INVERTIDO EN EL PROYECTO ya que no aceptare otra fecha estimada de entrega",
    context: "La persona relata que la entrega de su departamento en Reñaca se postergó varias veces desde la fecha prevista.",
    sourceUrl: "https://www.reclamos.cl/reclamo/2023/mar/inmobiliaria-ssilva-inmobiliaria-los-sargazos-spa-sin-respuesta-la-solicitud",
  },
];

export default function ReportedCasesSection() {
  const [pollOptions, setPollOptions] = useState<Inmobiliaria[]>([]);
  const [publishedCases, setPublishedCases] = useState<PublicCase[]>([]);
  const companies = pollOptions.map((item) => item.logoUrl).filter(Boolean);
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/inmobiliarias", {
          cache: "no-store",
        });
        const data = await res.json();

        if (res.ok && Array.isArray(data)) setPollOptions(data);
      } catch (error) {
        console.error("Error cargando inmobiliarias", error);
      }
    }

    async function loadPublished() {
      try {
        const res = await fetch("/api/case/publicados", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.cases)) setPublishedCases(data.cases);
      } catch {
        // Los reclamos con fuentes externas siguen disponibles.
      }
    }

    void load();
    void loadPublished();
  }, []);
  return (
    <section id="casos" className="relative scroll-mt-24 overflow-hidden bg-elevated py-14 md:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.04),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.02),transparent_35%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-5 sm:px-6 lg:grid-cols-[1.6fr_1fr] lg:gap-10">
        {/* LEFT COLUMN */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Companies */}
          <div className="rounded-[var(--radius-lg)] border border-white/8 bg-[var(--color-bg-surface)] p-5 shadow-[var(--shadow-medium)] md:p-7">
            <h2 id="relatos" className="scroll-mt-24 text-center text-lg font-extrabold text-red sm:text-xl md:text-2xl">
              Reclamos publicados por usuarios
            </h2>
            <div className="mt-2 grid grid-cols-1 gap-4">
              {publishedCases.map((item) => (
                <article key={item.id} className="rounded-md border border-default bg-light p-4 text-dark">
                  <h3 className="font-semibold text-red">{item.companyName}</h3>
                  <p className="mt-1 text-xs text-dark/75">
                    Ficha anónima · <time dateTime={item.month}>{item.month}</time>
                  </p>
                  <h4 className="mt-2 text-sm font-bold">{item.title}</h4>
                  <p className="mt-1 text-sm leading-relaxed">
                    {item.summary} {item.requestedResolution}
                  </p>
                </article>
              ))}
              {cases.map((caseItem) => (
                <FeaturedCase
                  key={caseItem.sourceUrl}
                  inmobiliariaLogo="/inmobiliarias/inmobiliaria-ssilva.png"
                  {...caseItem}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN */}
        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.4, delay: 0.06 }}
          className="space-y-8"
        >
          {/* Poll */}
          <div className="rounded-[var(--radius-lg)] border border-white/8 bg-[var(--color-bg-surface)] p-5 shadow-[var(--shadow-medium)] md:p-6">
            <h3 className="text-lg font-extrabold leading-tight text-[var(--color-text-primary)] sm:text-xl">
              ¿Qué inmobiliaria{" "}
              <span className="text-[var(--color-primary)]">NO</span>{" "}
              recomendarías?
            </h3>

            <div className="mt-5 space-y-2.5">
              {pollOptions.map((item) => (
                <div
                  key={item._id}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.03] px-4 py-3 text-left transition-all hover:border-white/15 hover:bg-white/[0.06] cursor-pointer"
                >
                  <span className="flex items-center gap-2.5 text-sm font-medium text-[var(--color-text-primary)]">
                    {item.logoUrl && (
                      <Image
                        src={item.logoUrl}
                        alt=""
                        width={96}
                        height={96}
                        className="shrink-0 rounded-sm"
                      />
                    )}
                    {item.name}
                  </span>

                  <span className="">
                    <VoteButton
                      inmobiliariaId={item._id}
                      inmobiliariaName={item.name}
                      inmobiliariaLogo={item.logoUrl}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stories */}
          <div className="rounded-[var(--radius-lg)] border border-white/8 bg-[var(--color-bg-surface)] p-5 shadow-[var(--shadow-medium)] md:p-6">
            <img
              src="/images/reported-cases-main.jpg"
              alt="Personas revisando antecedentes de un caso inmobiliario"
              className="h-[200px] w-full object-cover sm:h-[280px] lg:h-[320px]"
            />

            <h3 className="text-xl font-extrabold leading-tight text-[var(--color-text-primary)] md:text-2xl">
              Respaldo legal y acción colectiva
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Este espacio recopila antecedentes que estudios jurídicos pueden
              evaluar para posibles acciones legales colectivas.
            </p>
          </div>
        </motion.aside>
      </div>
      {/**Logos Inmobiliarias */}

      <div className="relative overflow-hidden w-full mt-12">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-red via-red/80 to-transparent z-10"></div>
        <div className="pointer-events-none absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-red via-red/80 to-transparent z-10"></div>

        <div className="flex w-max animate-[scroll_50s_linear_infinite]">
          {[...companies, ...companies, ...companies, ...companies].map(
            (company, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.08, y: -2 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mx-8 flex items-center justify-center"
              >
                <img
                  src={company}
                  alt="Logo"
                  className="
                h-14 w-auto object-contain
                opacity-60 grayscale
                hover:grayscale-0 hover:opacity-100
                transition duration-300
              "
                />
              </motion.div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
