import { Users } from "lucide-react";
import type { EnrollmentStatus, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma/client";
import Card from "@/components/ui/Card";

export interface AdminEnrollmentsTableProps {
  courseId?: string;
  eventId?: string;
}

type EnrollmentWithUser = Prisma.EnrollmentGetPayload<{
  include: {
    user: {
      select: {
        name: true;
        email: true;
      };
    };
  };
}>;

const STATUS_CONFIG: Record<
  EnrollmentStatus,
  { label: string; badgeClass: string }
> = {
  REGISTERED: {
    label: "Registrado",
    badgeClass:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  COMPLETED: {
    label: "Completado",
    badgeClass:
      "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  CANCELLED: {
    label: "Cancelado",
    badgeClass:
      "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
};

function formatEnrollmentDate(date: Date | string): string {
  try {
    const parsed = date instanceof Date ? date : new Date(date);
    if (isNaN(parsed.getTime())) return String(date);
    return parsed.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(date);
  }
}

export default async function AdminEnrollmentsTable({
  courseId,
  eventId,
}: AdminEnrollmentsTableProps) {
  let enrollments: EnrollmentWithUser[] = [];

  if (courseId || eventId) {
    try {
      enrollments = await prisma.enrollment.findMany({
        where: courseId ? { courseId } : { eventId },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      });
    } catch {
      enrollments = [];
    }
  }

  return (
    <Card variant="elevated" className="p-6">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users size={18} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              Personas Inscritas
            </h3>
            <p className="text-xs text-text-secondary">
              Listado de usuarios registrados en este{" "}
              {courseId ? "curso" : "evento"}.
            </p>
          </div>
        </div>

        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          {enrollments.length}{" "}
          {enrollments.length === 1 ? "inscrito" : "inscritos"}
        </span>
      </div>

      {enrollments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background/60 py-10 text-center">
          <p className="text-sm font-medium text-text-secondary">
            No hay inscripciones aún
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-text-secondary">
                <th scope="col" className="py-3 pr-4">
                  Nombre
                </th>
                <th scope="col" className="px-4 py-3">
                  Correo
                </th>
                <th scope="col" className="px-4 py-3">
                  Fecha de inscripción
                </th>
                <th scope="col" className="py-3 pl-4">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {enrollments.map((enrollment) => {
                const statusInfo = STATUS_CONFIG[enrollment.status] ?? {
                  label: enrollment.status,
                  badgeClass: "bg-slate-100 text-slate-700",
                };

                return (
                  <tr
                    key={enrollment.id}
                    className="transition-colors hover:bg-background/60"
                  >
                    <td className="py-3.5 pr-4 font-medium text-text-primary">
                      {enrollment.user.name}
                    </td>
                    <td className="px-4 py-3.5 text-text-secondary">
                      {enrollment.user.email}
                    </td>
                    <td className="px-4 py-3.5 text-text-secondary">
                      {formatEnrollmentDate(enrollment.date)}
                    </td>
                    <td className="py-3.5 pl-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusInfo.badgeClass}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

