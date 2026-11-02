import Image from "next/image";
import type { InputHTMLAttributes, ReactNode } from "react";

import Card from "@/components/ui/Card";

const inputClasses =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text-primary " +
  "placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary";

export const linkClasses = "font-medium text-primary hover:underline";

// Tarjeta comun de login, registro y recuperacion (mismo estilo que el login de staff).
export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Card variant="elevated" className="w-full max-w-md p-8 hover:shadow-sm">
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
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
        </div>
      </div>
      {children}
    </Card>
  );
}

export function Field({
  id,
  label,
  hint,
  ...inputProps
}: InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text-primary">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={inputClasses}
        {...inputProps}
      />
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-text-secondary">
          {hint}
        </p>
      )}
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  return (
    <p role="alert" aria-live="polite" className="min-h-5 text-sm text-red-600 dark:text-red-400">
      {message}
    </p>
  );
}

export function FormNotice({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-950/40 dark:text-green-300"
    >
      {children}
    </p>
  );
}
