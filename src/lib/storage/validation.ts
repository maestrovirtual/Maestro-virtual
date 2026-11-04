/**
 * Constantes y validaciones de archivos multimedia.
 * 100% seguro para Client Components y Server Actions (sin dependencias de Node.js).
 */

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Valida que el archivo recibido sea una imagen permitida y no exceda el límite de tamaño.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file || typeof file.size !== "number" || file.size === 0) {
    return { valid: false, error: "El archivo proporcionado no es válido o está vacío." };
  }

  // Comprobar tipo MIME
  const isImageMime = file.type.startsWith("image/") || ALLOWED_IMAGE_TYPES.includes(file.type);
  if (!isImageMime) {
    return {
      valid: false,
      error: "El archivo seleccionado debe ser una imagen válida (JPG, PNG, WebP, AVIF o GIF).",
    };
  }

  // Comprobar tamaño
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `La imagen excede el tamaño máximo permitido de ${MAX_IMAGE_SIZE / (1024 * 1024)}MB.`,
    };
  }

  return { valid: true };
}

