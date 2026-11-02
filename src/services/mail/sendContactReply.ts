import { getResend } from "@/lib/mail/resend";

type ReplyEmail = { id: string; fromEmail: string; toEmail: string; replyTo: string; subject: string; body: string };

export async function sendContactReply(reply: ReplyEmail) {
  // Texto plano: el contenido escrito por el staff nunca se interpreta como HTML.
  return getResend().emails.send({
    from: reply.fromEmail,
    to: reply.toEmail,
    replyTo: reply.replyTo,
    subject: reply.subject,
    text: reply.body,
  }, { idempotencyKey: `contact-reply/${reply.id}` });
}
