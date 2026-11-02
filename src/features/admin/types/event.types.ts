import type { Modality } from "@prisma/client";

export interface AdminEvent {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string | Date;
  time?: string | null;
  modality: Modality | "IN_PERSON" | "ONLINE";
  category: string;
  profile?: string | null;
  objective?: string | null;
  duration?: string | null;
  participants?: string | null;
  requirements?: string | null;
  location?: string | null;
  address?: string | null;
  platform?: string | null;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type EventFormData = Omit<AdminEvent, "id" | "createdAt" | "updatedAt">;
