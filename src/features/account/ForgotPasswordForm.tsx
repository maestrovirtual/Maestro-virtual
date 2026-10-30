"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Mail } from "lucide-react";

import Button from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import AuthCard, { Field, FormError, FormNotice, linkClasses } from "@/features/account/AuthCard";
import { submitJson } from "@/features/account/submitJson";

export default function ForgotPasswordForm({ locale }: { locale: string }) {
  const [error, setError] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    // El idioma define en que idioma se abre el enlace del correo.
    const result = await submitJson("/api/account/password/forgot", {
      email: form.get("email"),
      locale,
    });

    if (result.ok) {
      setSentMessage(String(result.data.message ?? "Revisa tu correo."));
    } else {
      setError(result.error);
    }
    setSubmitting(false);
  }

  return (
    <AuthCard
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para elegir una nueva"
    >
      {sentMessage ? (
        <div className="space-y-4">
          <FormNotice>{sentMessage}</FormNotice>
          <p className="text-sm text-text-secondary">
            El enlace vence en 1 hora. Si no lo ves, revisa tu carpeta de spam.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} method="post" className="space-y-4" noValidate>
          <Field id="forgot-email" name="email" type="email" label="Correo" autoComplete="email" required />

          <FormError message={error} />

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
            {submitting ? "Enviando..." : "Enviar enlace"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-text-secondary">
        <Link href="/login" className={linkClasses}>
          Volver a iniciar sesión
        </Link>
      </p>
    </AuthCard>
  );
}
