# MV-40: Enlazar redes sociales reales

**Responsable:** Juan Pablo Arce Jáuregui (Frontend)
**Sprint:** 4
**Épica:** Presencia digital y canales de contacto
**Story Points:** 2

---

## 1. Resumen Ejecutivo
Actualización e integración de los canales oficiales de redes sociales y mensajería directa en el pie de página global (`Footer`) de Maestro Virtual A.C. Se reemplazó el enlace pendiente de **LinkedIn** por la URL oficial de la organización y se incorporó el acceso directo a **WhatsApp** mediante enlace universal `wa.me`, consolidando 6 canales verificados de comunicación e interacción con la comunidad.

**Criterios de aceptación cumplidos:**
- [x] Todos los íconos de redes sociales en el `Footer` enlazan a perfiles reales y activos de Maestro Virtual A.C.
- [x] Se habilitó la página oficial de LinkedIn reemplazando el marcador temporal (`href="#"`).
- [x] Se agregó el botón oficial de WhatsApp con enlace directo (`https://wa.me/528122072889`) e ícono `FaWhatsapp`.
- [x] Todos los enlaces externos abren en pestaña nueva con atributos de seguridad (`target="_blank"` y `rel="noopener noreferrer"`).
- [x] La botonera social mantiene su geometría circular y adaptabilidad responsiva en móvil, tablet y escritorio.

---

## 2. Arquitectura y Cambios Técnicos

### 2.1. Actualización de Redes en el Footer (`src/components/layout/Footer.tsx`)
- **Iconografía (`react-icons/fa6`):** Se importó `FaWhatsapp` junto al conjunto existente (`FaYoutube`, `FaInstagram`, `FaFacebookF`, `FaLinkedinIn`, `FaTiktok`) para mantener uniformidad visual en trazos y proporciones (`h-4 w-4`).
- **Catálogo `socialLinks`:** Configuración centralizada de las 6 plataformas oficiales:

| Red social | Ícono (`react-icons/fa6`) | URL configurada | Cambio en MV-40 |
|------------|---------------------------|-----------------|-----------------|
| **YouTube** | `FaYoutube` | `https://youtube.com/@maestrovirtuala.c?si=r_4YnZdUnWquj8_P` | Verificado |
| **Instagram** | `FaInstagram` | `https://www.instagram.com/maestrovirtual.a.c?stkn=bzQ3d3RxeXhraXYx&utm_source=qr` | Verificado |
| **Facebook** | `FaFacebookF` | `https://www.facebook.com/share/1EHNdrExY7/?mibextid=wwXIfr` | Verificado |
| **LinkedIn** | `FaLinkedinIn` | `https://www.linkedin.com/company/maestro-virtual-a-c/` | Activado (antes `#`) |
| **TikTok** | `FaTiktok` | `https://www.tiktok.com/@maestrovirtual.a.c?_r=1&_t=ZS-99XYM39hgw6` | Verificado |
| **WhatsApp** | `FaWhatsapp` | `https://wa.me/528122072889` | Nuevo canal integrado |

### 2.2. Seguridad, Accesibilidad y Diseño Responsivo
- **Seguridad en navegación externa:** Al contar con URLs reales (`href !== "#"`), cada etiqueta `<a>` aplica automáticamente `target="_blank"` y `rel="noopener noreferrer"`, evitando vulnerabilidades de *reverse tabnabbing* y aislando el proceso de la pestaña externa.
- **Accesibilidad (`a11y`):** Cada botón expone `aria-label={label}` y `title={label}`, garantizando que tecnologías de asistencia identifiquen claramente la red destino en enlaces compuestos únicamente por íconos vectoriales.
- **Protección de proporciones en Flexbox:** Al escalar la fila de 5 a 6 botones de `44x44px` (`h-11 w-11`) con separación `gap-3`, el ancho requerido (`324px`) podía exceder la columna `1.7fr` en resoluciones `lg` (`1024px`) o pantallas móviles pequeñas. Se añadió `flex-wrap` al contenedor y `shrink-0` a cada botón para impedir la compresión horizontal de los círculos.

---

## 3. Decisiones de Diseño

1. **Formato estándar internacional en `wa.me`:** Se utilizó la estructura oficial recomendada por WhatsApp (`https://wa.me/528122072889`, código de país `52` + 10 dígitos sin símbolo `+`, espacios ni guiones) para asegurar compatibilidad directa tanto con la app nativa en iOS/Android como con WhatsApp Web en escritorio.
2. **Preservación del estado `isPending` (`href === "#"`):** Aunque las 6 redes actuales ya están activas, se conservó la lógica defensiva del componente (`aria-disabled`, `e.preventDefault()` y tooltip *"Próximamente"*) para soportar futuros canales en etapa de lanzamiento sin enlaces rotos.
3. **Familia única de íconos de marca:** Usar exclusivamente `react-icons/fa6` evita mezclar librerías de íconos genéricos con logotipos oficiales de redes sociales, manteniendo coherencia estética y peso mínimo en el bundle.

---

## 4. Métricas de Calidad
- **Tipado Estricto:** Ejecución limpia de `npx tsc --noEmit` completada con `0` errores de TypeScript.
- **Linter:** Ejecución limpia de `npx eslint src/components/layout/Footer.tsx` sin errores ni advertencias.
- **Validación Visual y Funcional:** Revisión de apertura en nueva pestaña, estados `hover` y preservación de botones circulares sin desbordamiento horizontal en viewports móviles (`320px–430px`), laptops (`1024px`) y pantallas de escritorio (`1440px+`).

