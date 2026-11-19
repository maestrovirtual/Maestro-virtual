import { BookOpen, CalendarDays, ClipboardCheck, LifeBuoy, MessageCircle, type LucideIcon } from "lucide-react";
import type { ContactCategory } from "@/lib/contact/categories";

// Íconos compartidos entre el formulario de contacto y el panel de mensajes.
export const CATEGORY_ICONS: Record<ContactCategory, LucideIcon> = {
  CURSOS: BookOpen,
  INSCRIPCIONES: ClipboardCheck,
  EVENTOS: CalendarDays,
  SOPORTE: LifeBuoy,
  OTRO: MessageCircle,
};
