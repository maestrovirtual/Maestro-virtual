# MV-42: Optimización de rendimiento web, imágenes y Core Web Vitals

**Responsable:** Juan Pablo Arce Jauregui (Frontend)  
**Sprint:** 5  
**Épica:** Rendimiento, Optimización y Web Vitals  
**Story Points:** 5  

---

## 1. Resumen Ejecutivo

Implementación y estandarización integral de las optimizaciones de rendimiento web, gestión multimedia y Core Web Vitals para la plataforma de Maestro Virtual A.C. La tarea aborda de raíz la sobrecarga en el ancho de banda, los retrasos en el **LCP (Largest Contentful Paint)** y los cambios inesperados de diseño (**CLS - Cumulative Layout Shift**), reemplazando el uso de etiquetas HTML estándar por el componente de alto rendimiento `next/image`, configurando formatos modernos de compresión (AVIF y WebP), estableciendo directivas de carga prioritaria (*eager/priority*) para elementos críticos sobre el pliegue (*above-the-fold*) y garantizando la carga diferida (*lazy loading*) en secciones secundarias y el pie de página.

**Criterios de aceptación cumplidos:**
- [x] Configuración en `next.config.ts` de formatos modernos de compresión de última generación (`image/avif`, `image/webp`).
- [x] Configuración de dominios remotos autorizados (`remotePatterns`) para Supabase Storage y proveedores externos.
- [x] Erradicación completa del uso de etiquetas `<img>` HTML tradicionales en todo el directorio `src/`, sustituyéndolas por `<Image />` de Next.js.
- [x] Priorización estratégica con `priority={true}` en recursos visuales críticos para acelerar el LCP (Logo en `Navbar` y Banner principal en `CourseHero`).
- [x] Preservación de `loading="lazy"` por defecto en elementos fuera de la vista inicial (`Footer`, `AboutUs`, `TargetAudience`).
- [x] Display visual optimizado y adaptable (`object-contain p-2`, dimensiones responsivas y `sizes`) que previene recortes y distorsiones en afiches y portadas de cursos y eventos.
- [x] Resiliencia ante dominios remotos y previews locales mediante el uso selectivo de `unoptimized`.
- [x] Pruebas automatizadas de performance e integridad multimedia (`__tests__/image-optimization.test.tsx`) aprobadas al 100%.

---

## 2. Arquitectura y Cambios Técnicos

### 2.1. Configuración del Optimizador de Imágenes (`next.config.ts`)
Se enriqueció la configuración central de Next.js para maximizar la eficiencia en la entrega de activos estáticos y dinámicos:
- **Formatos de compresión (`formats`):** Se definió `['image/avif', 'image/webp']`. Next.js negocia automáticamente con el navegador cliente el formato más eficiente: AVIF ofrece reducciones de hasta un 50% frente a JPEG sin pérdida perceptible, con fallback inmediato a WebP.
- **Rango de calidades autorizadas (`qualities`):** Se agregaron los valores `[75, 90, 95, 100]` para silenciar advertencias de consola y permitir que imágenes de alta definición mantengan fidelidad visual según sea requerido.
- **Patrones remotos autorizados (`remotePatterns`):**
  - Protocolo HTTPS para el subdominio específico de producción en Supabase: `fqwgfgppvlqgddxvzixu.supabase.co/storage/v1/object/public/**`.
  - Comodines para buckets auxiliares: `*.supabase.co` y `**.supabase.co`.
  - Autorización de placeholders de desarrollo: `placeholder.com`.

### 2.2. Priorización de Carga Crítica (LCP) vs. Carga Diferida (Lazy Loading)
Se calibró cuidadosamente la propiedad `priority` según la posición geográfica del componente en el viewport:
1. **Above-the-Fold (Carga Inmediata y Prioritaria):**
   - **`src/components/layout/Navbar.tsx`:** El logotipo de Maestro Virtual se procesa con `priority={true}`. Esto instruye al navegador a emitir un `fetchpriority="high"` y evita que la barra de navegación parpadee o desplace elementos adyacentes al cargar la página.
   - **`src/features/courses/course-details/CourseHero.tsx`:** La portada o ícono principal del curso en la vista de detalle incorpora `priority={true}` para acelerar drásticamente el LCP al navegar a un curso específico.
2. **Below-the-Fold (Carga Perezosa / Lazy Loading):**
   - **`src/components/layout/Footer.tsx`:** El logotipo secundario del pie de página no incluye `priority`, reteniendo la directiva nativa `loading="lazy"`.
   - **Secciones intermedias (`AboutUs.tsx`, `TargetAudience.tsx`):** Mantienen la carga bajo demanda mediante Intersection Observer gestionado internamente por Next.js, liberando ancho de banda durante la carga inicial.

### 2.3. Erradicación Total de Etiquetas `<img>` Nativas
Se llevó a cabo una auditoría estricta en todo el código fuente del frontend (`src/`):
- **0 ocurrencias de `<img ...>`:** Todas las instancias fueron migradas a `next/image`.
- **Prevención de Layout Shifts (CLS):** Todas las imágenes cuentan con dimensiones fijas (`width` y `height`) o con el modificador `fill` contenido en un contenedor padre con posicionamiento `relative` y dimensiones predeterminadas (ej. `h-48`, `h-56`), garantizando que el navegador reserve el espacio geométrico antes de recibir el mapa de bits.

### 2.4. Despliegue Visual Óptimo y Resiliencia en Portadas
Para afiches, volantes publicitarios y portadas cargadas por los administradores en Cursos y Eventos:
- **Display sin recortes (`object-contain`):**
  - En tarjetas públicas ([`CourseCard.tsx`](file:///c:/Users/tproh/OneDrive/Documentos/My%20GitHub%20Projects/Maestro-virtual-muck-up/src/features/courses/components/CourseCard.tsx) y [`EventCard.tsx`](file:///c:/Users/tproh/OneDrive/Documentos/My%20GitHub%20Projects/Maestro-virtual-muck-up/src/features/events/EventCard.tsx)) y tarjetas del panel de control ([`AdminCourseCard.tsx`](file:///c:/Users/tproh/OneDrive/Documentos/My%20GitHub%20Projects/Maestro-virtual-muck-up/src/features/admin/components/AdminCourseCard.tsx) y [`AdminEventCard.tsx`](file:///c:/Users/tproh/OneDrive/Documentos/My%20GitHub%20Projects/Maestro-virtual-muck-up/src/features/admin/components/AdminEventCard.tsx)), se reemplazó `object-cover` por `object-contain p-2` con `flex items-center justify-center`. Esto asegura que toda la información gráfica, títulos y fechas del afiche sean perfectamente legibles sin ser guillotinados por el contenedor.
- **Eliminación de distorsiones en `CourseHero.tsx`:** Se retiró la clase `scale-180` (que magnificaba el contenido un 180% recortando más del 40% de la imagen) y se sustituyó por `object-contain drop-shadow-xl p-4`.
- **Atributo `sizes` responsivo:** Configuración granular:
  ```tsx
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  ```
  Permite al cliente descargar únicamente la resolución requerida según la densidad de píxeles y el ancho del dispositivo del usuario.
- **Bypass seguro (`unoptimized`):** Para URLs externas originadas en Supabase Storage o URLs blob creadas dinámicamente con `URL.createObjectURL()`, se aplicó condicionalmente:
  ```tsx
  unoptimized={imageSrc.startsWith("http")}
  ```
  evitando cuellos de botella en el servidor de desarrollo y previniendo bloqueos por configuraciones de hostings intermedios.

---

## 3. Decisiones de Diseño e Impacto en Core Web Vitals

| Métrica Web Vital | Problemática Previa | Solución Aplicada | Impacto Esperado |
|-------------------|---------------------|-------------------|------------------|
| **LCP** (*Largest Contentful Paint*) | Retraso en la descarga del logo en cabecera y banners de cursos debido a la cola de recursos sin prioridad. | `priority={true}` en `Navbar` y `CourseHero`; formatos AVIF/WebP en `next.config.ts`. | Reducción del tiempo de renderizado del elemento visual principal por debajo del umbral de **1.5s**. |
| **CLS** (*Cumulative Layout Shift*) | El uso esporádico de `<img>` provocaba saltos bruscos en el contenido al descargarse los recursos. | Adopción total de `<Image fill />` y contenedores con `aspect-ratio` / altura definida (`h-48`, `h-56`). | Estabilidad visual con puntuación de CLS tendiente a **0.00**. |
| **FCP / Ancho de Banda** (*First Contentful Paint*) | Entrega de imágenes JPEG pesadas sin adaptar al viewport del dispositivo móvil. | Uso de `next/image` con atributo `sizes` adaptativo y compresión automática moderna. | Ahorro de entre un 40% y 60% en peso de transferencia en redes móviles. |
| **UX & Legibilidad** | Afiches de cursos y eventos cortados en los bordes debido a `object-cover`. | Transición a `object-contain p-2` con fondos integrados y previsualizaciones sin compresión forzada. | Presentación limpia y completa de la información gráfica para alumnos y administradores. |

---

## 4. Métricas de Calidad y Verificación

- **Pruebas Automatizadas de Optimización (`__tests__/image-optimization.test.tsx`):**
  - [x] Verificación de configuración en `next.config.ts` (detección estricta de formatos AVIF y WebP).
  - [x] Escaneo estático en todo `src/` certificando la ausencia de etiquetas HTML `<img>`.
  - [x] Verificación de `priority={true}` en `Navbar` (ausencia de `loading="lazy"` y presencia de `fetchpriority="high"`).
  - [x] Verificación de lazy loading en `Footer` (preservación de `loading="lazy"` sin `fetchpriority`).
  - [x] Verificación de `priority={true}` en la imagen de `CourseHero`.
  - [x] Verificación de lazy loading en componentes secundarios (`AboutUs`, `TargetAudience`).
- **Verificación de Tipos (`npx tsc --noEmit`):** 0 errores de compilación TypeScript.
- **Linter de Código (`npm run lint`):** 0 errores y 0 advertencias en todo el proyecto.
- **Regresión Global (`npm test`):** 40 suites de prueba ejecutadas exitosamente (367 pruebas unitarias y de integración pasando al 100%).

