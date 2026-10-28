export type SubmitResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: string };

// POST JSON a la API de cuentas. En caso de error devuelve el mensaje listo
// para mostrar en el formulario.
export async function submitJson(url: string, body: unknown): Promise<SubmitResult> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => null);

    if (response.ok) return { ok: true, data: data ?? {} };
    return { ok: false, error: data?.error ?? "Algo salió mal. Intenta de nuevo." };
  } catch {
    return { ok: false, error: "No se pudo conectar con el servidor. Intenta de nuevo." };
  }
}
