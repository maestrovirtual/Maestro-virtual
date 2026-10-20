import AdminEventsPage from "@/features/admin/components/AdminEventsView";
import { getAdminEvents } from "@/features/admin/actions/event.actions";
import type { AdminEvent } from "@/features/admin/types/event.types";

export const dynamic = "force-dynamic";

export default async function AdminEventosRoute() {
  let initialEvents: AdminEvent[] = [];
  try {
    initialEvents = await getAdminEvents();
  } catch {
    initialEvents = [];
  }

  return <AdminEventsPage initialEvents={initialEvents} />;
}
