import AdminSidebar from "@/features/admin/components/AdminSidebar";
import AdminMessagesView from "@/features/admin/components/AdminMessagesView";
import { getStaffUser } from "@/lib/auth/dal";
import { redirect } from "next/navigation";

export default async function AdminMessagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!await getStaffUser()) redirect(`/${locale}/staff/login`);
  return (
    <div className="flex min-h-screen bg-[#f6f8fc]" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <AdminSidebar />
      <main className="min-w-0 flex-1 px-4 py-8 md:px-8 lg:px-12 lg:py-10"><AdminMessagesView /></main>
    </div>
  );
}
