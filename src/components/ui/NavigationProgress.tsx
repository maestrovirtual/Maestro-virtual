'use client';

// Mini animación entre páginas (MV-27).
// Barra top con gradiente azul-verde de marca que:
//   1. Aparece cuando el usuario clickea un link interno.
//   2. Avanza progresivamente hasta ~85% mientras Next carga la nueva ruta.
//   3. Completa al 100% cuando el nuevo pathname se monta, luego se oculta.
//
// Se implementa con event delegation en <document> — cero refactor de <Link>.

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const timersRef = useRef<{ tick?: number; hide?: number }>({});

  // Limpia timers en curso.
  const clearTimers = () => {
    if (timersRef.current.tick) window.clearInterval(timersRef.current.tick);
    if (timersRef.current.hide) window.clearTimeout(timersRef.current.hide);
    timersRef.current = {};
  };

  // Dispara la barra: reset a 0, visible, avanza asintóticamente a 85%.
  const start = () => {
    clearTimers();
    setVisible(true);
    setProgress(8);

    // Avanza en pasos, tendiendo a 85% (nunca lo alcanza) para simular "casi ahí".
    timersRef.current.tick = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 85) return p;
        const delta = (85 - p) * 0.15;
        return p + Math.max(0.5, delta);
      });
    }, 180);
  };

  // Finaliza: 100% y luego oculta.
  const finish = () => {
    clearTimers();
    setProgress(100);
    timersRef.current.hide = window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 350);
  };

  // Listener global: detecta clics en links internos.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // Respeta modificadores (nueva pestaña, guardar como, etc.)
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Solo interno: mismo origen, no protocolo mailto/tel, no ancla pura, no target=_blank.
      if (anchor.target === '_blank') return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        // Si es la misma ruta (mismo path + search), no dispara.
        if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      } catch {
        return;
      }

      start();
    };

    document.addEventListener('click', onClick, { capture: true });
    return () => {
      document.removeEventListener('click', onClick, { capture: true });
      clearTimers();
    };
  }, []);

  // Cuando el pathname efectivamente cambia, completamos la barra.
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      finish();
    }
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[2px]"
    >
      <div
        className="h-full origin-left transition-[width] duration-200 ease-out"
        style={{
          width: `${progress}%`,
          background:
            'linear-gradient(90deg, #2563EA 0%, #10B982 100%)',
          boxShadow: '0 0 10px rgba(37, 99, 234, 0.6)',
        }}
      />
    </div>
  );
}
