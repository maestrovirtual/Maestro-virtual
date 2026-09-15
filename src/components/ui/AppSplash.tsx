'use client';

// Splash de primera carga de la app (MV-27).
//
// Renderiza SIEMPRE desde SSR con la clase `app-splash-overlay`.
// Un script inline en el root layout agrega `splash-shown` al <html>
// ANTES del primer paint si ya se mostró en esta sesión -> CSS lo oculta.
// Resultado: cero flash de contenido antes del splash.
//
// Además escucha el evento 'mv-splash-replay' (disparado al clic en el logo
// del Navbar/Footer) para poder re-animarlo bajo demanda.

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const STORAGE_KEY = 'mv-splash-shown';
const REPLAY_EVENT = 'mv-splash-replay';
const VISIBLE_MS = 1500;

type SplashState = { id: number; visible: boolean };

export default function AppSplash() {
  // Estado combinado:
  //   - `id` es MONOTÓNICO (nunca decrece) y se usa como `key` del
  //     motion.div. Cada replay lo incrementa -> AnimatePresence
  //     siempre ve un elemento nuevo, initial->animate limpio.
  //   - `visible` controla si se renderiza. El auto-hide sólo lo
  //     toca a él, dejando `id` intacto para no colisionar con
  //     keys previamente usadas si el usuario clickea rápido.
  const [state, setState] = useState<SplashState>(() => {
    if (typeof window === 'undefined') return { id: 1, visible: true };
    const wasShown = !!sessionStorage.getItem(STORAGE_KEY);
    return { id: wasShown ? 0 : 1, visible: !wasShown };
  });

  // Cada session visible: marca sessionStorage y agenda auto-hide.
  // Deps en `id` (no `visible`) para que el timer arranque en cada
  // nuevo session (incluyendo replays), y no dispare de más al
  // limpiar `visible`.
  useEffect(() => {
    if (!state.visible) return;
    sessionStorage.setItem(STORAGE_KEY, '1');
    const timer = setTimeout(() => {
      setState((s) => ({ ...s, visible: false }));
    }, VISIBLE_MS);
    return () => clearTimeout(timer);
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

  return (
    <AnimatePresence>
      {state.visible && (
        <motion.div
          key={`app-splash-${state.id}`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="app-splash-overlay fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, #2563EA 0%, #1E40AF 40%, #10B982 100%)',
          }}
          aria-hidden
        >
          {/* Halo de luz sutil detrás del logo, para dar profundidad */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1.3, opacity: 0.35 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="absolute h-[500px] w-[500px] rounded-full bg-white/25 blur-3xl"
          />

          <div className="relative flex flex-col items-center px-6 text-center">
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
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 h-[3px] w-56 origin-center rounded-full bg-white/90"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-5 text-sm uppercase tracking-[0.35em] text-white/90"
            >
              Aprende · Conecta · Crece
            </motion.p>
          </div>
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
