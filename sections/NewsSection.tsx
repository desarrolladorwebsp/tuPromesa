"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const newsItems = [
  {
    title: "Fallo por retrasos en la entrega de viviendas en Valdivia",
    image: "/images/news-01.webp",
    date: "2026-01-29",
    dateLabel: "29/01/2026",
    excerpt: "Conadecus publicó el fallo de la Corte de Apelaciones sobre los retrasos que afectaron a 268 familias del proyecto Villa Galilea II.",
    source: "Conadecus",
    href: "https://www.conadecus.cl/logro-para-consumidores-demanda-colectiva-contra-inmobiliaria-galilea-consigue-fallo-lapidario-e-indemnizacion-para-vecinos-que-no-recibieron-sus-casas-a-tiempo/",
  },
  {
    title: "SERNAC explica cuándo una fecha de entrega compromete a la inmobiliaria",
    image: "/images/news-02.jpeg",
    date: "2025-04-30",
    dateLabel: "30/04/2025",
    excerpt: "El servicio publicó un dictamen sobre los plazos que las inmobiliarias informan antes de firmar una promesa de compraventa.",
    source: "SERNAC",
    href: "https://www.sernac.cl/portal/604/w3-article-84782.html",
  },
  {
    title: "SERNAC abre un procedimiento colectivo con Inmobiliaria Armas",
    image: "/images/news-03.jpg",
    date: "2026-06-02",
    dateLabel: "02/06/2026",
    excerpt: "El procedimiento aborda posibles retrasos en devoluciones de dinero y falta de información en procesos de reserva y compraventa.",
    source: "SERNAC",
    href: "https://www.sernac.cl/portal/604/w3-article-88807.html",
  },
  {
    title: "Promesa de compraventa: qué revisar si desistes de comprar",
    image: "/images/news-04.jpg",
    date: "2024-10-17",
    dateLabel: "17/10/2024",
    excerpt: "SERNAC explica qué revisar en una reserva o promesa de compraventa frente a un desistimiento y describe cuándo presentar un reclamo.",
    source: "SERNAC",
    href: "https://www.sernac.cl/portal/604/w3-article-82955.html",
  },
] as const;

export default function NewsSection() {
  return (
    <section id="noticias" aria-labelledby="noticias-title" className="relative scroll-mt-24 overflow-hidden bg-elevated py-14 md:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(215,38,46,0.08),transparent_24%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-red bg-red/10 px-4 py-1.5 text-sm font-semibold text-red">
              Noticias y actualidad
            </span>

            <h2 id="noticias-title" className="mt-4 text-3xl font-extrabold leading-tight text-gray-light sm:text-4xl md:text-5xl">
              Información útil para entender mejor el problema
            </h2>

            <p className="mt-4 text-base leading-relaxed text-gray-light sm:text-lg">
              Revisa noticias, análisis y contenidos relacionados con
              incumplimientos, retrasos, cambios de condiciones y otros temas
              que afectan a quienes compran en proyectos inmobiliarios.
            </p>
          </div>
        </motion.div>

        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:mt-10 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:pb-0 xl:grid-cols-4">
          {newsItems.map((item) => (
            <article
              key={item.href}
              className="group w-[86%] shrink-0 snap-start overflow-hidden rounded-xl border border-white/10 bg-surface shadow-[var(--shadow-medium)] md:w-auto"
            >
              <a href={item.href} className="block h-full focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white" target="_blank" rel="noopener noreferrer">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    fill
                    sizes="(max-width: 767px) 86vw, (max-width: 1279px) 50vw, 25vw"
                    src={item.image}
                    alt=""
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs font-medium text-[#b8b8bd]">
                    {item.source} · <time dateTime={item.date}>{item.dateLabel}</time>
                  </p>
                  <h3 className="mt-3 text-lg font-extrabold leading-snug text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white-secondary">{item.excerpt}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#ff747b]">
                    Leer en la fuente <span aria-hidden="true">→</span>
                  </span>
                </div>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
