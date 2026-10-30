"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import clsx from "clsx";
import { ArrowRight, CheckCircle2, Loader2, X } from "lucide-react";

import { routing } from "@/i18n/routing";
import type { EnrollmentItemType } from "@/features/enrollments/actions/enrollment.actions";

export interface EnrollButtonProps {
  itemId: string;
  itemType: EnrollmentItemType;
  isEnrolled: boolean;
  isLoggedIn: boolean;
  currentPath: string;
  className?: string;
  label?: string;
  accentColor?: string;
}

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

function useSafeRouter() {
  try {
    return useRouter();
  } catch {
    return null;
  }
}

function useSafeParams(): Record<string, string | string[] | undefined> | null {
  try {
    return useParams();
  } catch {
    return null;
  }
}

function resolveLocale(
  paramLocale: string | string[] | undefined,
  currentPath: string
): string {
  const candidate = Array.isArray(paramLocale) ? paramLocale[0] : paramLocale;
  if (
    candidate &&
    (routing.locales as readonly string[]).includes(candidate.toLowerCase())
  ) {
    return candidate.toLowerCase();
  }

  const match = currentPath.match(/^\/([a-zA-Z]{2})(?:\/|$)/);
  if (
    match &&
    (routing.locales as readonly string[]).includes(match[1].toLowerCase())
  ) {
    return match[1].toLowerCase();
  }

  return routing.defaultLocale;
}

export default function EnrollButton({
  itemId,
  itemType,
  isEnrolled,
  isLoggedIn,
  currentPath,
  className,
  label = "Inscribirme",
  accentColor,
}: EnrollButtonProps) {
  const router = useSafeRouter();
  const params = useSafeParams();
  const dialogTitleId = useId();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enrolledLocally, setEnrolledLocally] = useState(false);

  const locale = resolveLocale(params?.locale, currentPath);
  const loginRedirectUrl = `/${locale}/login?next=${currentPath}`;
  const enrolled = isEnrolled || enrolledLocally;

  const [feedback, submitEnrollAction, isPending] = useActionState<
    FeedbackState,
    FormData
  >(async (_prevState, formData) => {
    try {
      const { enrollUserAction } = await import(
        "@/features/enrollments/actions/enrollment.actions"
      );
      const result = await enrollUserAction(formData);

      if (result.success) {
        setEnrolledLocally(true);
        setIsModalOpen(false);
        router?.refresh?.();
        return {
          type: "success",
          message: result.message,
        };
      }

      if (result.error === "Ya estás inscrito") {
        setEnrolledLocally(true);
        setIsModalOpen(false);
      }

      return {
        type: "error",
        message: result.error,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Ocurrió un error al procesar tu inscripción.";

      if (message.includes("401")) {
        setIsModalOpen(false);
        router?.push(loginRedirectUrl);
        return null;
      }

      return {
        type: "error",
        message,
      };
    }
  }, null);

  useEffect(() => {
    if (!isModalOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        setIsModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, isPending]);

  if (enrolled) {
    return (
      <div className="inline-flex flex-col items-start gap-2">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className={clsx(
            "inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-slate-200 px-7 py-3.5 text-sm font-semibold text-slate-600 shadow-none cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
            className
          )}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Ya estás inscrito</span>
        </button>

        {feedback && (
          <p
            role="alert"
            aria-live="polite"
            className={clsx(
              "text-xs font-medium",
              feedback.type === "success"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {feedback.message}
          </p>
        )}
      </div>
    );
  }

  function handleTriggerClick() {
    if (!isLoggedIn) {
      router?.push(loginRedirectUrl);
      return;
    }

    setIsModalOpen(true);
  }

  const itemLabel = itemType === "COURSE" ? "curso" : "evento";

  const modalNode =
    isModalOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            onClick={() => {
              if (!isPending) setIsModalOpen(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2
                    id={dialogTitleId}
                    className="text-xl font-bold tracking-tight text-text-primary"
                  >
                    Confirmar inscripción
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    ¿Estás seguro que deseas inscribirte a este {itemLabel}?
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isPending}
                  aria-label="Cerrar ventana"
                  className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-background hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <form action={submitEnrollAction} className="space-y-4">
                <input type="hidden" name="itemId" value={itemId} />
                <input type="hidden" name="itemType" value={itemType} />
                <input type="hidden" name="currentPath" value={currentPath} />

                <div className="rounded-xl border border-border bg-background/70 p-3.5 text-xs leading-relaxed text-text-secondary">
                  Tu registro quedará asociado a tu cuenta activa y podrás ver
                  la confirmación de inmediato.
                </div>

                {feedback && feedback.type === "error" && (
                  <p
                    role="alert"
                    aria-live="polite"
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                  >
                    {feedback.message}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isPending}
                    className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isPending}
                    style={
                      accentColor
                        ? {
                            backgroundColor: accentColor,
                            borderColor: accentColor,
                          }
                        : undefined
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                  >
                    {isPending ? (
                      <>
                        <Loader2
                          className="h-4 w-4 animate-spin shrink-0"
                          aria-hidden="true"
                        />
                        <span>Inscribiendo...</span>
                      </>
                    ) : (
                      <span>Confirmar Inscripción</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleTriggerClick}
        disabled={isPending}
        style={
          accentColor
            ? { backgroundColor: accentColor, borderColor: accentColor }
            : undefined
        }
        className={clsx(
          "group inline-flex items-center justify-center gap-2 rounded-full border border-primary bg-primary px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:brightness-95 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer",
          className
        )}
      >
        <span>{label}</span>
        <ArrowRight
          className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </button>

      {modalNode}
    </div>
  );
}
