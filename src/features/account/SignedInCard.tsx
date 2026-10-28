import { LogOut } from "lucide-react";

import Button from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import AuthCard, { linkClasses } from "@/features/account/AuthCard";
import type { CurrentUser } from "@/lib/auth/user";

// Se muestra en /login cuando ya hay sesion: es el lugar para cerrarla hasta
// que exista el dashboard de usuario (MV-39).
export default function SignedInCard({ user, locale }: { user: CurrentUser; locale: string }) {
  return (
    <AuthCard title="Ya iniciaste sesión" subtitle={`Entraste como ${user.name}`}>
      <p className="text-center text-sm text-text-secondary">{user.email}</p>

      {/* Formulario HTML normal: funciona aunque no haya cargado JavaScript. */}
      <form action="/api/account/logout" method="post" className="mt-6">
        <input type="hidden" name="locale" value={locale} />
        <Button type="submit" variant="secondary" size="lg" className="w-full">
          <LogOut size={18} />
          Cerrar sesión
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        <Link href="/" className={linkClasses}>
          Ir al inicio
        </Link>
      </p>
    </AuthCard>
  );
}
