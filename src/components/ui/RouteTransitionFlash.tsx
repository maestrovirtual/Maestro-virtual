'use client';

// Flash breve al navegar entre páginas (MV-27).
//
// Overlay con velo azul-crema que aparece al clickear cualquier link interno
// y se disuelve al llegar la nueva ruta. Cubre el instante entre "click" y
// "aparece el skeleton (o el contenido nuevo)" para que se sienta como una
// transición cinematográfica, no un salto seco.
//
// Se coordina con las otras animaciones:
//   - Link "Contacto" (CTA azul) tiene su propio circle-reveal -> excluido.
//   - Logo del Navbar dispara replay del splash -> excluido (data-attr).

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const FADE_IN_S = 0.18;
const FADE_OUT_S = 0.35;
const MIN_VISIBLE_MS = 320;

export default function RouteTransitionFlash() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const shownAtRef = useRef<number>(0);
  const pendingHideRef = useRef<number | null>(null);

  // Listener global de clics en links internos.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;

      // Excluir: links con su propia animación coordinada.
      if (anchor.dataset.skipTransitionFlash === 'true') return;

      const href = anchor.getAttribute('href');
      if (!href) return;
      if (anchor.target === '_blank') return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname && url.search === window.location.search) return;
        // Excluir Contacto (usa el circle-reveal).
        if (url.pathname.endsWith('/contact')) return;
      } catch {
        return;
      }

      shownAtRef.current = Date.now();
      setVisible(true);
    };

    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  // Al llegar la nueva ruta, esconde el flash (respetando un mínimo visible).
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current === pathname) return;
    prevPathnameRef.current = pathname;

    if (!visible) return;

    const elapsed = Date.now() - shownAtRef.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);

    if (pendingHideRef.current) window.clearTimeout(pendingHideRef.current);
    pendingHideRef.current = window.setTimeout(() => {
      setVisible(false);
      pendingHideRef.current = null;
    }, wait);
  }, [pathname, visible]);

  useEffect(() => {
    return () => {
      if (pendingHideRef.current) window.clearTimeout(pendingHideRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="route-flash"
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: FADE_OUT_S } }}
          transition={{
            opacity: {
              duration: FADE_IN_S,
              ease: [0.16, 1, 0.3, 1],
            },
          }}
          className="pointer-events-none fixed inset-0 z-[90] backdrop-blur-[2px]"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, rgba(37, 99, 234, 0.22) 0%, rgba(248, 249, 251, 0.85) 65%, rgba(248, 249, 251, 0.95) 100%)',
          }}
        />
      )}
    </AnimatePresence>
  );
}
