import AdminSidebar from "@/features/admin/components/AdminSidebar";
import AdminMessagesView from "@/features/admin/components/AdminMessagesView";
import { getStaffUser } from "@/lib/auth/dal";
import { redirect } from "next/navigation";

export default async function AdminMessagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!await getStaffUser()) redirect(`/${locale}/staff/login`);
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="min-w-0 flex-1 p-4 md:p-8"><AdminMessagesView /></main>
    </div>
  );
}
