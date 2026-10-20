import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { requireStaffApi } from "@/lib/auth/dal";
import { decryptGmailToken, gmailConfig, syncGmail } from "@/lib/mail/gmail";

export const maxDuration = 180;

export async function GET() {
  const denied = await requireStaffApi();
  if (denied) return denied;
  try {
    const config = gmailConfig();
    const mailbox = await prisma.contactMailbox.findUnique({ where: { id: "institution" }, select: { email: true, lastSyncedAt: true, lastError: true } });
    return NextResponse.json({ provider: process.env.MAIL_PROVIDER || "resend", configured: !!(config.clientId && config.clientSecret && config.redirectUri && config.account), account: config.account, connected: !!mailbox && mailbox.email === config.account, mailbox }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "No se pudo consultar la conexión de Gmail" }, { status: 500 });
  }
}
async function guard(request: Request) {
  const denied = await requireStaffApi();
  if (denied) return denied;
  if (request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  if (!request.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ error: "Se requiere JSON" }, { status: 415 });
  return null;
}
export async function POST(request: Request) {
  const denied = await guard(request);
  if (denied) return denied;
  try {
    if (process.env.MAIL_PROVIDER !== "gmail") return NextResponse.json({ error: "Selecciona Gmail como proveedor antes de sincronizar" }, { status: 409 });
    return NextResponse.json(await syncGmail());
  } catch {
    return NextResponse.json({ error: "No se pudo sincronizar Gmail. Revisa la conexión y los permisos de Google." }, { status: 502 });
  }
}
export async function DELETE(request: Request) {
  const denied = await guard(request);
  if (denied) return denied;
  try {
    const mailbox = await prisma.contactMailbox.findUnique({ where: { id: "institution" } });
    if (mailbox) {
      const token = decryptGmailToken(mailbox.encryptedRefreshToken);
      const response = await fetch("https://oauth2.googleapis.com/revoke", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ token }), signal: AbortSignal.timeout(20000) });
      if (!response.ok && response.status !== 400) return NextResponse.json({ error: "Google no confirmó la desconexión. Intenta de nuevo." }, { status: 502 });
      await prisma.contactMailbox.delete({ where: { id: "institution" } });
    }
    return NextResponse.json({ disconnected: true });
  } catch { return NextResponse.json({ error: "No se pudo desconectar. Puedes revocar el permiso desde tu cuenta de Google." }, { status: 500 }); }
}
