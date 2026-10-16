type ContactContent = { subject: string; message: string };

// Reglas conservadoras de contenido; no bloquea remitentes ni reclasifica
// mensajes corregidos por el staff. No sustituye un servicio especializado.
export function isLikelyContactSpam({ subject, message }: ContactContent): boolean {
  const content = `${subject}\n${message}`;
  const links = content.match(/(?:https?:\/\/|www\.)[^\s<>"']+/gi) ?? [];
  const domains = new Set<string>();
  for (const link of links) {
    try { domains.add(new URL(/^www\./i.test(link) ? `https://${link}` : link).hostname.toLowerCase()); }
    catch { /* Un enlace inválido no basta para clasificar spam. */ }
  }
  const linkLength = links.reduce((sum, link) => sum + link.length, 0);
  const linkRatio = linkLength / Math.max(content.length, 1);
  if (links.length >= 4 && domains.size >= 3 && linkRatio >= 0.3) return true;
  if (links.length >= 6 && linkRatio >= 0.5) return true;

  const normalized = content.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const prizeOrProfit = /\b(?:ganaste (?:un |el )?premio|you(?:'ve| have)? won|claim your prize|ganancias garantizadas|guaranteed profits?)\b/.test(normalized);
  const urgentAction = /\b(?:reclama|haz clic|click (?:here|now)|actua ahora|claim now|envia (?:tu |tus )?(?:clave|contrasena|datos bancarios))\b/.test(normalized);
  return links.length > 0 && domains.size > 0 && prizeOrProfit && urgentAction;
}
