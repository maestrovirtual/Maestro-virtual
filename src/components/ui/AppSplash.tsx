'use client';

// Splash de primera carga de la app (MV-27).
//
// Renderiza SIEMPRE desde SSR con la clase `app-splash-overlay`.
// Un script inline en el root layout agrega `splash-shown` al <html>
// ANTES del primer paint si ya se mostró en esta sesión -> CSS lo oculta.
// Resultado: cero flash de contenido antes del splash.
//
// Ya no se autooculta: se queda con el título hasta que la persona hace
// clic en "Click to continue", momento en el que se dispara una
// animación de difusión (un círculo que crece desde el punto del clic)
// antes de revelar el sitio.
//
// Además escucha el evento 'mv-splash-replay' (disparado al clic en el logo
// del Navbar/Footer) para poder re-animarlo bajo demanda.

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const STORAGE_KEY = 'mv-splash-shown';
const REPLAY_EVENT = 'mv-splash-replay';
const CTA_DELAY_MS = 1400;
const AUTO_CLOSE_MS = 6000;

type SplashState = { id: number; visible: boolean };
type Ripple = { x: number; y: number; size: number };

export default function AppSplash() {
  // Estado combinado:
  //   - `id` es MONOTÓNICO (nunca decrece) y se usa como `key` del
  //     motion.div. Cada replay lo incrementa -> AnimatePresence
  //     siempre ve un elemento nuevo, initial->animate limpio.
  //   - `visible` controla si se renderiza. Solo pasa a false cuando la
  //     animación de difusión termina (click en "Click to continue").
  const [state, setState] = useState<SplashState>({ id: 1, visible: true });
  const [showCta, setShowCta] = useState(false);
  const [ripple, setRipple] = useState<Ripple | null>(null);

  // Cada sesión visible: marca sessionStorage y agenda cuándo aparece
  // "Click to continue". Deps en `id` para que vuelva a correr en cada
  // replay.
  useEffect(() => {
    // Si ya se mostró antes en esta sesión, lo desmontamos inmediatamente.
    // El script en el head evita que haya un parpadeo visual.
    if (state.id === 1 && sessionStorage.getItem(STORAGE_KEY)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ id: 0, visible: false });
      return;
    }

    if (!state.visible) return;
    sessionStorage.setItem(STORAGE_KEY, '1');
    setShowCta(false);
    setRipple(null);
    const timer = setTimeout(() => setShowCta(true), CTA_DELAY_MS);
    const autoCloseTimer = setTimeout(() => {
      setRipple({ x: window.innerWidth / 2, y: window.innerHeight / 2, size: Math.hypot(window.innerWidth, window.innerHeight) * 2.2 });
    }, AUTO_CLOSE_MS);
    return () => {
      clearTimeout(timer);
      clearTimeout(autoCloseTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.id]);

  // Replay via evento (logo navbar / footer): bump `id` + visible=true.
  useEffect(() => {
    const handleReplay = () => {
      // El script inline del root layout pudo haber agregado esta
      // clase al primer pageload; la quitamos para que el CSS no
      // oculte el replay via `display:none`.
      document.documentElement.classList.remove('splash-shown');
      setState((s) => ({ id: s.id + 1, visible: true }));
    };
    window.addEventListener(REPLAY_EVENT, handleReplay);
    return () => window.removeEventListener(REPLAY_EVENT, handleReplay);
  }, []);

  function continueIntoSite(event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) {
    if (ripple) return;
    const x = event.clientX;
    const y = event.clientY;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const farthestCorner = Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y));
    setRipple({ x, y, size: farthestCorner * 2.2 });
  }

  return (
    <AnimatePresence>
      {state.visible && (
        <motion.div
          key={`app-splash-${state.id}`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="app-splash-overlay fixed inset-0 z-[100] flex items-center justify-center overflow-hidden cursor-pointer"
          style={{
            background:
              'linear-gradient(135deg, #2563EA 0%, #1E40AF 40%, #10B982 100%)',
          }}
          onClick={(e) => showCta && continueIntoSite(e)}
        >
          {/* Halo de luz sutil detrás del logo, para dar profundidad */}
          <motion.div
            aria-hidden
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1.3, opacity: 0.35 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="absolute h-[500px] w-[500px] rounded-full bg-white/25 blur-3xl"
          />

          <motion.div
            animate={ripple ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="relative flex flex-col items-center px-6 text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-heading text-5xl font-bold uppercase tracking-[0.15em] text-white sm:text-6xl lg:text-7xl"
            >
              Maestro
              <span className="mt-1 block">Virtual</span>
            </motion.h1>

            <motion.div
              aria-hidden
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 h-[3px] w-56 origin-center rounded-full bg-white/90"
            />

            <motion.p
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-5 text-sm uppercase tracking-[0.35em] text-white/90"
            >
              Aprende · Conecta · Crece
            </motion.p>

            <AnimatePresence>
              {showCta && !ripple && (
                <motion.button
                  type="button"
                  onClick={continueIntoSite}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.5 }}
                  className="mt-12 rounded-full border border-white/40 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.3em] text-white/90 outline-none transition hover:border-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <motion.span
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    Click to continue
                  </motion.span>
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {ripple && (
            <motion.div
              aria-hidden
              initial={{ width: 0, height: 0, opacity: 0.95 }}
              animate={{ width: ripple.size, height: ripple.size, opacity: 1 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              onAnimationComplete={() => setState((s) => ({ ...s, visible: false }))}
              className="pointer-events-none absolute rounded-full"
              style={{
                left: ripple.x,
                top: ripple.y,
                marginLeft: -ripple.size / 2,
                marginTop: -ripple.size / 2,
                background:
                  'linear-gradient(135deg, #10B982 0%, #2563EA 60%, #1E40AF 100%)',
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Helper exportado para disparar el replay desde otros componentes (ej. Navbar logo).
export function replayAppSplash() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(REPLAY_EVENT));
}
