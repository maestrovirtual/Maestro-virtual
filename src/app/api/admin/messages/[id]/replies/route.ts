import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { getStaffUser, requireStaffApi } from "@/lib/auth/dal";
import { contactMailSettings } from "@/lib/mail/contact-settings";
import { sendContactReply } from "@/services/mail/sendContactReply";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Context = { params: Promise<{ id: string }> };
const privateHeaders = { "Cache-Control": "private, no-store" };

export async function GET(request: Request, { params }: Context) {
  try {
    const denied = await requireStaffApi();
    if (denied) return denied;
    const { id } = await params;
    const page = Number(new URL(request.url).searchParams.get("page") ?? "1");
    if (!Number.isSafeInteger(page) || page < 1 || page > 100000) {
      return NextResponse.json({ error: "Página inválida" }, { status: 400 });
    }
    if (!await prisma.contactMessage.findUnique({ where: { id }, select: { id: true } })) {
      return NextResponse.json({ error: "Mensaje no encontrado" }, { status: 404 });
    }
    const [replies, total, pendingCount] = await prisma.$transaction([
      prisma.contactReply.findMany({ where: { messageId: id }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 20, skip: (page - 1) * 20 }),
      prisma.contactReply.count({ where: { messageId: id } }),
      prisma.contactReply.count({ where: { messageId: id, status: "PENDING" } }),
    ]);
    const staffId = (await getStaffUser())?.id;
    const history = replies.map(reply => ({ ...reply, canRetry: reply.staffId === staffId && reply.status !== "SENT" && Date.now() - reply.createdAt.getTime() <= 23 * 60 * 60 * 1000 }));
    return NextResponse.json({ replies: history, total, hasPending: pendingCount > 0, page, pageSize: 20, staffId, mail: contactMailSettings() }, { headers: privateHeaders });
  } catch (error) {
    console.error("Error al cargar respuestas:", error);
    return NextResponse.json({ error: "No se pudo cargar el historial de respuestas" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Context) {
  try {
    const denied = await requireStaffApi();
    if (denied) return denied;
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
    if (!request.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ error: "Se requiere JSON" }, { status: 415 });
    const staff = await getStaffUser();
    if (!staff) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    let body;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
    }
    if (!body || typeof body.subject !== "string" || typeof body.body !== "string" || typeof body.requestId !== "string" || !UUID.test(body.requestId)) {
      return NextResponse.json({ error: "Indica asunto, respuesta e identificador válido" }, { status: 400 });
    }
    const subject = body.subject.trim();
    const text = body.body.trim();
    if (!subject || subject.length > 200 || /[\r\n]/.test(subject) || !text || text.length > 10000) {
      return NextResponse.json({ error: "El asunto debe tener entre 1 y 200 caracteres y la respuesta entre 1 y 10000" }, { status: 400 });
    }
    const { id } = await params;
    const message = await prisma.contactMessage.findUnique({ where: { id } });
    if (!message) return NextResponse.json({ error: "Mensaje no encontrado" }, { status: 404 });

    let reply = await prisma.contactReply.findUnique({ where: { id: body.requestId } });
    if (reply && (reply.messageId !== id || reply.staffId !== staff.id || reply.subject !== subject || reply.body !== text)) {
      return NextResponse.json({ error: "Este intento pertenece a otra respuesta. Recarga el historial." }, { status: 409 });
    }
    if (reply?.status === "SENT") return NextResponse.json({ reply }, { headers: privateHeaders });
    if (message.isSpam) return NextResponse.json({ error: "Marca No es spam antes de responder desde el panel" }, { status: 409 });
    const mail = contactMailSettings();
    if (!mail.ready) return NextResponse.json({ error: mail.issues.join(" ") }, { status: 503 });

    // Resend conserva la clave durante 24 h. Fuera de esa ventana no se
    // reintenta automáticamente, para no duplicar un envío incierto.
    if (reply && Date.now() - reply.createdAt.getTime() > 23 * 60 * 60 * 1000) {
      return NextResponse.json({ error: "Este intento requiere revisión en Resend antes de volver a enviar" }, { status: 409 });
    }
    try {
      if (!reply) {
        reply = await prisma.contactReply.create({ data: {
          id: body.requestId, messageId: id, staffId: staff.id, staffName: staff.name,
          fromEmail: mail.from, toEmail: message.email, replyTo: mail.replyTo,
          subject, body: text,
        } });
      } else if (reply.status === "FAILED") {
        await prisma.contactReply.updateMany({ where: { id: reply.id, status: "FAILED" }, data: { status: "PENDING", error: null } });
        const current = await prisma.contactReply.findUnique({ where: { id: reply.id } });
        if (!current) return NextResponse.json({ error: "Intento no encontrado" }, { status: 404 });
        if (current.status === "SENT") return NextResponse.json({ reply: current }, { headers: privateHeaders });
        reply = current;
      }
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
        return NextResponse.json({ error: "Ya hay un envío en proceso. Revisa el historial antes de intentar otro." }, { status: 409 });
      }
      throw error;
    }

    let result;
    try { result = await sendContactReply(reply); } catch (error) {
      console.error("No se pudo confirmar respuesta de Resend:", error);
      // Puede haberse aceptado antes de cortarse la conexión: queda pendiente.
      await prisma.contactReply.updateMany({ where: { id: reply.id, status: "PENDING" }, data: { error: "No se pudo confirmar la respuesta del servicio de correo. Reintenta este mismo envío." } });
      return NextResponse.json({ reply, error: "No se pudo confirmar el envío. Reintenta esta misma respuesta desde el historial." }, { status: 502 });
    }
    if (result.error || !result.data?.id) {
      const uncertain = !result.error || result.error.name === "concurrent_idempotent_requests" || result.error.statusCode === null || result.error.statusCode >= 500;
      await prisma.contactReply.updateMany({ where: { id: reply.id, status: { not: "SENT" } }, data: {
        status: uncertain ? "PENDING" : "FAILED",
        error: uncertain ? "Hay un envío en proceso. Revisa o reintenta este mismo intento." : "Resend rechazó el envío. Revisa el remitente, el dominio y la configuración del servicio.",
      } });
      const saved = await prisma.contactReply.findUnique({ where: { id: reply.id } });
      if (saved?.status === "SENT") return NextResponse.json({ reply: saved }, { headers: privateHeaders });
      return NextResponse.json({ reply: saved, error: saved?.error ?? "No se pudo confirmar el envío" }, { status: 502 });
    }
    reply = await prisma.contactReply.update({ where: { id: reply.id }, data: { status: "SENT", providerId: result.data.id, sentAt: new Date(), error: null } });
    return NextResponse.json({ reply }, { headers: privateHeaders });
  } catch (error) {
    console.error("Error al responder contacto:", error);
    return NextResponse.json({ error: "No se pudo completar la respuesta. Revisa el historial antes de reintentar." }, { status: 500 });
  }
}
