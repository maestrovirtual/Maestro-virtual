import { Link } from "@/i18n/navigation";
import {
  ArrowUpRight,
  Mail,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa6";

import Container from "@/components/ui/Container";

const exploreLinks = [
  { label: "Inicio", href: "/" },
  { label: "Cursos", href: "/courses" },
  { label: "Eventos", href: "/events" },
];

const resourceLinks = [
  { label: "Preguntas frecuentes", href: "#faq" },
  {
    label: "Ruta de aprendizaje",
    href: "#",
    upcoming: true,
  },
  { label: "Ayuda", href: "#ayuda" },
];

const contactLinks = [
  { label: "Contacto", href: "/contact" },
];

const socialLinks = [
  {
    icon: FaFacebookF,
    href: "#",
  },
  {
    icon: FaInstagram,
    href: "#",
  },
  {
    icon: FaLinkedinIn,
    href: "#",
  },
  {
    icon: FaYoutube,
    href: "#",
  },
];

export default function Footer() {
  return (
    <footer
      className="
      relative
      overflow-hidden

      border-t
      border-white/20

      bg-gradient-to-b
      from-white
      via-background
      to-slate-100
      "
    >
      {/* Top Gradient */}

      <div
        className="
        absolute
        inset-x-0
        top-0

        h-[3px]

        bg-gradient-to-r
        from-primary
        via-brand-red
        via-brand-yellow
        to-brand-green
        "
      />

      {/* Glow */}

      <div
        className="
        absolute
        left-1/2
        top-0

        h-[380px]
        w-[380px]

        -translate-x-1/2

        rounded-full

        bg-primary/10

        blur-[140px]
        "
      />

      <Container
        size="xl"
        className="relative py-20"
      >
        <div
          className="
          grid
          gap-14

          lg:grid-cols-[1.7fr_1fr_1fr_1fr]
          "
        >
          {/* Brand */}

          <div className="space-y-3">
            <Link
            href="/"
            className="
            inline-flex
            items-center
            "
          >
            <Image
              src="/images/logo/maestrovirtual.webp"
              alt="Maestro Virtual"
              width={280}
              height={60}
              priority
              className="
              object-contain
              transition-transform
              duration-300
              hover:scale-105
              "
            />
          </Link>

            <p
              className="
              max-w-md

              leading-8

              text-text-secondary
              "
            >
              Plataforma educativa diseñada para impulsar habilidades
              digitales mediante cursos, eventos y experiencias de
              aprendizaje modernas.
            </p>

            <div
              className="
              flex
              flex-wrap
              gap-8
              "
            >
              <div>
                <h3 className="text-3xl font-bold text-primary">
                  20+
                </h3>

                <p className="text-sm text-text-secondary">
                  Cursos
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-primary">
                  3
                </h3>

                <p className="text-sm text-text-secondary">
                  Etapas
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-primary">
                  100%
                </h3>

                <p className="text-sm text-text-secondary">
                  Digital
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon }, index) => (
                <button
                  key={index}
                  className="
                  group

                  flex
                  h-11
                  w-11

                  items-center
                  justify-center

                  rounded-full

                  border
                  border-white/40

                  bg-white/70

                  shadow-md

                  backdrop-blur-xl

                  transition-all
                  duration-300

                  hover:-translate-y-1
                  hover:border-primary
                  hover:bg-primary
                  "
                >
                  <Icon
                    className="
                    h-4
                    w-4

                    transition-colors

                    group-hover:text-white
                    "
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Explorar */}

          <div>
            <h3
              className="
              mb-6

              text-sm
              font-semibold

              uppercase

              tracking-[0.22em]

              text-text-primary
              "
            >
              Explorar
            </h3>

            <ul className="space-y-4">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="
                    group

                    inline-flex
                    items-center
                    gap-2

                    text-text-secondary

                    transition-all
                    duration-300

                    hover:text-primary
                    "
                  >
                    {link.label}

                    <ArrowUpRight
                      className="
                      h-4
                      w-4

                      opacity-0

                      transition-all

                      group-hover:-translate-y-1
                      group-hover:translate-x-1
                      group-hover:opacity-100
                      "
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
                    {/* Recursos */}

          <div>
            <h3
              className="
              mb-6

              text-sm
              font-semibold

              uppercase

              tracking-[0.22em]

              text-text-primary
              "
            >
              Recursos
            </h3>

            <ul className="space-y-4">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="
                    group

                    inline-flex
                    items-center
                    gap-2

                    text-text-secondary

                    transition-all
                    duration-300

                    hover:text-primary
                    "
                  >
                    <ChevronRight
                      className="
                      h-4
                      w-4

                      transition-transform
                      duration-300

                      group-hover:translate-x-1
                      "
                    />

                    {link.label}

                    {link.upcoming && (
                      <span
                        className="
                        rounded-full

                        bg-primary/10

                        px-2.5
                        py-1

                        text-[10px]
                        font-semibold

                        uppercase

                        tracking-wider

                        text-primary
                        "
                      >
                        Próximamente
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}

          <div>
            <h3
              className="
              mb-6

              text-sm
              font-semibold

              uppercase

              tracking-[0.22em]

              text-text-primary
              "
            >
              Contacto
            </h3>

            <ul className="space-y-4">
              {contactLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="
                    group

                    inline-flex
                    items-center
                    gap-3

                    text-text-secondary

                    transition-all
                    duration-300

                    hover:text-primary
                    "
                  >
                    <Mail
                      className="
                      h-4
                      w-4

                      transition-transform
                      duration-300

                      group-hover:scale-110
                      "
                    />

                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div
              className="
              mt-8

              rounded-3xl

              border
              border-white/50

              bg-white/60

              p-5

              backdrop-blur-xl

              shadow-lg
              "
            >
              <p
                className="
                text-sm
                font-semibold

                text-text-primary
                "
              >
                ¿Listo para comenzar?
              </p>

              <p
                className="
                mt-2

                text-sm

                leading-6

                text-text-secondary
                "
              >
                Explora nuestros cursos y comienza a desarrollar nuevas
                habilidades digitales.
              </p>

              <Link
                href="/courses"
                className="
                mt-5

                inline-flex
                items-center
                gap-2

                font-medium

                text-primary

                transition-all

                hover:gap-3
                "
              >
                Explorar cursos

                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}

        <div
          className="
          mt-16

          border-t
          border-border/70

          pt-8
          "
        >
          <div
            className="
            flex
            flex-col

            gap-5

            md:flex-row
            md:items-center
            md:justify-between
            "
          >
            <div>
              <p
                className="
                font-medium

                text-text-primary
                "
              >
                © 2026 Maestro Virtual.
              </p>

              <p
                className="
                mt-1

                text-sm

                text-text-secondary
                "
              >
                Impulsando la próxima generación de habilidades digitales.
              </p>
            </div>

            <div
              className="
              flex
              flex-wrap
              items-center
              gap-6

              text-sm
              text-text-secondary
              "
            >
              <Link
                href="#"
                className="transition-colors hover:text-primary"
              >
                Privacidad
              </Link>

              <Link
                href="#"
                className="transition-colors hover:text-primary"
              >
                Términos
              </Link>

              <Link
                href="#"
                className="transition-colors hover:text-primary"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}