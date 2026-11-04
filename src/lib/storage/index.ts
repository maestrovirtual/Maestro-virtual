/**
 * Servicio de almacenamiento (Storage) para Maestro Virtual.
 * Soporta Supabase Storage mediante REST API estándar y fallback local para entornos de desarrollo.
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

/**
 * Intenta crear automáticamente un bucket público en Supabase Storage si no existe.
 */
async function tryCreateBucket(supabaseUrl: string, supabaseKey: string, bucket: string): Promise<boolean> {
  try {
    const res = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: bucket,
        name: bucket,
        public: true,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Sube una imagen de portada al servicio de almacenamiento (Supabase Storage).
 * Retorna la URL pública y la ruta en el bucket.
 */
export async function uploadEventImage(
  file: File,
  bucket = process.env.SUPABASE_STORAGE_BUCKET || "events"
): Promise<UploadResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sanitizar extensión y generar nombre de archivo único
  const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const ext = originalName.includes(".") ? originalName.split(".").pop() : "jpg";
  const uniqueId = crypto.randomUUID().slice(0, 8);
  const uniqueFileName = `${Date.now()}-${uniqueId}.${ext}`;
  const filePath = uniqueFileName;

  // Si Supabase Storage está configurado (Producción / Staging / Dev con credenciales)
  if (supabaseUrl && supabaseKey && !supabaseUrl.includes("[TU-PASSWORD]")) {
    const uploadEndpoint = `${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`;
    const fileBuffer = await file.arrayBuffer();

    let response = await fetch(uploadEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "true",
      },
      body: fileBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      const isNoSuchBucket =
        errorText.includes("NoSuchBucket") ||
        errorText.includes("Bucket not found") ||
        response.status === 404;

      // Si el bucket no existe, intentar crearlo automáticamente
      if (isNoSuchBucket) {
        const created = await tryCreateBucket(supabaseUrl, supabaseKey, bucket);
        if (created) {
          // Reintentar subida tras crear el bucket
          response = await fetch(uploadEndpoint, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${supabaseKey}`,
              apikey: supabaseKey,
              "Content-Type": file.type || "application/octet-stream",
              "x-upsert": "true",
            },
            body: fileBuffer,
          });
        }
      }

      if (!response.ok) {
        if (isNoSuchBucket) {
          throw new Error(
            `El bucket "${bucket}" no existe en tu proyecto de Supabase. Créalo desde el Dashboard de Supabase en Storage > New bucket (con el nombre "${bucket}" y la opción "Public bucket" activada) o define SUPABASE_STORAGE_BUCKET en tu archivo .env.local si tu bucket tiene otro nombre.`
          );
        }

        let parsedError = errorText;
        try {
          const json = JSON.parse(errorText);
          parsedError = json.message || json.error || errorText;
        } catch {
          // Utilizar texto sin formato si no es JSON
        }

        if (
          response.status === 403 ||
          errorText.toLowerCase().includes("row-level security") ||
          errorText.toLowerCase().includes("violates rls") ||
          errorText.toLowerCase().includes("security policy")
        ) {
          throw new Error(
            `Error de permisos en Supabase Storage (403 - RLS): La subida fue rechazada. Asegúrate de tener SUPABASE_SERVICE_ROLE_KEY en tu archivo .env.local y reiniciar el servidor.`
          );
        }

        throw new Error(`Error en Supabase Storage (${response.status}): ${parsedError}`);
      }
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
    return { url: publicUrl, path: filePath };
  }

  // Fallback para desarrollo local si no hay credenciales de Supabase activas
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "events");
    await fs.mkdir(uploadsDir, { recursive: true });

    const localPath = path.join(uploadsDir, uniqueFileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(localPath, buffer);

    const localUrl = `/uploads/events/${uniqueFileName}`;
    return { url: localUrl, path: filePath };
  } catch (fsError) {
    throw new Error(
      `No se pudo almacenar la imagen en el almacenamiento local: ${
        fsError instanceof Error ? fsError.message : String(fsError)
      }`
    );
  }
}

/**
 * Sube una imagen de curso al servicio de almacenamiento (Supabase Storage).
 * Utiliza el mismo bucket configurado y gestiona credenciales seguras de servidor.
 */
export async function uploadCourseImage(
  file: File,
  bucket = process.env.SUPABASE_STORAGE_BUCKET || "events"
): Promise<UploadResult> {
  return uploadEventImage(file, bucket);
}
