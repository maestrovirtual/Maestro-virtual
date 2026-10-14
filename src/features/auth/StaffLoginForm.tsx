"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, LogIn } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const inputClasses =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text-primary " +
  "placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary";

export default function StaffLoginForm({ locale }: { locale: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });

      if (response.ok) {
        router.replace(`/${locale}/admin`);
        router.refresh();
        return;
      }

      const data = await response.json().catch(() => null);
      setError(data?.error ?? "No se pudo iniciar sesión. Intenta de nuevo.");
    } catch {
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
    }

    setSubmitting(false);
  }

  return (
    <Card variant="elevated" className="w-full max-w-sm p-8 hover:shadow-sm">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <Image
          src="/images/logo/maestrovirtual.webp"
          alt="Maestro Virtual"
          width={144}
          height={44}
          priority
          className="object-contain"
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Acceso para staff</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Panel de administración de Maestro Virtual
          </p>
        </div>
      </div>

      {/* method="post": si se envia antes de que cargue JavaScript, las
          credenciales no terminan en la URL. */}
      <form onSubmit={handleSubmit} method="post" className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="staff-email" className="text-sm font-medium text-text-primary">
            Correo
          </label>
          <input
            id="staff-email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className={inputClasses}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="staff-password" className="text-sm font-medium text-text-primary">
            Contraseña
          </label>
          <input
            id="staff-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={inputClasses}
          />
        </div>

        <p role="alert" aria-live="polite" className="min-h-5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
          {submitting ? "Entrando..." : "Iniciar sesión"}
        </Button>
      </form>
    </Card>
  );
}
