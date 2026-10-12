"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Menu, User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import clsx from "clsx";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { replayAppSplash } from "@/components/ui/AppSplash";
import { triggerContactReveal } from "@/components/ui/ContactRevealOverlay";

// "Contacto" se movió al CTA principal (botón azul con circle-reveal).
// Preparando también para restringir "Cursos" a usuarios autenticados.
const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Cursos", href: "/courses" },
  { label: "Eventos", href: "/events" },
];

export default function Navbar() {

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
                scrolled
                  ? "text-text-primary"
                  : "text-text-secondary"
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

          {/* Iniciar sesión — pastilla ghost que espeja el lenguaje
              visual del círculo de perfil (misma altura, mismo glass).
              Aún no navega: sólo tooltip "Próximamente". */}
          <button
            type="button"
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

            {/* Tooltip Próximamente */}

            <span
              className="
              pointer-events-none

              absolute
              top-[calc(100%+12px)]
              left-1/2

              -translate-x-1/2
              translate-y-1

              whitespace-nowrap

              rounded-full

              bg-text-primary

              px-3
              py-1.5

              text-[11px]
              font-medium
              text-white

              opacity-0

              shadow-xl

              transition-all
              duration-300

              group-hover:translate-y-0
              group-hover:opacity-100
              "
            >
              Próximamente
            </span>
          </button>

          {/* Perfil (Preparado para autenticación) */}

          <button
            className={clsx(
              `
              group

              relative

              hidden
              md:flex

              h-10
              w-10

              items-center
              justify-center

              rounded-full

              border

              backdrop-blur-xl

              transition-all
              duration-300

              hover:-translate-y-0.5
              hover:scale-105
              `,
              scrolled
                ? `
                  bg-white/10
                  border-white/10
                  hover:bg-white/20
                `
                : `
                  bg-white/45
                  border-white/35
                  hover:bg-white/70
                `
            )}
          >
           

            {/* Glow */}

            <span
              className="
              absolute
              inset-0

              rounded-full

              bg-gradient-to-br
              from-primary/10
              to-brand-red/10

              opacity-0

              transition-opacity
              duration-300

              group-hover:opacity-100
              "
            />

            <User
              className="
              relative

              h-5
              w-5

              text-text-primary

              transition-transform
              duration-300

              group-hover:scale-110
              "
            />

            {/* Tooltip */}

            <span
              className="
              pointer-events-none

              absolute
              top-[calc(100%+12px)]
              left-1/2

              -translate-x-1/2
              translate-y-1

              whitespace-nowrap

              rounded-full

              bg-text-primary

              px-3
              py-1.5

              text-[11px]
              font-medium
              text-white

              opacity-0

              shadow-xl

              transition-all
              duration-300

              group-hover:translate-y-0
              group-hover:opacity-100
              "
            >
              Próximamente
            </span>
          </button>

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