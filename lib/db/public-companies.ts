export const publicCompanyFilter = {
  status: "Activa",
  name: { $type: "string" as const },
  rut: { $exists: false },
  direccion: { $exists: false },
  contacto: { $exists: false },
};
