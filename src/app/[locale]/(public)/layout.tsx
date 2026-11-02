import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/auth/dal";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
    // Sin cookie de sesion no hay consulta a la base de datos (MV-36).
    const user = await getCurrentUser();

    return (
        <>
            <Navbar session={user} userName={user?.name ?? null} />
            <main className="flex-1">{children}</main>
            <Footer />
        </>
    );
}