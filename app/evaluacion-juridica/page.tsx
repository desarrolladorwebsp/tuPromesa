import type { Metadata } from "next";
import RegisterCaseForm from "@/components/common/RegisterCaseForm";
import Navbar from "@/sections/NavBar";
import Footer from "@/sections/Footer";

export const metadata: Metadata = {
  title: "Solicitar evaluación jurídica",
  description: "Envía los antecedentes de tu reclamo inmobiliario y solicita una evaluación jurídica inicial en TuPromesa.",
  alternates: { canonical: "/evaluacion-juridica" },
};

export default function LegalReviewPage() {
  return (
    <>
      <Navbar />
      <main className="bg-base px-5 pt-28 pb-16 text-white sm:px-8 sm:pt-36">
        <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div className="space-y-5">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Solicita una evaluación jurídica</h1>
            <p className="max-w-lg leading-relaxed text-white-secondary">
              Envía los antecedentes de tu caso para que el equipo de TuPromesa los revise. Recibirás un folio en pantalla para identificar tu solicitud.
            </p>
            <p className="max-w-lg text-sm leading-relaxed text-white-secondary">
              La solicitud queda pendiente de revisión. Una eventual derivación a un estudio jurídico se coordina contigo. Si ya registraste el reclamo, escribe a{" "}
              <a className="underline underline-offset-4" href="mailto:contacto@tupromesa.cl">contacto@tupromesa.cl</a> con tu folio para solicitar la evaluación del mismo caso.
            </p>
          </div>
          <RegisterCaseForm legalEvaluation />
        </div>
      </main>
      <Footer />
    </>
  );
}
