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
      className="scroll-mt-24 focus:outline-none border-t border-white/8 bg-[#050505] px-5 py-14 text-white sm:px-8 sm:py-20"
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
            <span className="relative mt-2 block w-fit isolate px-3 pr-5 pb-1 italic">
              <span
                aria-hidden="true"
                className="absolute inset-x-0 inset-y-1 -z-10 -skew-x-12 rounded-l-[18%] bg-[#b51025] [clip-path:polygon(2%_12%,15%_7%,13%_3%,94%_0%,100%_16%,96%_25%,99%_35%,98%_74%,94%_90%,96%_96%,6%_100%,8%_93%,0%_86%,4%_70%,0%_56%)]"
              />
              tu caso
            </span>
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
