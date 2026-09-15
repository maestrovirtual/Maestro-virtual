import { Stage, CourseType, BackgroundPattern } from "@prisma/client";

// El mock del front (features/courses/data/courses.ts) y los formularios
// existentes usan valores "bonitos" (stage: 1, type: "Curso",
// backgroundPattern: "waves"). La BD guarda enums. Este helper traduce uno
// a otro para que nadie tenga que reescribir lo que ya manda el frontend.

export const stageMap: Record<string, Stage> = {
  "1": Stage.UNO,
  "2": Stage.DOS,
  "3": Stage.TRES,
};

export const typeMap: Record<string, CourseType> = {
  Curso: CourseType.CURSO,
  Taller: CourseType.TALLER,
  Conferencia: CourseType.CONFERENCIA,
};

export const patternMap: Record<string, BackgroundPattern> = {
  grid: BackgroundPattern.GRID,
  waves: BackgroundPattern.WAVES,
  shapes: BackgroundPattern.SHAPES,
  cards: BackgroundPattern.CARDS,
  slides: BackgroundPattern.SLIDES,
  growth: BackgroundPattern.GROWTH,
  chat: BackgroundPattern.CHAT,
};

// Si ya mandan el valor del enum tal cual (ej. "CURSO", "GRID"), lo respeta;
// si mandan el valor "bonito" del mock (ej. "Curso", "grid"), lo traduce;
// si no reconoce nada, regresa el fallback en vez de tronar.
export function resolveEnum<T extends string>(
  value: unknown,
  map: Record<string, T>,
  enumValues: readonly T[],
  fallback: T
): T {
  if (typeof value === "string") {
    if ((enumValues as readonly string[]).includes(value)) return value as T;
    if (map[value]) return map[value];
  }
  return fallback;
}