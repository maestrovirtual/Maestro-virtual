import { notFound, redirect } from "next/navigation";

import AdminEnrollmentsTable from "@/features/admin/components/AdminEnrollmentsTable";
import AdminSidebar from "@/features/admin/components/AdminSidebar";
import EventForm from "@/features/admin/components/EventForm";
import type { AdminEvent } from "@/features/admin/types/event.types";
import { getStaffUser } from "@/lib/auth/dal";
import prisma from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

type AdminEventDetailPageProps = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

export default async function AdminEventDetailPage({
  params,
}: AdminEventDetailPageProps) {
  const { locale, id } = await params;

  const staff = await getStaffUser();
  if (!staff) {
    redirect(`/${locale}/staff/login`);
  }

  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    notFound();
  }

  const eventToEdit: AdminEvent = {
    id: event.id,
    title: event.title,
    description: event.description,
    image: event.image,
    date: event.date.toISOString(),
    time: event.time,
    modality: event.modality,
    category: event.category,
    profile: event.profile,
    objective: event.objective,
    duration: event.duration,
    participants: event.participants,
    requirements: event.requirements,
    location: event.location,
    address: event.address,
    platform: event.platform,
    isActive: event.isActive,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-8">
        <EventForm eventToEdit={eventToEdit} locale={locale} />

        <div className="mx-auto max-w-4xl pb-12">
          <AdminEnrollmentsTable eventId={event.id} />
        </div>
      </main>
    </div>
  );
}

