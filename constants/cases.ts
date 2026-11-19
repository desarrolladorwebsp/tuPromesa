export const amountOptions: readonly string[] = [
  "Menos de 100 UF", "Más de 100 UF", "Más de 500 UF", "Más de 1.000 UF",
];

export const communicationOptions: readonly string[] = [
  "Sí, me he comunicado con ellos", "No me he comunicado aún",
];

export const publicationCategories = {
  entrega: { title: "Plazos de entrega", summary: "El reclamo se refiere a los plazos de entrega de una propiedad." },
  devolucion: { title: "Devolución de dinero", summary: "El reclamo se refiere a la devolución de pagos asociados a una compra inmobiliaria." },
  contrato: { title: "Condiciones de compraventa", summary: "El reclamo se refiere a condiciones de una reserva, promesa o compraventa." },
  postventa: { title: "Servicio de postventa", summary: "El reclamo se refiere a la atención recibida después de la compra o entrega." },
  calidad: { title: "Estado de la propiedad", summary: "El reclamo se refiere a observaciones sobre el estado de una propiedad." },
  comunicacion: { title: "Comunicación durante el proceso", summary: "El reclamo se refiere a la información recibida durante el proceso inmobiliario." },
  otro: { title: "Otro asunto inmobiliario", summary: "La plataforma recibió un reclamo relacionado con un proceso inmobiliario." },
} as const;

export const publicationResolutions = {
  ninguna: "",
  informacion: "La persona solicita información sobre el caso.",
  entrega: "La persona solicita una solución relacionada con la entrega.",
  devolucion: "La persona solicita una devolución.",
  reparacion: "La persona solicita una reparación.",
  compensacion: "La persona solicita una compensación.",
  respuesta: "La persona solicita una respuesta de la empresa.",
} as const;

export type PublicationCategory = keyof typeof publicationCategories;
export type PublicationResolution = keyof typeof publicationResolutions;

export type PublicCase = {
  id: string;
  companyName: string;
  title: string;
  summary: string;
  requestedResolution: string;
  month: string;
};

export function isPublicationCategory(value: unknown): value is PublicationCategory {
  return typeof value === "string" && Object.hasOwn(publicationCategories, value);
}

export function isPublicationResolution(value: unknown): value is PublicationResolution {
  return typeof value === "string" && Object.hasOwn(publicationResolutions, value);
}
