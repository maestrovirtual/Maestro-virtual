import AdminEventsPage from "@/features/admin/components/AdminEventsView";
import { getAdminEvents } from "@/features/admin/actions/event.actions";
import type { AdminEvent } from "@/features/admin/types/event.types";

export const dynamic = "force-dynamic";

type AdminEventosRouteProps = {
  params?: Promise<{ locale: string }>;
};

export default async function AdminEventosRoute({
  params,
}: AdminEventosRouteProps = {}) {
  const resolvedParams = params ? await params : undefined;
  const locale = resolvedParams?.locale ?? "es";

  let initialEvents: AdminEvent[] = [];
  try {
    initialEvents = await getAdminEvents();
  } catch {
    initialEvents = [];
  }

  return <AdminEventsPage initialEvents={initialEvents} locale={locale} />;
}
