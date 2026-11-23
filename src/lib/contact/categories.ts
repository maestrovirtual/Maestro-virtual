// Categorías del formulario de contacto. Sustituyen al asunto libre para que
// el staff atienda todo desde un solo buzón, con una sección por categoría.
export const CONTACT_CATEGORIES = [
  { value: "CURSOS", label: "Cursos" },
  { value: "INSCRIPCIONES", label: "Inscripciones" },
  { value: "EVENTOS", label: "Eventos" },
  { value: "SOPORTE", label: "Soporte técnico" },
  { value: "OTRO", label: "Otro" },
] as const;

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number]["value"];

export function isContactCategory(value: unknown): value is ContactCategory {
  return CONTACT_CATEGORIES.some(category => category.value === value);
}

export function contactCategoryLabel(value: string): string {
  return CONTACT_CATEGORIES.find(category => category.value === value)?.label ?? "Otro";
}
