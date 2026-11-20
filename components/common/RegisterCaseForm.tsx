"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { ArrowRight, IdCard, Mail, MessageSquare, Phone, UserRound } from "lucide-react";
import { amountOptions, communicationOptions } from "@/constants/cases";

// ─── Types ──────────────────────────────────────────────────────────────────

type CaseFormData = {
  firstName: string;
  lastName: string;
  rut: string;
  email: string;
  phone: string;
  inmobiliariaId: string;
  suggestedCompany: string;
  incidentDate: string;
  claimedAmount: string;
  issueDescription: string;
  expectedSolution: string;
  priorCommunication: string;
  claimObjective: string;
  acceptTerms: boolean;
  allowPublication: boolean;
  declaracionVeracidad: boolean;
};

type Inmobiliaria = {
  _id: string;
  name: string;
};

// ─── Constants ──────────────────────────────────────────────────────────────

const STEP_LABELS = [
  "Tu historia",
  "Inmobiliaria",
  "Detalle del reclamo",
  "Confirmación",
];

const initialForm: CaseFormData = {
  firstName: "",
  lastName: "",
  rut: "",
  email: "",
  phone: "",
  inmobiliariaId: "",
  suggestedCompany: "",
  incidentDate: "",
  claimedAmount: "",
  issueDescription: "",
  expectedSolution: "",
  priorCommunication: "",
  claimObjective: "",
  acceptTerms: false,
  allowPublication: false,
  declaracionVeracidad: false,
};

// ─── Main Component ─────────────────────────────────────────────────────────

export default function RegisterCaseForm({ legalEvaluation = false }: { legalEvaluation?: boolean }) {
  const [form, setForm] = useState<CaseFormData>(initialForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CaseFormData | string, string>>
  >({});
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [receipt, setReceipt] = useState("");
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(0);
  const submitting = useRef(false);
  const submissionKey = useRef<string | null>(null);

  useEffect(() => {
    if (previousStep.current !== step) {
      previousStep.current = step;
      stepHeading.current?.focus();
    }
  }, [step]);

  // Inmobiliarias state
  const [inmobiliarias, setInmobiliarias] = useState<Inmobiliaria[]>([]);
  const [loadingInmobiliarias, setLoadingInmobiliarias] = useState(false);
  const [showNewInmobiliaria, setShowNewInmobiliaria] = useState(false);
  // ─── Fetch inmobiliarias ────────────────────────────────────────────

  const fetchInmobiliarias = useCallback(async () => {
    setLoadingInmobiliarias(true);
    try {
      const res = await fetch("/api/inmobiliarias");
      const data = await res.json();
      setInmobiliarias(Array.isArray(data) ? data : []);
    } catch {
      setInmobiliarias([]);
    } finally {
      setLoadingInmobiliarias(false);
    }
  }, []);

  useEffect(() => {
    fetchInmobiliarias();
  }, [fetchInmobiliarias]);

  // ─── Handlers ───────────────────────────────────────────────────────

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  // ─── Validation per step ────────────────────────────────────────────

  function validateStep(s: number): Partial<Record<string, string>> {
    const nextErrors: Partial<Record<string, string>> = {};

    if (s === 0) {
      if (!form.firstName.trim()) nextErrors.firstName = "Ingresa tu nombre.";
      if (!form.lastName.trim()) nextErrors.lastName = "Ingresa tu apellido.";
      if (!form.rut.trim()) nextErrors.rut = "Ingresa tu RUT.";
      if (!form.email.trim())
        nextErrors.email = "Ingresa tu correo electrónico.";
      else if (!/\S+@\S+\.\S+/.test(form.email))
        nextErrors.email = "Correo no válido.";
      if (!form.phone.trim()) nextErrors.phone = "Ingresa tu teléfono.";
      else if (!/^\+?[\d ()-]+$/.test(form.phone.trim()) ||
          !/^\d{7,15}$/.test(form.phone.replace(/\D/g, ""))) {
        nextErrors.phone = "Ingresa un teléfono válido.";
      }
      if (form.rut.trim() && !/^[\d.]+-?[\dkK]$/.test(form.rut.trim())) {
        nextErrors.rut = "Revisa el formato del RUT.";
      }
      if (!form.issueDescription.trim()) {
        nextErrors.issueDescription = "Describe brevemente qué ocurrió.";
      } else if (form.issueDescription.trim().length < 30) {
        nextErrors.issueDescription = "Describe lo ocurrido en al menos 30 caracteres.";
      }
    }

    if (s === 1) {
      if (showNewInmobiliaria ? !form.suggestedCompany.trim() : !form.inmobiliariaId) {
        nextErrors.inmobiliariaId = showNewInmobiliaria
          ? "Indica el nombre de la inmobiliaria."
          : "Selecciona una inmobiliaria.";
      }
      if (!form.declaracionVeracidad)
        nextErrors.declaracionVeracidad =
          "Debes declarar que la información es verídica.";
    }

    if (s === 2) {
      if (!form.incidentDate.trim())
        nextErrors.incidentDate = "Ingresa la fecha de los hechos.";
      if (!form.claimedAmount.trim())
        nextErrors.claimedAmount = "Selecciona un rango de precio.";
      if (!form.expectedSolution.trim())
        nextErrors.expectedSolution = "Indica qué debe hacer la empresa.";
      if (!form.priorCommunication.trim())
        nextErrors.priorCommunication = "Selecciona una opción.";
      if (!form.claimObjective.trim())
        nextErrors.claimObjective = "Indica qué objetivo esperas lograr.";
    }

    if (s === 3) {
      if (!form.acceptTerms) {
        nextErrors.acceptTerms =
          "Debes aceptar las condiciones y el tratamiento de datos.";
      }
    }

    return nextErrors;
  }

  // ─── Navigation ─────────────────────────────────────────────────────

  function handleNext() {
    const stepErrors = validateStep(step);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;
    setStep((prev) => Math.min(prev + 1, 3));
  }

  function handleBack() {
    setStep((prev) => Math.max(prev - 1, 0));
  }

  function goToStep(s: number) {
    // Solo permite ir a pasos ya completados o al actual
    if (s <= step) {
      setStep(s);
    }
  }

  // ─── Submit ─────────────────────────────────────────────────────────

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step !== 3 || submitting.current || receipt) return;

    for (let current = 0; current <= 3; current++) {
      const validationErrors = validateStep(current);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setStep(current);
        return;
      }
    }

    submitting.current = true;
    try {
      setIsSubmitting(true);
      setSubmitError("");
      submissionKey.current ??= crypto.randomUUID();

      const res = await fetch("/api/case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          inmobiliariaId: showNewInmobiliaria ? "" : form.inmobiliariaId,
          suggestedCompany: showNewInmobiliaria ? form.suggestedCompany : "",
          submissionKey: submissionKey.current,
          legalEvaluation,
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok || typeof data.id !== "string") {
        setSubmitError(data?.error || "No se pudo guardar el reclamo. Inténtalo de nuevo.");
        return;
      }

      setReceipt(data.id);
      setStep(4);
    } catch {
      setSubmitError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  // ─── Selected inmobiliaria name ─────────────────────────────────────

  const selectedInmobiliariaName = useMemo(() => {
    const found = inmobiliarias.find((i) => i._id === form.inmobiliariaId);
    return found?.name || "—";
  }, [inmobiliarias, form.inmobiliariaId]);

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <form
      onSubmit={handleSubmit}
      className="min-w-0 w-full space-y-5 rounded-2xl border border-[#79212c] bg-[radial-gradient(ellipse_at_top_left,#231216_0%,#101010_58%)] p-5 text-white [color-scheme:dark] sm:p-8"
    >
      {/* Ocultamos el Header y el Stepper si estamos en la vista de éxito (step === 4) */}
      {step < 4 && (
        <>
          <h3
            ref={stepHeading}
            tabIndex={-1}
            className="mb-4 scroll-mt-28 text-lg font-extrabold tracking-wide uppercase focus:outline-none sm:text-xl"
          >
            {step === 0 ? <>Cuéntanos <span className="text-[#ff5a61]">tu historia</span></> : STEP_LABELS[step]}
          </h3>

          {/* Stepper */}
          <Stepper
            currentStep={step}
            labels={STEP_LABELS}
            onStepClick={goToStep}
          />
        </>
      )}

      {/* ─── STEP 0 : Datos Personales ───────────────────────────────── */}
      {step === 0 && (
        <div className="grid gap-x-3 gap-y-3.5 sm:grid-cols-2">
          <Field>
            <Label htmlFor="firstName">Nombre *</Label>
            <Input
              icon={UserRound}
              autoComplete="given-name"
              id="firstName"
              name="firstName"
              maxLength={100}
              value={form.firstName}
              onChange={handleChange}
              placeholder="Tu nombre"
            />
            <ErrorText message={errors.firstName} />
          </Field>

          <Field>
            <Label htmlFor="lastName">Apellido *</Label>
            <Input
              icon={UserRound}
              autoComplete="family-name"
              id="lastName"
              name="lastName"
              maxLength={100}
              value={form.lastName}
              onChange={handleChange}
              placeholder="Tu apellido"
            />
            <ErrorText message={errors.lastName} />
          </Field>

          <Field className="sm:col-span-2">
            <Label htmlFor="email">Correo electrónico *</Label>
            <Input
              icon={Mail}
              autoComplete="email"
              id="email"
              name="email"
              maxLength={254}
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
            />
            <ErrorText message={errors.email} />
          </Field>

          <Field>
            <Label htmlFor="rut">RUT *</Label>
            <Input
              icon={IdCard}
              id="rut"
              name="rut"
              maxLength={20}
              value={form.rut}
              onChange={handleChange}
              placeholder="12.345.678-9"
            />
            <ErrorText message={errors.rut} />
          </Field>

          <Field>
            <Label htmlFor="phone">Teléfono *</Label>
            <Input
              icon={Phone}
              type="tel" autoComplete="tel"
              id="phone"
              name="phone"
              maxLength={25}
              value={form.phone}
              onChange={handleChange}
              placeholder="+56 9 1234 5678"
            />
            <ErrorText message={errors.phone} />
          </Field>
          <Field className="sm:col-span-2">
            <Label htmlFor="issueDescription">Cuéntanos brevemente tu caso *</Label>
            <Textarea
              icon={MessageSquare}
              rows={3}
              id="issueDescription"
              name="issueDescription"
              maxLength={5000}
              value={form.issueDescription}
              onChange={handleChange}
              placeholder="Cuéntanos qué ocurrió"
            />
            <ErrorText message={errors.issueDescription} />
          </Field>
        </div>
      )}

      {/* ─── STEP 1 : Inmobiliaria ───────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-5">
          {showNewInmobiliaria ? (
            <Field>
              <Label htmlFor="suggestedCompany">Nombre de la inmobiliaria *</Label>
              <Input
                id="suggestedCompany"
                name="suggestedCompany"
                value={form.suggestedCompany}
                onChange={handleChange}
                maxLength={120}
                placeholder="Nombre comercial"
              />
              <p className="mt-1 text-xs text-[#e4e4e7]">
                El equipo revisará esta sugerencia junto con tu reclamo.
              </p>
            </Field>
          ) : (
            <Field>
              <Label htmlFor="inmobiliariaId">Selecciona la inmobiliaria *</Label>
              <Select
                id="inmobiliariaId"
                name="inmobiliariaId"
                value={form.inmobiliariaId}
                onChange={handleChange}
                disabled={loadingInmobiliarias}
              >
                <option value="">
                  {loadingInmobiliarias ? "Cargando inmobiliarias..." : "Selecciona una inmobiliaria"}
                </option>
                {inmobiliarias.map((inm) => (
                  <option key={inm._id} value={inm._id}>{inm.name}</option>
                ))}
              </Select>
            </Field>
          )}
          <ErrorText message={errors.inmobiliariaId} />

          <button
            type="button"
            onClick={() => {
              setShowNewInmobiliaria((prev) => !prev);
              setErrors((prev) => ({ ...prev, inmobiliariaId: "" }));
            }}
            className="text-sm font-semibold text-[#ff777e] underline-offset-2 hover:underline"
          >
            {showNewInmobiliaria ? "Volver al catálogo" : "¿No encuentras tu inmobiliaria? Indica su nombre"}
          </button>

          {/* Checkbox veracidad */}
          <div className="space-y-3 rounded-[var(--radius-md)] border border-white/12 bg-[#181818] p-5">
            <CheckboxRow>
              <input
                id="declaracionVeracidad"
                name="declaracionVeracidad"
                type="checkbox"
                checked={form.declaracionVeracidad}
                onChange={handleChange}
                className="mt-1 h-5 w-5 shrink-0 rounded-full accent-[#d7262e] cursor-pointer text-red"
              />
              <div>
                <Label
                  htmlFor="declaracionVeracidad"
                  className="cursor-pointer text-sm font-medium leading-relaxed "
                >
                  Declaro que la información proporcionada es verídica y
                  correcta. *
                </Label>
                <ErrorText message={errors.declaracionVeracidad} />
              </div>
            </CheckboxRow>
          </div>
        </div>
      )}

      {/* ─── STEP 2 : Detalle del Reclamo ────────────────────────────── */}
      {step === 2 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <Label htmlFor="incidentDate">Fecha de los hechos *</Label>
            <Input
              id="incidentDate"
              name="incidentDate"
              type="date"
              value={form.incidentDate}
              onChange={handleChange}
            />
            <ErrorText message={errors.incidentDate} />
          </Field>

          <Field>
            <Label htmlFor="claimedAmount">Precio reclamado *</Label>
            <Select
              id="claimedAmount"
              name="claimedAmount"
              value={form.claimedAmount}
              onChange={handleChange}
            >
              <option value="">Selecciona un rango</option>
              {amountOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <ErrorText message={errors.claimedAmount} />
          </Field>

          <Field className="sm:col-span-2">
            <Label htmlFor="expectedSolution">
              ¿Qué debe hacer la empresa para solucionarlo? *
            </Label>
            <Textarea
              id="expectedSolution"
              name="expectedSolution"
              maxLength={2000}
              rows={3}
              value={form.expectedSolution}
              onChange={handleChange}
              placeholder="Ej: Devolución del dinero, entrega inmediata, compensación..."
            />
            <ErrorText message={errors.expectedSolution} />
          </Field>

          <Field>
            <Label htmlFor="priorCommunication">
              ¿Se ha comunicado previamente con la empresa? *
            </Label>
            <Select
              id="priorCommunication"
              name="priorCommunication"
              value={form.priorCommunication}
              onChange={handleChange}
            >
              <option value="">Selecciona una opción</option>
              {communicationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <ErrorText message={errors.priorCommunication} />
          </Field>

          <Field className="sm:col-span-2">
            <Label htmlFor="claimObjective">
              ¿Qué objetivo espera lograr con su reclamo? *
            </Label>
            <Textarea
              id="claimObjective"
              name="claimObjective"
              maxLength={2000}
              rows={3}
              value={form.claimObjective}
              onChange={handleChange}
              placeholder="Tu objetivo final al presentar este caso..."
            />
            <ErrorText message={errors.claimObjective} />
          </Field>
        </div>
      )}

      {/* ─── STEP 3 : Confirmación ───────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-5">
          {/* Resumen */}
          <div className="space-y-4 rounded-[var(--radius-md)] border border-white/10 bg-[#181818] p-5">
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
              {legalEvaluation ? "Resumen de la solicitud de evaluación" : "Resumen de tu reclamo"}
            </h3>

            <SummarySection title="Datos personales">
              <SummaryRow
                label="Nombre"
                value={`${form.firstName} ${form.lastName}`}
              />
              <SummaryRow label="RUT" value={form.rut} />
              <SummaryRow label="Email" value={form.email} />
              <SummaryRow label="Teléfono" value={form.phone} />
            </SummarySection>

            <SummarySection title="Inmobiliaria">
              <SummaryRow
                label="Inmobiliaria"
                value={showNewInmobiliaria ? form.suggestedCompany : selectedInmobiliariaName}
              />
            </SummarySection>

            <SummarySection title="Detalle del reclamo">
              <SummaryRow
                label="Fecha de los hechos"
                value={form.incidentDate}
              />
              <SummaryRow label="Precio reclamado" value={form.claimedAmount} />
              <SummaryRow label="Problema" value={form.issueDescription} />
              <SummaryRow
                label="Solución esperada"
                value={form.expectedSolution}
              />
              <SummaryRow
                label="Comunicación previa"
                value={form.priorCommunication}
              />
              <SummaryRow
                label="Objetivo del reclamo"
                value={form.claimObjective}
              />
            </SummarySection>
          </div>

          <div className="space-y-3 rounded-[var(--radius-md)] border border-white/10 bg-[#181818] p-5">
            <label className="flex items-start gap-3 text-sm text-[#e4e4e7]">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={form.acceptTerms}
                onChange={handleChange}
                className="mt-1 shrink-0 accent-red"
              />
              <span>
                Autorizo que TuPromesa.cl guarde mis datos para revisar este reclamo y
                contactarme según su{" "}
                <Link href="/politica-privacidad" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                  política de privacidad
                </Link>. *
              </span>
            </label>
            <ErrorText message={errors.acceptTerms} />
            <label className="flex items-start gap-3 text-sm text-[#e4e4e7]">
              <input
                name="allowPublication"
                type="checkbox"
                checked={form.allowPublication}
                onChange={handleChange}
                className="mt-1 shrink-0 accent-red"
              />
              <span>Autorizo la publicación de una ficha anónima de mi reclamo después de su revisión (opcional).</span>
            </label>
          </div>

          {submitError && (
            <p role="alert" className="text-sm font-medium text-[#ff858a]">{submitError}</p>
          )}
        </div>
      )}

      {/* ─── STEP 4 : Success (Quinta Vista) ────────────────────────────── */}
      {step === 4 && (
        <div className="relative z-10 w-full space-y-6 py-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#01c676]/20">
            <svg
              className="h-8 w-8 text-[#01c676]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 ref={stepHeading} tabIndex={-1} className="scroll-mt-28 text-2xl font-extrabold text-white focus:outline-none">
            {legalEvaluation ? "Solicitud de evaluación recibida" : "Reclamo enviado"}
          </h3>
          <p className="text-sm leading-relaxed text-[#e4e4e7] max-w-md mx-auto">
            {legalEvaluation
              ? "La solicitud quedó pendiente de revisión. Si necesitas consultar por ella, escribe a contacto@tupromesa.cl con tu folio."
              : "Tu caso quedó pendiente de revisión. Guarda este folio para identificarlo."}
          </p>

          <p className="break-all text-sm font-bold text-[#e4e4e7]">Folio {receipt}</p>

        </div>
      )}

      {/* ─── Navigation buttons ──────────────────────────────────────── */}
      {/* Ocultamos los botones de navegación en el paso de éxito */}
      {step < 4 && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="rounded-lg border border-white/15 px-4 py-3 text-sm font-semibold text-white hover:bg-white/8 disabled:opacity-50"
              >
                Atrás
              </button>
            )}
            {step < 3 ? (
              <button type="button" onClick={handleNext} className={primaryButtonStyle}>
                Continuar <ArrowRight size={17} aria-hidden="true" />
              </button>
            ) : (
              <button type="submit" disabled={!form.acceptTerms || isSubmitting} className={primaryButtonStyle}>
                {isSubmitting ? "Enviando…" : legalEvaluation ? "Solicitar evaluación" : "Enviar mi caso"}
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            )}
          </div>
          <p className="text-center text-xs leading-relaxed text-[#bfbfc2]">
            {step === 3 ? "Revisa toda la información antes de enviar." : "Tu información será tratada con confidencialidad."}
          </p>
        </div>
      )}
    </form>
  );
}

// ─── Stepper Component ────────────────────────────────────────────────────

type StepperProps = {
  currentStep: number;
  labels: string[];
  onStepClick: (step: number) => void;
};

function Stepper({ currentStep, labels, onStepClick }: StepperProps) {
  return (
    <nav aria-label="Pasos del reclamo" className="mb-4 grid grid-cols-4 gap-1.5">
      {labels.map((label, index) => (
        <button
          key={label}
          type="button"
          onClick={() => onStepClick(index)}
          disabled={index >= currentStep}
          aria-current={index === currentStep ? "step" : undefined}
          className={`border-b-2 pb-1.5 text-left text-[10px] leading-tight font-semibold sm:text-[11px] ${index === currentStep ? "border-[#e72d41] text-white" : "border-white/15 text-[#afafb2] enabled:hover:text-white"}`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

// ─── Summary sub-components ──────────────────────────────────────────────

function SummarySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wider text-[#e4e4e7]">
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2">
      <span className="text-sm font-semibold text-[#e4e4e7] sm:w-40 shrink-0 text-start">
        {label}:
      </span>
      <span className="min-w-0 text-sm text-[#e4e4e7] [overflow-wrap:anywhere]">{value || "—"} </span>
    </div>
  );
}

// ─── UI sub-components (preserved from original) ────────────────────────

type FieldProps = {
  children: React.ReactNode;
  className?: string;
};

function Field({ children, className = "" }: FieldProps) {
  return <div className={className}>{children}</div>;
}

type LabelProps = {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
};

function Label({ children, htmlFor, className = "" }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`mb-1.5 block text-[13px] font-medium text-[#e4e4e7] ${className}`}
    >
      {children}
    </label>
  );
}

const controlStyle = "min-w-0 w-full rounded-lg border border-[#373737] bg-[#181818] px-3 py-3 text-base text-white outline-none transition placeholder:text-[#a4a4a8] focus:border-[#ff5a61] focus:ring-1 focus:ring-[#ff5a61] sm:text-sm";
const primaryButtonStyle = "flex min-h-12 flex-1 items-center justify-center gap-3 rounded-lg bg-[#c8102e] px-4 py-3 text-sm font-extrabold tracking-wide text-white uppercase transition hover:bg-[#a70c26] disabled:cursor-not-allowed disabled:opacity-50";

function Input({ icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: typeof Mail }) {
  return (
    <div className="relative">
      {Icon && <Icon aria-hidden="true" size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#a4a4a8]" />}
      <input {...props} className={`${controlStyle} ${Icon ? "pl-9" : ""}`} />
    </div>
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={controlStyle} />;
}

function Textarea({ icon: Icon, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { icon?: typeof Mail }) {
  return (
    <div className="relative">
      {Icon && <Icon aria-hidden="true" size={16} className="pointer-events-none absolute top-3.5 left-3 text-[#a4a4a8]" />}
      <textarea rows={3} {...props} className={`${controlStyle} block resize-y ${Icon ? "pl-9" : ""}`} />
    </div>
  );
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="mt-2 text-xs font-medium text-[#ff858a]">{message}</p>;
}

function CheckboxRow({ children }: { children: React.ReactNode }) {
  return <div className="flex items-start gap-3 ">{children}</div>;
}
