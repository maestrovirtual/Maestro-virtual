# MV-39: Dashboard de usuario y Menú de perfil

**Responsable:** Juan Pablo Arce Jauregui (Frontend)
**Sprint:** 4
**Épica:** Inscripción a cursos y eventos
**Story Points:** 5

---

## 1. Resumen Ejecutivo
Implementación completa de la vista privada para usuarios finales, proporcionando un espacio centralizado ("Mi Panel de Aprendizaje") donde pueden consultar sus inscripciones activas a cursos y eventos. Adicionalmente, se refactorizó la navegación principal (Navbar) para integrar un menú de perfil funcional, reemplazando los componentes estáticos y conectando directamente el flujo de cierre de sesión.

**Criterios de aceptación cumplidos:**
- [x] El usuario logueado cuenta con un menú de perfil accesible.
- [x] Existe una vista privada (`/dashboard`) protegida contra usuarios no autenticados.
- [x] El usuario ve una lista clara de sus inscripciones activas (Cursos y Eventos).
- [x] Se muestran estados vacíos amigables cuando no hay inscripciones.

---

## 2. Arquitectura y Cambios Técnicos

### 2.1. Refactorización del Navbar y Autenticación
- **Server Action de Logout (`src/features/auth/actions/account.actions.ts`):** Creación de `logoutAction` encargada de invalidar de forma segura la cookie de sesión (`mv_user_session`), revalidar la caché del layout y ejecutar la redirección hacia el login.
- **Componente Navbar (`src/components/layout/Navbar.tsx`):**
  - Consumo del objeto `session` inyectado desde los layouts superiores.
  - Reemplazo del botón estático "Próximamente" por un Dropdown de perfil interactivo y accesible (soporte de escape y clic exterior).
  - Integración de accesos directos: "Mi Dashboard" y un formulario `<form action={logoutAction}>` para "Cerrar Sesión".

### 2.2. Enrutamiento Protegido y Consulta de Servidor
- **Layout Privado (`src/app/[locale]/(private)/layout.tsx`):** Nuevo layout que intercepta las peticiones, invoca `getCurrentUser()` y ejecuta un `redirect` hacia el login si no detecta una sesión válida, blindando todas las rutas anidadas.
- **Página de Dashboard (`src/app/[locale]/(private)/dashboard/page.tsx`):**
  - Server Component principal.
  - Ejecuta consulta directa a la base de datos: `prisma.enrollment.findMany` filtrando por `userId: session.id` y `status: 'REGISTERED'`.
  - Inclusión de relaciones (`include: { course: true, event: true }`) para extraer los metadatos visuales.
  - Separación lógica en dos arreglos distintos (`enrolledCourses` y `enrolledEvents`) basándose en los predicados de tipo definidos en `dashboard.types.ts`.

### 2.3. Interfaz de Usuario (UI)
- **Diseño del Panel (`src/features/dashboard/components/DashboardTabs.tsx`):**
  - Encabezado con bienvenida personalizada y contadores rápidos.
  - Sistema de pestañas (Tabs) o visualización en cuadrícula (Grid) para separar el contenido.
  - Tarjetas de inscripción responsivas con portada (imagen o fallback dinámico), metadatos del contenido y botones de acción ("Ir al curso" / "Ir al evento") apuntando a las rutas dinámicas o URLs externas.
  - Implementación de **Empty States** instructivos ("Aún no tienes cursos inscritos") con botones "Explorar catálogo" para retener al usuario.

---

## 3. Decisiones de Diseño

1. **Destrucción de Sesión vía Server Actions:** Se optó por invocar el logout directamente desde el HTML (`<form>`) usando una Server Action, lo que garantiza el borrado de la cookie HTTP-only y la revalidación instantánea de la UI en el servidor sin necesidad de peticiones API intermedias.
2. **Layout Segregado `(private)`:** Separar el Dashboard en su propio route group `(private)` permite escalar la plataforma agregando nuevas pantallas de alumno (configuración, pagos, etc.) heredando automáticamente la capa de seguridad.
3. **Empty States Proactivos:** En lugar de mostrar pantallas en blanco o mensajes de error, los estados sin inscripciones redirigen la atención hacia el catálogo, mejorando la conversión.

---

## 4. Métricas de Calidad
- **Tipado Estricto:** Ejecución limpia de `npx tsc --noEmit` completada sin errores de tipado de Prisma ni Next.js.
- **Linter:** Ejecución limpia de `npm run lint` sin advertencias de dependencias ni accesibilidad.
- **Cobertura de Pruebas Unitarias:** Creación de `__tests__/user-dashboard.test.tsx` con 5 suites exitosas validando:
  - Renderizado condicional del menú del Navbar.
  - Comportamiento de redirección al carecer de sesión.
  - Visualización del Empty State en ambas pestañas.
  - Mapeo correcto de arreglos con inscripciones mixtas.