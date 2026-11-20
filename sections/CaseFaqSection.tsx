import Link from "next/link";
import { siteConfig } from "@/site";

export default function CaseFaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-24 bg-surface px-5 py-14 text-white sm:px-8 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 id="faq-title" className="text-3xl font-extrabold sm:text-4xl">Preguntas frecuentes</h2>
        <div className="mt-7 divide-y divide-white/15 border-y border-white/15">
          <details className="py-4">
            <summary className="cursor-pointer py-1 font-semibold">¿Qué casos puedo registrar?</summary>
            <p className="mt-3 text-sm leading-relaxed text-white-secondary">
              Puedes contar lo ocurrido si tuviste problemas con la entrega de una vivienda, cambios en las condiciones acordadas o dificultades relacionadas con una reserva o promesa de compraventa.
            </p>
          </details>
          <details className="py-4">
            <summary className="cursor-pointer py-1 font-semibold">¿Qué ocurre después de enviar mi reclamo?</summary>
            <p className="mt-3 text-sm leading-relaxed text-white-secondary">
              El formulario te entrega un folio y el caso queda pendiente de revisión. Guarda el folio para identificarlo si necesitas escribir a{" "}
              <a className="underline underline-offset-4" href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>.
            </p>
          </details>
          <details className="py-4">
            <summary className="cursor-pointer py-1 font-semibold">¿Se publican mis datos personales?</summary>
            <p className="mt-3 text-sm leading-relaxed text-white-secondary">
              Los datos de contacto son privados. Puedes autorizar durante el envío que el equipo revise tu caso para publicar una ficha anónima. Consulta la{" "}
              <Link className="underline underline-offset-4" href="/politica-privacidad">política de privacidad</Link>.
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}
