import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
(global as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder = TextDecoder;

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CourseHero from '@/features/courses/course-details/CourseHero';
import fs from 'fs';
import path from 'path';

// Mock server actions
jest.mock('@/features/account/actions/account.actions', () => ({
  logoutAction: jest.fn(),
}));

// Mock i18n navigation and routing
jest.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'es',
}));

// Mock routing
jest.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
  },
  getPathname: () => '/',
}));

// Mock navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn() }),
}));

describe('Optimizaciones de Imagenes y Web Performance (MV-42)', () => {
  it('next.config.ts incluye formats: [image/avif, image/webp] en el objeto images', () => {
    const configPath = path.resolve(process.cwd(), 'next.config.ts');
    expect(fs.existsSync(configPath)).toBe(true);
    const content = fs.readFileSync(configPath, 'utf8');
    expect(content).toMatch(/formats:\s*\[\s*['"]image\/avif['"]\s*,\s*['"]image\/webp['"]\s*\]/);
  });

  it('no existen etiquetas HTML <img> directas en el frontend (src/)', () => {
    function scanDir(dir: string): string[] {
      let files: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files = files.concat(scanDir(fullPath));
        } else if (/\.(tsx|jsx|ts|js|html)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
      return files;
    }

    const files = scanDir(path.resolve(process.cwd(), 'src'));
    const filesWithRawImg: string[] = [];

    for (const file of files) {
      const code = fs.readFileSync(file, 'utf8');
      if (/<img\b[^>]*>/i.test(code)) {
        filesWithRawImg.push(file);
      }
    }

    expect(filesWithRawImg).toEqual([]);
  });

  it('Navbar renderiza el logo con priority={true} para acelerar LCP', () => {
    const { container } = render(<Navbar />);
    const logoImg = container.querySelector('header img');
    expect(logoImg).not.toBeNull();
    // En next/image, priority añade fetchPriority="high" o loading="eager" y elimina loading="lazy"
    expect(
      logoImg?.getAttribute('fetchpriority') === 'high' ||
      logoImg?.getAttribute('loading') === 'eager' ||
      logoImg?.getAttribute('data-nimg') !== undefined
    ).toBe(true);
    expect(logoImg?.getAttribute('loading')).not.toBe('lazy');
  });

  it('Footer renderiza el logo sin priority manteniendo lazy loading (below-the-fold)', () => {
    const { container } = render(<Footer />);
    const footerImg = container.querySelector('footer img');
    expect(footerImg).not.toBeNull();
    // Sin priority, next/image aplica loading="lazy" por defecto
    expect(footerImg?.getAttribute('loading')).toBe('lazy');
    expect(footerImg?.getAttribute('fetchpriority')).toBeNull();
  });

  it('CourseHero aplica priority={true} a la imagen principal (hero banner)', () => {
    const mockCourse = {
      id: 'course-1',
      slug: 'intro-computacion',
      title: 'Introducción a la Computación',
      shortDescription: 'Aprende lo básico de computación',
      description: 'Descripción detallada del curso',
      duration: '4 semanas',
      modality: 'Presencial',
      type: 'Curso' as const,
      stage: 1 as const,
      categories: ['Básico'],
      skills: ['PC'],
      image: '/images/courses/intro.jpg',
      color: '#1E3A8A',
      backgroundPattern: 'grid' as const,
      featured: true,
      clickable: true,
      isActive: true,
      participants: '15 cupos',
      targetAudience: 'Adultos mayores',
      objective: 'Aprender a usar la PC',
      requirements: 'Ninguno',
      heroSubtitle: 'Subtítulo del hero',
      benefits: [],
      program: [],
      instructors: [],
      faqs: [],
      testimonials: [],
      ctaText: 'Inscribirme',
      ctaLink: '#',
    };

    const { container } = render(<CourseHero course={mockCourse} />);
    const heroImg = container.querySelector('img');
    expect(heroImg).not.toBeNull();
    // En next/image con priority={true}, se omite loading="lazy" para permitir carga inmediata
    expect(heroImg?.getAttribute('loading')).toBeNull();
  });

  it('secciones secundarias (AboutUs y TargetAudience) mantienen lazy loading sin priority', () => {
    const aboutUsContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/features/home/AboutUs.tsx'),
      'utf8'
    );
    expect(aboutUsContent).not.toMatch(/\bpriority\b/);

    const targetAudienceContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/features/home/TargetAudience.tsx'),
      'utf8'
    );
    expect(targetAudienceContent).not.toMatch(/\bpriority\b/);
  });
});
