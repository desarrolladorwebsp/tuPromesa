import { ArrowUpRight, Mail } from "lucide-react";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import RegisterCaseForm from "@/components/common/RegisterCaseForm";
import { siteConfig } from "@/site";

const contactLinks = [
  { label: "Instagram", href: siteConfig.social.instagram, Icon: FaInstagram },
  { label: "Facebook", href: siteConfig.social.facebook, Icon: FaFacebookF },
  { label: "WhatsApp", href: siteConfig.contact.whatsappLink, Icon: FaWhatsapp },
];

export default function RegisterCaseSection() {
  return (
    <section
      id="registrar-reclamo"
      tabIndex={-1}
      aria-labelledby="registrar-reclamo-title"
      className="scroll-mt-24 border-t border-white/8 bg-[#080808] bg-[radial-gradient(ellipse_at_20%_35%,#232428_0%,#111214_44%,#080808_78%)] px-5 py-14 text-white focus:outline-none sm:px-8 sm:py-20"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div className="lg:pl-6">
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="inline-flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[#ff5a61] hover:text-white"
          >
            <Mail size={15} aria-hidden="true" />
            Contáctanos
          </a>
          <h2
            id="registrar-reclamo-title"
            className="mt-4 text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.04] font-black tracking-tight uppercase"
          >
            Envíanos
            <span className="mt-1 block text-[#d2d3d7]">tu caso</span>
          </h2>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-[#c7c7c9] sm:text-lg">
            Si tu inmobiliaria incumplió lo acordado, cuéntanos qué pasó y qué solución esperas.
          </p>
          <div className="mt-7 flex flex-wrap gap-4 sm:gap-6">
            {contactLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2 text-[10px] font-bold tracking-wider text-[#c7c7c9] uppercase hover:text-white"
              >
                <span className="grid size-12 place-items-center rounded-full border border-[#a41d2d] text-white transition-colors group-hover:bg-[#a41d2d]">
                  <Icon size={17} aria-hidden="true" />
                </span>
                {label}
              </a>
            ))}
          </div>
          <a
            href="/politica-privacidad"
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-[#c7c7c9] underline-offset-4 hover:underline"
          >
            Política de privacidad <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </div>
        <RegisterCaseForm />
      </div>
    </section>
  );
}
