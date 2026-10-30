import EventsSection from "@/features/events/EventsSection";

type EventsPageProps = {
  params?: Promise<{
    locale: string;
  }>;
};

export default async function EventsPage({ params }: EventsPageProps) {
  const resolvedParams = params ? await params : undefined;
  const currentPath = resolvedParams?.locale
    ? `/${resolvedParams.locale}/events`
    : "/events";

  return <EventsSection currentPath={currentPath} />;
}
