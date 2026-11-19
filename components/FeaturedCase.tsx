"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type FeaturedCaseProps = {
  inmobiliariaName: string;
  inmobiliariaLogo: string;
  userName: string;
  comment: string;
  context: string;
  date: string;
  dateTime: string;
  sourceUrl: string;
};

export default function FeaturedCase({
  inmobiliariaName,
  inmobiliariaLogo,
  userName,
  comment,
  context,
  date,
  dateTime,
  sourceUrl,
}: FeaturedCaseProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      className="group flex flex-col overflow-hidden rounded-md border border-default bg-light shadow-[0_6px_18px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] md:flex-row"
    >
      {/* Contenido */}
      <div className="flex w-full flex-col justify-between py-2 px-4">
        {/* Top */}
        <div>
          {/* Nombre + fecha */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm  md:text-lg font-semibold text-red pb-0 mb-0">
                {inmobiliariaName}
              </h3>
              <time dateTime={dateTime} className="text-[11px] text-dark">
                {date}
              </time>
              <p className="text-xs text-dark">
                Reportado por{" "}
                <span className="font-bold">
                  {userName}
                </span>
              </p>
            </div>

            <div className="shrink-0">
              <Image
                src={inmobiliariaLogo}
                alt=""
                width={120}
                height={60}
                className="h-auto w-20 rounded-lg sm:w-[120px]"
              />
            </div>
          </div>
          {/* Comentario */}
          <blockquote cite={sourceUrl} className="mt-2 text-sm leading-relaxed text-dark">
            “{comment}”
          </blockquote>
          <p className="mt-1 text-sm leading-relaxed text-dark">{context}</p>
        </div>

        {/* Bottom */}
        <div className="mt-2">
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-sm py-1 text-xs font-bold text-[var(--color-primary-active)] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Ver reclamo original en Reclamos.cl
          </a>
        </div>
      </div>
    </motion.article>
  );
}
