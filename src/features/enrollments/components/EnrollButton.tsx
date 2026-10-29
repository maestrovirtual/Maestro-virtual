"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

import {
  enrollUserAction,
  type EnrollmentItemType,
} from "@/features/enrollments/actions/enrollment.actions";

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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [enrolled, setEnrolled] = useState<boolean>(isEnrolled);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  useEffect(() => {
    setEnrolled(isEnrolled);
  }, [isEnrolled]);

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

  function handleClick() {
    setFeedback(null);

    if (!isLoggedIn) {
      router.push(`/login?next=${currentPath}`);
      return;
    }

    startTransition(async () => {
      try {
        const result = await enrollUserAction(itemId, itemType, currentPath);

        if (result.success) {
          setEnrolled(true);
          setFeedback({
            type: "success",
            message: result.message,
          });
          router.refresh?.();
          return;
        }

        if (result.error === "Ya estás inscrito") {
          setEnrolled(true);
        }

        setFeedback({
          type: "error",
          message: result.error,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Ocurrió un error al procesar tu inscripción.";

        if (message.includes("401")) {
          router.push(`/login?next=${currentPath}`);
          return;
        }

        setFeedback({
          type: "error",
          message,
        });
      }
    });
  }

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleClick}
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
        {isPending ? (
          <>
            <Loader2
              className="h-4 w-4 animate-spin shrink-0"
              aria-hidden="true"
            />
            <span>Inscribiendo...</span>
          </>
        ) : (
          <>
            <span>{label}</span>
            <ArrowRight
              className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </>
        )}
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

