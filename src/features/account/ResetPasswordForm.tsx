"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";

import Button from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import AuthCard, { Field, FormError, linkClasses } from "@/features/account/AuthCard";
import { submitJson } from "@/features/account/submitJson";
import { MIN_PASSWORD_LENGTH, passwordError } from "@/lib/auth/account";

export default function ResetPasswordForm({ token, locale }: { token: string; locale: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");

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
    const result = await submitJson("/api/account/password/reset", { token, password });

    if (result.ok) {
      router.replace(`/${locale}/login?reset=1`);
      return;
    }

    setError(result.error);
    setSubmitting(false);
  }

  return (
    <AuthCard title="Nueva contraseña" subtitle="Elige la contraseña con la que vas a entrar">
      <form onSubmit={handleSubmit} method="post" className="space-y-4" noValidate>
        <Field
          id="reset-password"
          name="password"
          type="password"
          label="Nueva contraseña"
          hint={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`}
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          required
        />
        <Field
          id="reset-confirm-password"
          name="confirmPassword"
          type="password"
          label="Confirma tu nueva contraseña"
          autoComplete="new-password"
          required
        />

        <FormError message={error} />

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
          {submitting ? "Guardando..." : "Guardar contraseña"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        ¿El enlace ya no funciona?{" "}
        <Link href="/forgot-password" className={linkClasses}>
          Pide uno nuevo
        </Link>
      </p>
    </AuthCard>
  );
}
