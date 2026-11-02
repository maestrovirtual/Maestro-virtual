import { LayoutDashboard, LogOut } from "lucide-react";
import NextLink from "next/link";

import Button from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import AuthCard, { linkClasses } from "@/features/account/AuthCard";
import type { CurrentUser } from "@/lib/auth/user";

// Se muestra en /login cuando ya hay sesion: permite ir al dashboard (MV-39) o cerrarla.
export default function SignedInCard({ user, locale }: { user: CurrentUser; locale: string }) {
  return (
    <AuthCard title="Ya iniciaste sesión" subtitle={`Entraste como ${user.name}`}>
      <p className="text-center text-sm text-text-secondary">{user.email}</p>

      <div className="mt-6 space-y-3">
        <NextLink
          href={`/${locale}/dashboard`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:brightness-90"
        >
          <LayoutDashboard size={18} />
          Mi Dashboard
        </NextLink>

        {/* Formulario HTML normal: funciona aunque no haya cargado JavaScript. */}
        <form action="/api/account/logout" method="post">
          <input type="hidden" name="locale" value={locale} />
          <Button type="submit" variant="secondary" size="lg" className="w-full">
            <LogOut size={18} />
            Cerrar sesión
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-text-secondary">
        <Link href="/" className={linkClasses}>
          Ir al inicio
        </Link>
      </p>
    </AuthCard>
  );
}
