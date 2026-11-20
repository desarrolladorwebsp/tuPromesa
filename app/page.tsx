import type { Metadata } from "next";
import { siteConfig } from "@/site";
import CaseFaqSection from "@/sections/CaseFaqSection";
import HeroSection from "@/sections/HeroSection";
import ReportedCasesSection from "@/sections/ReportedCasesSection";
import RegisterCaseSection from "@/sections/RegisterCaseSection";
import Footer from "@/sections/Footer";
import FloatingActionBar from "@/components/common/FloatingActionBar";
import Navbar from "@/sections/NavBar";
import LegalSupportSection from "@/sections/LegalSupportSection";
import NewsSection from "@/sections/NewsSection";

const title = "Reclamos inmobiliarios en Chile | TuPromesa.cl";
const description = "Registra un reclamo contra una inmobiliaria en Chile por atrasos en la entrega, cambios de condiciones o problemas con tu promesa de compraventa.";
const socialImage = {
  url: "/images/og-image.png",
  width: 1536,
  height: 1024,
  alt: "¿Tu promesa inmobiliaria no se cumplió?",
};

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "/",
    siteName: "TuPromesa.cl",
    title,
    description,
    images: [socialImage],
  },
  twitter: { card: "summary_large_image", title, description, images: [socialImage] },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: "TuPromesa.cl",
      url: `${siteConfig.url}/`,
      inLanguage: "es-CL",
      publisher: { "@id": `${siteConfig.url}/#organizacion` },
    },
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organizacion`,
      name: "TuPromesa.cl",
      url: `${siteConfig.url}/`,
      logo: `${siteConfig.url}/images/logo-tu-promesa-cl.png`,
      email: siteConfig.contact.email,
      sameAs: [siteConfig.social.instagram, siteConfig.social.facebook],
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Navbar />
      <main>
        <HeroSection />
        <ReportedCasesSection />
        <LegalSupportSection />
        <NewsSection />
        <RegisterCaseSection />
        <CaseFaqSection />
      </main>
      <Footer />
      <FloatingActionBar />
    </>
  );
}
