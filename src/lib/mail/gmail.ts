import { createCipheriv, createDecipheriv, createHash } from "node:crypto";
import prisma from "@/lib/prisma/client";

const ROOT = "https://gmail.googleapis.com/gmail/v1/users/me";
export const GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.compose"];
// compose permite crear un borrador con ID estable antes de enviarlo: un
// corte de red nunca provoca un segundo envío con un borrador distinto.
export class GmailError extends Error {
  constructor(public status: number, message = "No se pudo completar la operación con Gmail", public definitive = false) { super(message); }
}
export function gmailConfig() {
  return {
    clientId: process.env.GMAIL_CLIENT_ID?.trim() || "",
    clientSecret: process.env.GMAIL_CLIENT_SECRET?.trim() || "",
    redirectUri: process.env.GMAIL_OAUTH_REDIRECT_URI?.trim() || "",
    account: (process.env.GMAIL_ACCOUNT_EMAIL || process.env.CONTACT_EMAIL || "").trim().toLowerCase(),
  };
}
function tokenKey() {
  const secret = process.env.GMAIL_TOKEN_SECRET || process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("Configura una clave de cifrado de al menos 32 caracteres");
  return createHash("sha256").update(`gmail-contact-v1:${secret}`).digest();
}
export function encryptGmailToken(token: string, iv: Uint8Array) {
  const cipher = createCipheriv("aes-256-gcm", tokenKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return Buffer.concat([Buffer.from(iv), cipher.getAuthTag(), ciphertext]).toString("base64url");
}
export function decryptGmailToken(value: string) {
  const data = Buffer.from(value, "base64url");
  const cipher = createDecipheriv("aes-256-gcm", tokenKey(), data.subarray(0, 12));
  cipher.setAuthTag(data.subarray(12, 28));
  return Buffer.concat([cipher.update(data.subarray(28)), cipher.final()]).toString("utf8");
}
export async function googleToken(params: Record<string, string>): Promise<{ access_token: string; refresh_token?: string; scope?: string }> {
  const config = gmailConfig();
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: config.clientId, client_secret: config.clientSecret, ...params }), signal: AbortSignal.timeout(20000) });
  const json = await response.json();
  if (!response.ok || !json.access_token) throw new GmailError(response.status, "Google no autorizó el acceso. Vuelve a conectar la cuenta institucional.");
  return json;
}
export async function gmailRequest<T>(accessToken: string, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${ROOT}${path}`, { ...init, headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, cache: "no-store", signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new GmailError(response.status);
  return response.json();
}
export async function gmailAccess() {
  const mailbox = await prisma.contactMailbox.findUnique({ where: { id: "institution" } });
  if (!mailbox) throw new Error("Conecta la cuenta institucional de Gmail");
  if (mailbox.email.toLowerCase() !== gmailConfig().account) throw new Error("La cuenta conectada no coincide con GMAIL_ACCOUNT_EMAIL");
  const tokens = await googleToken({ grant_type: "refresh_token", refresh_token: decryptGmailToken(mailbox.encryptedRefreshToken) });
  return { mailbox, token: tokens.access_token };
}
export async function replyMailSettings(provider = process.env.MAIL_PROVIDER) {
  if (provider !== "gmail") {
    const { contactMailSettings } = await import("./contact-settings");
    return { ...contactMailSettings(), provider: "resend" };
  }
  const config = gmailConfig();
  const mailbox = await prisma.contactMailbox.findUnique({ where: { id: "institution" }, select: { email: true } });
  const issues = [];
  if (!config.clientId || !config.clientSecret || !config.redirectUri) issues.push("Configura el cliente OAuth de Gmail en el servidor.");
  if (!mailbox || mailbox.email.toLowerCase() !== config.account) issues.push("Conecta la cuenta institucional de Gmail desde el panel.");
  const email = mailbox?.email || config.account;
  return { ready: issues.length === 0, from: email ? `Maestro Virtual <${email}>` : "", replyTo: email, issues, provider: "gmail" };
}
export function gmailMessageId(id: string) { return `<mv-${id}@maestro-virtual.invalid>`; }
type SendingReply = { id: string; messageId: string; fromEmail: string; toEmail: string; replyTo: string; subject: string; body: string; gmailDraftId?: string | null };
type GmailSent = { id: string; threadId: string };
export async function sendGmailReply(input: SendingReply) {
  const lease = new Date(Date.now() + 180000);
  const claim = await prisma.contactReply.updateMany({ where: { id: input.id, OR: [{ gmailSendLeaseUntil: null }, { gmailSendLeaseUntil: { lt: new Date() } }] }, data: { gmailSendLeaseUntil: lease } });
  if (!claim.count) throw new GmailError(409, "Este envío ya está en proceso");
  try {
    const fresh = await prisma.contactReply.findUnique({ where: { id: input.id } });
    if (!fresh) throw new Error("Intento no encontrado");
    if (fresh.status === "SENT" && fresh.providerId && fresh.providerThreadId) return { id: fresh.providerId, threadId: fresh.providerThreadId };
    return await sendGmailDraft(fresh);
  } finally { await prisma.contactReply.updateMany({ where: { id: input.id, gmailSendLeaseUntil: lease }, data: { gmailSendLeaseUntil: null } }); }
}
async function sendGmailDraft(reply: SendingReply) {
  const { mailbox, token } = await gmailAccess();
  if (reply.replyTo.toLowerCase() !== mailbox.email.toLowerCase()) throw new Error("El envío pertenece a otra cuenta de correo. Revisa el intento.");
  const messageId = gmailMessageId(reply.id);
  // Reconciliar una respuesta pendiente antes de tocar su borrador.
  if (reply.gmailDraftId) {
    const found = await gmailRequest<{ messages?: GmailSent[] }>(token, `/messages?q=${encodeURIComponent(`in:sent rfc822msgid:${messageId.slice(1, -1)}`)}&maxResults=1`);
    if (found.messages?.[0]) return found.messages[0];
  }
  let draftId = reply.gmailDraftId;
  if (!draftId) {
    const previous = await prisma.contactReply.findFirst({ where: { messageId: reply.messageId, provider: "gmail", providerThreadId: { not: null }, status: "SENT" }, orderBy: { createdAt: "desc" } });
    const headers = [
      `From: ${reply.fromEmail}`, `To: ${reply.toEmail}`, `Reply-To: ${mailbox.email}`,
      `Subject: ${(reply.subject.match(/.{1,10}/gu) || []).map(part => `=?UTF-8?B?${Buffer.from(part).toString("base64")}?=`).join("\r\n ")}`,
      `Message-ID: ${messageId}`, "MIME-Version: 1.0", "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64",
    ];
    if (previous?.rfcMessageId && !/[\r\n]/.test(previous.rfcMessageId)) headers.push(`In-Reply-To: ${previous.rfcMessageId}`, `References: ${previous.rfcMessageId}`);
    const encodedBody = Buffer.from(reply.body).toString("base64").match(/.{1,76}/g)?.join("\r\n") || "";
    const raw = Buffer.from(`${headers.join("\r\n")}\r\n\r\n${encodedBody}`).toString("base64url");
    const normalizedSubject = (value: string) => value.replace(/^(?:(?:re|fw|fwd):\s*)+/gi, "").trim().toLowerCase();
    const sameSubject = previous && normalizedSubject(previous.subject) === normalizedSubject(reply.subject);
    const draft = await gmailRequest<{ id: string }>(token, "/drafts", { method: "POST", body: JSON.stringify({ message: { raw, ...(sameSubject && previous.providerThreadId ? { threadId: previous.providerThreadId } : {}) } }) });
    draftId = draft.id;
    // Si falla esta escritura, no se envía el borrador.
    await prisma.contactReply.update({ where: { id: reply.id }, data: { gmailDraftId: draftId, rfcMessageId: messageId } });
  }
  const stored = await gmailRequest<{ message: GmailMessage }>(token, `/drafts/${encodeURIComponent(draftId)}?format=full`);
  const draft = stored.message;
  const normalized = (value: string) => value.replace(/\r\n/g, "\n").trim();
  if (emailAddress(emailHeader(draft, "To")) !== reply.toEmail.toLowerCase() || emailAddress(emailHeader(draft, "From")) !== mailbox.email || emailAddress(emailHeader(draft, "Reply-To")) !== mailbox.email || emailHeader(draft, "Message-ID") !== messageId || gmailSubject(emailHeader(draft, "Subject")) !== reply.subject || normalized(gmailBody(draft)) !== normalized(reply.body)) {
    throw new GmailError(400, "El borrador cambió en Gmail. Revisa el contenido antes de crear un envío nuevo.", true);
  }
  // Google elimina el borrador al enviarlo. Reintentar este mismo draft ID no
  // crea otro correo; un 404 queda por confirmar y se reconcilia con Enviados.
  try {
    return await gmailRequest<GmailSent>(token, "/drafts/send", { method: "POST", body: JSON.stringify({ id: draftId }) });
  } catch (error) {
    if (error instanceof GmailError && [400, 401, 403, 429].includes(error.status)) error.definitive = true;
    throw error;
  }
}

type Part = { mimeType?: string; filename?: string; body?: { data?: string }; parts?: Part[]; headers?: { name: string; value: string }[] };
export type GmailMessage = { id: string; threadId: string; internalDate?: string; payload?: Part; snippet?: string; labelIds?: string[] };
export function emailHeader(message: GmailMessage, name: string) {
  return message.payload?.headers?.find(header => header.name.toLowerCase() === name.toLowerCase())?.value || "";
}
export function emailAddress(value: string) { return (value.match(/<([^<>]+)>/)?.[1] || value).trim().toLowerCase(); }
function decodeBytes(bytes: Uint8Array, charset = "utf-8") {
  try { return new TextDecoder(charset).decode(bytes); }
  catch { return Buffer.from(bytes).toString("utf8"); }
}
export function gmailSubject(value: string) {
  return value.replace(/(\?=)\s+(?==\?)/g, "$1").replace(/=\?([^?]+)\?([bq])\?([^?]*)\?=/gi, (_, charset: string, encoding: string, data: string) => {
    if (encoding.toLowerCase() === "b") return decodeBytes(Buffer.from(data, "base64"), charset);
    const decoded = data.replace(/_/g, " ").replace(/=([0-9a-f]{2})/gi, (_match, hex: string) => String.fromCharCode(parseInt(hex, 16)));
    return decodeBytes(Buffer.from(decoded, "latin1"), charset);
  });
}
function findBody(part: Part | undefined, mimeType: string): string {
  if (!part || part.filename) return "";
  if (part.mimeType === mimeType && part.body?.data) {
    const contentType = part.headers?.find(header => header.name.toLowerCase() === "content-type")?.value || "";
    const charset = contentType.match(/charset=["']?([^\s;"']+)/i)?.[1];
    return decodeBytes(Buffer.from(part.body.data, "base64url"), charset);
  }
  return part.parts?.map(child => findBody(child, mimeType)).find(Boolean) || "";
}
export function gmailBody(message: GmailMessage) {
  const plain = findBody(message.payload, "text/plain");
  if (plain) return plain.slice(0, 100000);
  const html = findBody(message.payload, "text/html");
  // Se guarda y muestra únicamente texto. No se renderiza HTML remoto.
  return (html ? html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "").replace(/<br\s*\/?\s*>|<\/(p|div|li)>/gi, "\n").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&") : message.snippet || "[Mensaje sin texto; consulta el correo original para ver sus adjuntos]").slice(0, 100000).trim();
}

async function importGmailMessage(token: string, stub: { id: string; threadId: string }) {
  const existing = await prisma.contactReply.findUnique({ where: { provider_providerId: { provider: "gmail", providerId: stub.id } } });
  if (existing) return false;
  let linked = await prisma.contactReply.findMany({ where: { provider: "gmail", providerThreadId: stub.threadId }, select: { messageId: true, rfcMessageId: true }, take: 100 });
  const metadata = await gmailRequest<GmailMessage>(token, `/messages/${encodeURIComponent(stub.id)}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=References&metadataHeaders=In-Reply-To&metadataHeaders=Message-ID`);
  const refs = `${emailHeader(metadata, "In-Reply-To")} ${emailHeader(metadata, "References")}`;
  const ids = [...refs.matchAll(/<mv-([0-9a-f-]{36})@maestro-virtual\.invalid>/gi)].map(match => match[1]);
  if (ids.length) linked = [...linked, ...await prisma.contactReply.findMany({ where: { id: { in: ids }, provider: "gmail", direction: "OUTBOUND" }, select: { messageId: true, rfcMessageId: true } })];
  const sent = !!metadata.labelIds?.includes("SENT");
  const ownId = sent ? emailHeader(metadata, "Message-ID").match(/^<mv-([0-9a-f-]{36})@maestro-virtual\.invalid>$/i)?.[1] : undefined;
  const own = ownId ? await prisma.contactReply.findUnique({ where: { id: ownId } }) : null;
  if (own?.provider === "gmail" && own.direction === "OUTBOUND") linked.push({ messageId: own.messageId, rfcMessageId: own.rfcMessageId });
  if (!linked.length) return false;
  const directOwners = [...new Set(linked.filter(row => row.rfcMessageId && emailHeader(metadata, "In-Reply-To").includes(row.rfcMessageId)).map(row => row.messageId))];
  const referenceOwners = [...new Set(linked.filter(row => row.rfcMessageId && refs.includes(row.rfcMessageId)).map(row => row.messageId))];
  const owners = own?.provider === "gmail" ? [own.messageId] : directOwners.length ? directOwners : referenceOwners.length ? referenceOwners : [...new Set(linked.map(row => row.messageId))];
  const contactId = owners.length === 1 ? owners[0] : null;
  if (!contactId) return false;
  const contact = await prisma.contactMessage.findUnique({ where: { id: contactId } });
  const mailbox = gmailConfig().account;
  const sender = emailAddress(emailHeader(metadata, "From"));
  const outbound = sent && sender === mailbox;
  if (!contact || (outbound ? emailAddress(emailHeader(metadata, "To")) !== contact.email.toLowerCase() : sent || sender !== contact.email.toLowerCase())) return false;
  const email = await gmailRequest<GmailMessage>(token, `/messages/${encodeURIComponent(stub.id)}?format=full`);
  const received = Number(email.internalDate);
  const createdAt = Number.isFinite(received) && received > 0 ? new Date(received) : new Date();
  try {
    if (outbound && own?.provider === "gmail") {
      const reconciled = await prisma.contactReply.updateMany({ where: { id: own.id, status: { not: "SENT" } }, data: { status: "SENT", providerId: email.id, providerThreadId: email.threadId, sentAt: createdAt, error: null } });
      if (reconciled.count) await prisma.contactMessage.updateMany({ where: { id: contact.id, lastActivityAt: { lt: createdAt } }, data: { lastActivityAt: createdAt } });
      return reconciled.count > 0;
    }
    await prisma.$transaction(async tx => {
      await tx.contactReply.create({ data: {
        messageId: contact.id, provider: "gmail", providerId: email.id, providerThreadId: email.threadId,
        rfcMessageId: emailHeader(email, "Message-ID").slice(0, 1000), direction: outbound ? "OUTBOUND" : "INBOUND",
        staffId: null, staffName: outbound ? "Cuenta institucional (Gmail)" : contact.name,
        fromEmail: outbound ? mailbox : contact.email, toEmail: outbound ? contact.email : mailbox, replyTo: outbound ? mailbox : contact.email,
        subject: gmailSubject(emailHeader(email, "Subject")).slice(0, 200), body: gmailBody(email), status: "SENT", createdAt,
        ...(outbound ? { sentAt: createdAt } : {}),
      } });
      if (!outbound) await tx.contactMessage.update({ where: { id: contact.id }, data: { isRead: false, isArchived: false } });
      await tx.contactMessage.updateMany({ where: { id: contact.id, lastActivityAt: { lt: createdAt } }, data: { lastActivityAt: createdAt } });
    });
    return true;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return false;
    throw error;
  }
}

export async function syncGmail() {
  const lease = new Date(Date.now() + 180000);
  const claim = await prisma.contactMailbox.updateMany({ where: { id: "institution", OR: [{ leaseUntil: null }, { leaseUntil: { lt: new Date() } }] }, data: { leaseUntil: lease } });
  if (!claim.count) return { imported: 0, busy: true };
  let imported = 0;
  try {
    const { mailbox, token } = await gmailAccess();
    if (!mailbox.historyId || mailbox.recoveryHistoryId) {
      const snapshot = mailbox.recoveryHistoryId || (await gmailRequest<{ historyId: string }>(token, "/profile")).historyId;
      const rows = await prisma.contactReply.groupBy({ by: ["providerThreadId"], where: { provider: "gmail", providerThreadId: { not: null, ...(mailbox.recoveryCursor ? { gt: mailbox.recoveryCursor } : {}) } }, orderBy: { providerThreadId: "asc" }, take: 5 });
      for (const row of rows) {
        if (!row.providerThreadId) continue;
        try {
          const thread = await gmailRequest<{ messages?: { id: string; threadId: string }[] }>(token, `/threads/${encodeURIComponent(row.providerThreadId)}?format=minimal`);
          for (const email of thread.messages || []) if (await importGmailMessage(token, email)) imported++;
        } catch (error) { if (!(error instanceof GmailError) || error.status !== 404) throw error; }
      }
      await prisma.contactMailbox.update({ where: { id: mailbox.id }, data: rows.length === 5
        ? { recoveryCursor: rows[4].providerThreadId, recoveryHistoryId: snapshot, lastError: null }
        : { historyId: snapshot, recoveryCursor: null, recoveryHistoryId: null, nextPageToken: null, lastError: null, lastSyncedAt: new Date() } });
      return { imported, more: rows.length === 5 };
    }
    try {
      const search = new URLSearchParams({ startHistoryId: mailbox.historyId, historyTypes: "messageAdded", maxResults: "20" });
      if (mailbox.nextPageToken) search.set("pageToken", mailbox.nextPageToken);
      const history = await gmailRequest<{ historyId: string; nextPageToken?: string; history?: { messagesAdded?: { message: { id: string; threadId: string } }[] }[] }>(token, `/history?${search}`);
      const messages = new Map<string, { id: string; threadId: string }>();
      for (const item of history.history || []) for (const entry of item.messagesAdded || []) messages.set(entry.message.id, entry.message);
      for (const email of messages.values()) if (await importGmailMessage(token, email)) imported++;
      await prisma.contactMailbox.update({ where: { id: mailbox.id }, data: {
        ...(history.nextPageToken ? { nextPageToken: history.nextPageToken } : { historyId: history.historyId, nextPageToken: null, lastSyncedAt: new Date() }), lastError: null,
      } });
      return { imported, more: !!history.nextPageToken };
    } catch (error) {
      if (!(error instanceof GmailError) || error.status !== 404) throw error;
      await prisma.contactMailbox.update({ where: { id: mailbox.id }, data: { historyId: null, nextPageToken: null, recoveryCursor: null } });
      return { imported, more: true };
    }
  } catch (error) {
    await prisma.contactMailbox.updateMany({ where: { id: "institution" }, data: { lastError: "No se pudo sincronizar Gmail. Reintenta o vuelve a conectar la cuenta." } });
    throw error;
  } finally { await prisma.contactMailbox.updateMany({ where: { id: "institution", leaseUntil: lease }, data: { leaseUntil: null } }); }
}
