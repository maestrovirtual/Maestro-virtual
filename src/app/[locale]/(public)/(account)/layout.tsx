// Login, registro y recuperacion de contraseña de usuarios finales (MV-36).
// pt-28 deja espacio para el Navbar fijo.
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-background px-4 pt-28 pb-16">
      {children}
    </section>
  );
}
