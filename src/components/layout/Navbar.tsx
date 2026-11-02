"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
} from "lucide-react";
import NextLink from "next/link";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import clsx from "clsx";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { replayAppSplash } from "@/components/ui/AppSplash";
import { triggerContactReveal } from "@/components/ui/ContactRevealOverlay";
import { logoutAction } from "@/features/account/actions/account.actions";
import type { CurrentUser } from "@/lib/auth/user";

// "Contacto" se movió al CTA principal (botón azul con circle-reveal).
// Preparando también para restringir "Cursos" a usuarios autenticados.
const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Cursos", href: "/courses" },
  { label: "Eventos", href: "/events" },
];

export type NavbarProps = {
  session?: CurrentUser | null;
  userName?: string | null;
};

function useSafeParams(): Record<string, string | string[] | undefined> | null {
  try {
    return useParams();
  } catch {
    return null;
  }
}

function resolveLocale(paramLocale: string | string[] | undefined): string {
  const candidate = Array.isArray(paramLocale) ? paramLocale[0] : paramLocale;
  if (
    candidate &&
    (routing.locales as readonly string[]).includes(candidate.toLowerCase())
  ) {
    return candidate.toLowerCase();
  }
  return routing.defaultLocale;
}

// session / userName: datos del usuario con sesion iniciada, o null (MV-36 / MV-39).
export default function Navbar({
  session = null,
  userName = null,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const params = useSafeParams();
  const locale = resolveLocale(params?.locale);

  const activeUser =
    session ??
    (userName
      ? {
          id: "",
          name: userName,
          email: "",
        }
      : null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <header
      className="
      fixed
      top-0
      left-0
      right-0
      z-50

      pt-2
      px-4
      lg:px-6

      pointer-events-none
      "
    >
      <Container
        size="xl"
        className={clsx(
          `
          pointer-events-auto

          relative

          flex
          items-center
          justify-between

          rounded-[24px]

          border

          transition-all
          duration-500
          ease-out
          `,

          scrolled
            ? `
              h-[58px]

              bg-primary/10

              border-white/10

              backdrop-blur-3xl

              shadow-[0_18px_45px_rgba(15,23,42,.12)]
            `
            : `
              h-[73px]

              bg-white/28

              border-white/25

              backdrop-blur-2xl

              shadow-[0_10px_28px_rgba(15,23,42,.05)]
            `
        )}
      >
        {/* Logo */}

        <Link
          href="/"
          onClick={() => replayAppSplash()}
          data-skip-transition-flash="true"
          className="
          group
          flex
          items-center
          "
        >
          <Image
            src="/images/logo/maestrovirtual.webp"
            alt="Maestro Virtual"
            width={144}
            height={44}
            priority
            style={{ width: "144px", height: "auto" }}
            className="
            object-contain
            transition-transform
            duration-300
            group-hover:scale-105
            "
          />
        </Link>

        {/* Links — posicionamiento absoluto para quedar centrados
            en el viewport (no en el espacio sobrante entre logo
            y botones). */}

        <nav
          className="
          pointer-events-auto

          absolute
          left-1/2
          top-1/2

          -translate-x-1/2
          -translate-y-1/2

          hidden
          md:flex
          items-center
          gap-9
          "
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={clsx(
                `
                group
                relative

                text-[15px]
                font-medium

                transition-all
                duration-300

                hover:text-primary
                `,
                scrolled ? "text-text-primary" : "text-text-secondary"
              )}
            >
              {link.label}

              <span
                className="
                absolute
                -bottom-2
                left-1/2

                h-[2px]
                w-0

                -translate-x-1/2

                rounded-full
                bg-primary

                transition-all
                duration-300

                group-hover:w-full
                "
              />
            </Link>
          ))}
        </nav>

        {/* Right */}

        <div className="flex items-center gap-3">
          {activeUser ? (
            /* Menú Desplegable de Perfil (MV-39) */
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Menú de perfil"
                className={clsx(
                  `
                  group
                  relative
                  inline-flex
                  items-center
                  gap-2.5
                  h-10
                  pl-1.5
                  pr-2.5
                  md:pr-3.5
                  rounded-full
                  border
                  text-[14px]
                  font-medium
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  cursor-pointer
                  hover:-translate-y-0.5
                  hover:shadow-md
                  `,
                  scrolled
                    ? `
                      bg-white/10
                      border-white/15
                      text-text-primary
                      hover:bg-white/20
                      hover:border-primary/30
                    `
                    : `
                      bg-white/45
                      border-white/35
                      text-text-primary
                      hover:bg-white/70
                      hover:border-primary/40
                    `
                )}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary transition-transform duration-300 group-hover:scale-105">
                  <User className="h-4 w-4" aria-hidden="true" />
                </span>

                <span className="hidden max-w-36 truncate md:inline">
                  Hola, {activeUser.name.split(" ")[0]}
                </span>

                <ChevronDown
                  className={clsx(
                    "h-4 w-4 text-text-secondary transition-transform duration-200",
                    menuOpen && "rotate-180 text-primary"
                  )}
                  aria-hidden="true"
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  aria-label="Opciones de cuenta"
                  className="absolute right-0 top-[calc(100%+10px)] z-50 w-60 overflow-hidden rounded-2xl border border-border bg-surface/95 p-2 shadow-xl backdrop-blur-2xl"
                >
                  <div className="border-b border-border/80 px-3 py-2.5 mb-1">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {activeUser.name}
                    </p>
                    {activeUser.email && (
                      <p className="truncate text-xs text-text-secondary">
                        {activeUser.email}
                      </p>
                    )}
                  </div>

                  <NextLink
                    href={`/${locale}/dashboard`}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    <LayoutDashboard
                      className="h-4 w-4 text-primary shrink-0"
                      aria-hidden="true"
                    />
                    <span>Mi Dashboard</span>
                  </NextLink>

                  <form action={logoutAction} className="mt-0.5 w-full">
                    <input type="hidden" name="locale" value={locale} />
                    <button
                      type="submit"
                      role="menuitem"
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                      <span>Cerrar Sesión</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            /* Iniciar sesión — pastilla ghost para visitantes sin sesión (MV-36). */
            <Link
              href="/login"
              className={clsx(
                `
                group

                relative

                hidden
                md:inline-flex

                items-center

                h-10
                px-4

                rounded-full

                border

                text-[14px]
                font-medium

                backdrop-blur-xl

                transition-all
                duration-300

                hover:-translate-y-0.5
                hover:shadow-md
                `,
                scrolled
                  ? `
                    bg-white/10
                    border-white/15
                    text-text-primary
                    hover:bg-white/20
                    hover:border-primary/30
                  `
                  : `
                    bg-white/40
                    border-white/35
                    text-text-primary
                    hover:bg-white/70
                    hover:border-primary/40
                  `
              )}
            >
              Iniciar sesión
            </Link>
          )}

          {/* CTA principal: Contacto con circle-reveal.
              (Antes "Explorar cursos" — se movió porque próximamente el
              catálogo de cursos requerirá login.) */}
          <Link
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              triggerContactReveal(e.clientX, e.clientY, "/contact");
            }}
          >
            <Button
              variant="primary"
              size="sm"
              className={clsx(
                `
                bg-primary
                group

                hidden
                md:inline-flex

                rounded-full


                shadow-lg

                transition-all
                duration-300

                hover:-translate-y-0.5
                hover:shadow-xl
                `,
                scrolled ? "px-4" : "px-5"
              )}
            >
              Contáctanos

              <ArrowRight
                className="
                h-4
                w-4

                transition-transform
                duration-300

                group-hover:translate-x-1
                "
              />
            </Button>
          </Link>

          <button
            className="
            inline-flex

            h-10
            w-10

            items-center
            justify-center

            rounded-full


            border
            border-white/50

            bg-white/50

            backdrop-blur-xl

            transition-all
            duration-300

            hover:scale-105
            hover:bg-white/70

            md:hidden
            "
          >
            <Menu className="h-5 w-5 text-text-primary" />
          </button>
        </div>
      </Container>
    </header>
  );
}
