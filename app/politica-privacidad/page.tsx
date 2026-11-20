import type { Metadata } from "next";

import PrivacyPolicyView from "@/components/privacy-policy/privacy-policy-view";
import { privacyPolicyMeta } from "@/constants/privacy-policy";
import Footer from "@/sections/Footer";
import Navbar from "@/sections/NavBar";
import { siteConfig } from "@/site";

export const metadata: Metadata = {
  title: privacyPolicyMeta.title,
  description: "Conoce cómo TuPromesa.cl recopila, utiliza y protege los datos personales de quienes registran reclamos.",
  alternates: {
    canonical: `${siteConfig.url}${privacyPolicyMeta.path}`,
  },
  openGraph: {
    type: "website",
    siteName: "TuPromesa.cl",
    locale: "es_CL",
    title: privacyPolicyMeta.title,
    description: "Conoce cómo TuPromesa.cl trata los datos personales de quienes registran reclamos.",
    url: `${siteConfig.url}${privacyPolicyMeta.path}`,
  },
};

export default function PoliticaPrivacidadPage() {
  return (
    <>
      <Navbar />
      <main>
        <PrivacyPolicyView />
      </main>
      <Footer />
    </>
  );
}
