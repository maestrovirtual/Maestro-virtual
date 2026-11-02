export interface AdminCourse {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  image: string;
  icon?: string | null;
  video?: string | null;
  color: string;
  type: string;
  stage: string | number;
  categories: string[];
  skills: string[];
  duration: string;
  sessions?: number | null;
  hoursPerSession?: number | null;
  modality: string;
  participants: string;
  targetAudience: string;
  objective: string;
  requirements: string;
  backgroundPattern: string;
  featured: boolean;
  featuredOrder?: number | null;
  clickable: boolean;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type CourseFormData = Omit<AdminCourse, "id" | "createdAt" | "updatedAt">;
