"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";

import Button from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import AuthCard, { Field, FormError, linkClasses } from "@/features/account/AuthCard";
import { submitJson } from "@/features/account/submitJson";
import { MAX_NAME_LENGTH, MIN_PASSWORD_LENGTH, passwordError } from "@/lib/auth/account";

export default function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");

    // Se revisa aqui para no esperar al servidor en los errores mas comunes.
    const invalidPassword = passwordError(password);
    if (invalidPassword) {
      setError(invalidPassword);
      return;
    }
    if (password !== form.get("confirmPassword")) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setSubmitting(true);
    const result = await submitJson("/api/account/register", {
      name: form.get("name"),
      email: form.get("email"),
      password,
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
    <AuthCard title="Crear cuenta" subtitle="Regístrate para inscribirte a cursos y eventos">
      <form onSubmit={handleSubmit} method="post" className="space-y-4" noValidate>
        <Field
          id="register-name"
          name="name"
          label="Nombre completo"
          autoComplete="name"
          maxLength={MAX_NAME_LENGTH}
          required
        />
        <Field id="register-email" name="email" type="email" label="Correo" autoComplete="email" required />
        <Field
          id="register-password"
          name="password"
          type="password"
          label="Contraseña"
          hint={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`}
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          required
        />
        <Field
          id="register-confirm-password"
          name="confirmPassword"
          type="password"
          label="Confirma tu contraseña"
          autoComplete="new-password"
          required
        />

        <FormError message={error} />

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
          {submitting ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        ¿Ya tienes cuenta?{" "}
        <Link href={{ pathname: "/login", query: { next } }} className={linkClasses}>
          Inicia sesión
        </Link>
      </p>
    </AuthCard>
  );
}
