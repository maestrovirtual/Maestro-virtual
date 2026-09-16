'use client';

// Circle-reveal V3 para el botón "Contáctanos" (MV-27).
//
// V2 (múltiples círculos concéntricos) todavía se sentía template-y.
// V3 mantiene sólo el sonar pulse como feedback y sustituye la pila de
// círculos por UN panel único que gana su "premium feel" por lo que
// pasa DENTRO, no por la forma del reveal:
//   1. Sonar pulse (ripples finos en el punto de click) — feedback.
//   2. Panel único que escala desde el origen Y morfea de círculo a
//      rectángulo (border-radius 50% → 0%) para llenar las esquinas.
//   3. Auroras internas: dos gradientes radiales que hacen drift
//      lento — la sensación "viva" que un color plano no logra.
//   4. Haz de luz diagonal que barre UNA vez a mitad del grow —
//      el "beat cinematográfico" que hace que se sienta deliberado.
//   5. Viñeta oscura para profundidad.
//   6. Wordmark con glow (text-shadow) y entrada con blur + parallax.
//   7. Salida con blur + fade (se disipa, no parpadea).

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';

const EVENT = 'mv-contact-reveal';
const GROW_S = 2.05;
const FADE_S = 0.65;
// Navegamos a ~55% del grow: cuando el fade limpie el panel, la
// nueva ruta ya está pintada debajo (sin flash blanco).
// Con GROW_S=2.05, esto son ~1.13s — margen amplio para que el
// SSR del target termine antes del fade.
const NAV_AT_RATIO = 0.55;

type RevealDetail = { x: number; y: number; href: string };
type Phase = 'idle' | 'growing' | 'fading';

export default function ContactRevealOverlay() {
  const router = useRouter();
  const pathname = usePathname();

  const [phase, setPhase] = useState<Phase>('idle');
  const [origin, setOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [targetHref, setTargetHref] = useState<string | null>(null);
  // triggerId se incrementa por cada disparo del reveal. Se usa en
  // la `key` del motion.div para forzar a AnimatePresence a montar
  // un elemento fresco (initial->animate limpio). Sin esto, el 2do
  // disparo reutilizaba el mismo nodo y framer-motion interpolaba
  // desde el estado actual (opacity 0 del exit anterior) al nuevo
  // animate -> se veía como fade en vez de crecer del origen.
  const [triggerId, setTriggerId] = useState<number>(0);

  useEffect(() => {
    const onReveal = (e: Event) => {
      const detail = (e as CustomEvent<RevealDetail>).detail;
      if (!detail) return;
      setOrigin({ x: detail.x, y: detail.y });
      setTargetHref(detail.href);
      setTriggerId((id) => id + 1);
      setPhase('growing');
      window.setTimeout(
        () => router.push(detail.href as never),
        GROW_S * 1000 * NAV_AT_RATIO,
      );
    };

    window.addEventListener(EVENT, onReveal);
    return () => window.removeEventListener(EVENT, onReveal);
  }, [router]);

  useEffect(() => {
    if (phase !== 'growing' || !targetHref) return;
    let fadeTimer: number | undefined;
    let idleTimer: number | undefined;
    let fallbackTimer: number | undefined;

    const scheduleFade = () => {
      fadeTimer = window.setTimeout(() => setPhase('fading'), 0);
      idleTimer = window.setTimeout(() => {
        setPhase('idle');
        setTargetHref(null);
      }, FADE_S * 1000);
    };

    try {
      const target = new URL(targetHref, window.location.href).pathname;
      const stripLocale = (p: string) =>
        p.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';

      if (stripLocale(pathname) === stripLocale(target)) {
        // Ruta ya coincide -> disparar fade.
        scheduleFade();
      } else {
        // Fallback: si el pathname no cambia después de todo el grow
        // + un pequeño margen (ej. click en Contáctanos estando ya en
        // /contact, o navegación abortada), forzamos el fade para no
        // dejar el overlay atrapado.
        fallbackTimer = window.setTimeout(
          scheduleFade,
          (GROW_S + 0.3) * 1000,
        );
      }
    } catch {
      /* noop */
    }
    return () => {
      if (fadeTimer) window.clearTimeout(fadeTimer);
      if (idleTimer) window.clearTimeout(idleTimer);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
    };
  }, [pathname, phase, targetHref]);

  // Radio necesario para que el panel cubra el viewport completo
  // desde el origen del click.
  const coverRadius = (() => {
    if (typeof window === 'undefined') return 2000;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dx = Math.max(origin.x, w - origin.x);
    const dy = Math.max(origin.y, h - origin.y);
    return Math.ceil(Math.hypot(dx, dy)) + 80;
  })();

  const cinematicEase = [0.83, 0, 0.17, 1] as const;
  const softEase = [0.22, 1, 0.36, 1] as const;

  return (
    <AnimatePresence>
      {phase !== 'idle' && (
        <motion.div
          key={`contact-reveal-${triggerId}`}
          className="pointer-events-none fixed inset-0 z-[150] overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Sonar pulse #1 — feedback inmediato al click */}
          <motion.div
            className="absolute rounded-full border-2 border-white/80"
            style={{ left: origin.x, top: origin.y }}
            initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.9 }}
            animate={{ width: 260, height: 260, x: -130, y: -130, opacity: 0 }}
            transition={{ duration: 0.55, ease: softEase }}
          />

          {/* Sonar pulse #2 — eco secundario para estela */}
          <motion.div
            className="absolute rounded-full border border-white/45"
            style={{ left: origin.x, top: origin.y }}
            initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.7 }}
            animate={{ width: 420, height: 420, x: -210, y: -210, opacity: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease: softEase }}
          />

          {/* Panel principal: escala desde origen + morfea círculo→rect.
              overflow:hidden clipa todo el contenido interno al panel. */}
          <motion.div
            className="absolute"
            style={{
              left: origin.x - coverRadius,
              top: origin.y - coverRadius,
              width: coverRadius * 2,
              height: coverRadius * 2,
              overflow: 'hidden',
            }}
            initial={{
              scale: 0,
              borderRadius: '50%',
              opacity: 1,
              filter: 'blur(0px)',
            }}
            animate={{
              scale: 1,
              borderRadius: '0%',
              opacity: phase === 'fading' ? 0 : 1,
              filter: phase === 'fading' ? 'blur(18px)' : 'blur(0px)',
            }}
            transition={{
              scale: { duration: GROW_S, ease: cinematicEase },
              borderRadius: { duration: GROW_S * 0.85, ease: cinematicEase },
              opacity: { duration: FADE_S, ease: softEase },
              filter: { duration: FADE_S, ease: softEase },
            }}
          >
            {/* Base gradient — profundo con dirección */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg,
                  #0A1A3F 0%,
                  #1E3A8A 28%,
                  #2563EA 60%,
                  #3B82F6 100%)`,
              }}
            />

            {/* Aurora #1 — mancha clara arriba-izq. que drifts lento */}
            <motion.div
              className="absolute"
              style={{
                inset: '-15%',
                background:
                  'radial-gradient(ellipse 45% 55% at 30% 25%, rgba(147,197,253,0.75) 0%, rgba(147,197,253,0) 65%)',
                filter: 'blur(24px)',
              }}
              initial={{ x: '-6%', y: '-4%' }}
              animate={{ x: '6%', y: '4%' }}
              transition={{ duration: GROW_S + 0.4, ease: 'easeInOut' }}
            />

            {/* Aurora #2 — acento verde de marca abajo-der. */}
            <motion.div
              className="absolute"
              style={{
                inset: '-15%',
                background:
                  'radial-gradient(ellipse 40% 50% at 75% 80%, rgba(16,185,130,0.45) 0%, rgba(16,185,130,0) 60%)',
                filter: 'blur(28px)',
              }}
              initial={{ x: '5%', y: '4%' }}
              animate={{ x: '-5%', y: '-4%' }}
              transition={{ duration: GROW_S + 0.4, ease: 'easeInOut' }}
            />

            {/* Haz de luz diagonal — el "beat" cinematográfico.
                Barre UNA sola vez a mitad del grow. */}
            <motion.div
              className="absolute inset-y-0"
              style={{
                width: '35%',
                background:
                  'linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.28) 40%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.28) 60%, transparent 100%)',
                filter: 'blur(8px)',
                mixBlendMode: 'overlay',
                transform: 'skewX(-14deg)',
              }}
              initial={{ x: '-70%' }}
              animate={{ x: '280%' }}
              transition={{
                duration: 0.9,
                delay: GROW_S * 0.38,
                ease: cinematicEase,
              }}
            />

            {/* Viñeta suave para profundidad en los bordes */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at center, transparent 45%, rgba(3,7,25,0.4) 100%)',
              }}
            />
          </motion.div>

          {/* Wordmark — fijo al viewport, entra con blur + parallax */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
            animate={{
              opacity: phase === 'fading' ? 0 : 0.9,
              y: phase === 'fading' ? -14 : 0,
              filter: phase === 'fading' ? 'blur(8px)' : 'blur(0px)',
            }}
            transition={{
              duration: phase === 'fading' ? FADE_S * 0.9 : 0.7,
              delay: phase === 'fading' ? 0 : GROW_S * 0.55,
              ease: softEase,
            }}
          >
            <div className="flex flex-col items-center text-center">
              <p
                className="font-heading text-4xl font-bold uppercase tracking-[0.35em] text-white sm:text-5xl"
                style={{ textShadow: '0 2px 40px rgba(147,197,253,0.65)' }}
              >
                Maestro
              </p>
              <p
                className="mt-2 font-heading text-4xl font-bold uppercase tracking-[0.35em] text-white sm:text-5xl"
                style={{ textShadow: '0 2px 40px rgba(147,197,253,0.65)' }}
              >
                Virtual
              </p>
              <motion.div
                className="mt-4 h-[2px] rounded-full bg-gradient-to-r from-white/0 via-white/95 to-white/0"
                initial={{ width: 0 }}
                animate={{ width: phase === 'fading' ? 40 : 120 }}
                transition={{
                  duration: 0.6,
                  delay: phase === 'fading' ? 0 : GROW_S * 0.7,
                  ease: softEase,
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function triggerContactReveal(x: number, y: number, href: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<RevealDetail>('mv-contact-reveal', {
      detail: { x, y, href },
    }),
  );
}
