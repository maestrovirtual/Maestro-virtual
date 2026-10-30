const EMAIL = /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/;

export function contactMailSettings() {
  const from = (process.env.MAIL_FROM ?? "").trim();
  const address = from.match(/^[^<>\r\n]*<([^<>]+)>$/)?.[1] ?? from;
  const replyTo = (process.env.MAIL_REPLY_TO || address).trim();
  const issues: string[] = [];
  if (!process.env.RESEND_API_KEY?.trim()) issues.push("Falta configurar RESEND_API_KEY.");
  if (!EMAIL.test(address) || /[\r\n]/.test(from) || address.toLowerCase().endsWith("@resend.dev")) {
    issues.push("Configura MAIL_FROM con remitente de soporte (dominio verificado en Resend). Ejemplo: Soporte Maestro Virtual <soporte@maestrovirtual.org>");
  }
  if (!EMAIL.test(replyTo)) issues.push("Configura un buzón válido en MAIL_REPLY_TO o CONTACT_EMAIL.");
  return { ready: issues.length === 0, from, replyTo, issues };
}
