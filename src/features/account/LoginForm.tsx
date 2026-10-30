"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";

import Button from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import AuthCard, { Field, FormError, FormNotice, linkClasses } from "@/features/account/AuthCard";
import { submitJson } from "@/features/account/submitJson";

export default function LoginForm({
  next,
  passwordReset = false,
}: {
  // Ruta ya validada con safeNextPath; incluye el idioma.
  next: string;
  passwordReset?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const result = await submitJson("/api/account/login", {
      email: form.get("email"),
      password: form.get("password"),
    });

    if (result.ok) {
      router.replace(next);
      router.refresh();
      return;
    }

    setError(result.error);
    setSubmitting(false);
  }

  return (
    <AuthCard title="Iniciar sesión" subtitle="Entra para inscribirte a cursos y eventos">
      {passwordReset && (
        <div className="mb-4">
          <FormNotice>Tu contraseña se actualizó. Inicia sesión con la nueva.</FormNotice>
        </div>
      )}

      {/* method="post": si se envia antes de que cargue JavaScript, las
          credenciales no terminan en la URL. */}
      <form onSubmit={handleSubmit} method="post" className="space-y-4" noValidate>
        <Field id="login-email" name="email" type="email" label="Correo" autoComplete="email" required />
        <Field
          id="login-password"
          name="password"
          type="password"
          label="Contraseña"
          autoComplete="current-password"
          required
        />

        <div className="text-right text-sm">
          <Link href="/forgot-password" className={linkClasses}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <FormError message={error} />

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
          {submitting ? "Entrando..." : "Iniciar sesión"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        ¿No tienes cuenta?{" "}
        <Link href={{ pathname: "/register", query: { next } }} className={linkClasses}>
          Crea una
        </Link>
      </p>
    </AuthCard>
  );
}
