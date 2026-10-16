"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { ArrowUpRight, CheckCheck, ChevronDown, Eye, History, Mail, Send, ShieldCheck } from "lucide-react";

type Message = { id: string; name: string; email: string; subject: string; isSpam: boolean };
type Reply = {
  id: string; staffId: string; staffName: string; fromEmail: string; toEmail: string;
  replyTo: string; subject: string; body: string; status: "PENDING" | "SENT" | "FAILED";
  error: string | null; canRetry: boolean; createdAt: string; sentAt: string | null;
};
type HistoryData = {
  replies: Reply[]; total: number; hasPending: boolean; page: number; pageSize: number; staffId: string;
  mail: { ready: boolean; from: string; replyTo: string; issues: string[] };
};
type Attempt = { id: string; subject: string; body: string; status?: Reply["status"] };

export default function ContactReplyWorkspace({ message, onSent, onBusyChange }: {
  message: Message; onSent: () => void; onBusyChange: (busy: boolean) => void;
}) {
  const locale = useLocale();
  const replySubject = `${/^re:/i.test(message.subject) ? "" : "Re: "}${message.subject || "Contacto Maestro Virtual"}`.slice(0, 200);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<HistoryData | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [subject, setSubject] = useState(replySubject);
  const [body, setBody] = useState(`Hola ${message.name.trim().split(/\s+/)[0]},\n\n\n\nSaludos,\nMaestro Virtual`);
  const [preview, setPreview] = useState(false);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const sending = useRef(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(`/api/admin/messages/${encodeURIComponent(message.id)}/replies?page=${page}`, { cache: "no-store", signal });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "No se pudo cargar el historial");
      if (!signal?.aborted) setData(json);
    } catch (err) {
      if (!signal?.aborted) setError(err instanceof Error ? err.message : "No se pudo cargar el historial");
    } finally { if (!signal?.aborted) setLoading(false); }
  }, [message.id, page]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    void Promise.resolve().then(() => { if (!controller.signal.aborted) return load(controller.signal); });
    return () => controller.abort();
  }, [load, open]);

  async function submit(existing?: Reply) {
    if (sending.current) return;
    sending.current = true;
    setBusy(true);
    onBusyChange(true);
    setError("");
    setSuccess("");
    const current = existing ? { id: existing.id, subject: existing.subject, body: existing.body, status: existing.status }
      : attempt ?? { id: crypto.randomUUID(), subject: subject.trim(), body: body.trim() };
    if (!existing) setAttempt(current);
    try {
      const response = await fetch(`/api/admin/messages/${encodeURIComponent(message.id)}/replies`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: current.id, subject: current.subject, body: current.body }),
      });
      const json = await response.json();
      if (!existing && json.reply) setAttempt({ ...current, status: json.reply.status });
      if (!response.ok) throw new Error(json.error || "No se pudo confirmar el envío. Revisa el historial antes de reenviar.");
      if (json.reply?.status !== "SENT") throw new Error("El envío todavía no está confirmado.");
      setSuccess("Respuesta enviada al servicio de correo. Puedes consultar el registro en el historial.");
      if (!existing || attempt?.id === existing.id) { setBody(""); setAttempt(null); }
      onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo confirmar el envío. Reintenta el mismo intento.");
    } finally {
      if (page > 1) { setLoading(true); setPage(1); }
      else await load();
      setBusy(false);
      onBusyChange(false);
      sending.current = false;
    }
  }

  const pending = data?.replies.find(reply => reply.status === "PENDING");
  const blocked = busy || loading || !data?.mail.ready || message.isSpam || (!!data?.hasPending && (!attempt || pending?.id !== attempt.id));
  const date = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "America/Monterrey" }).format(new Date(value));
  const external = `mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(replySubject)}`;

  return (
    <div className="mt-6 border-t border-slate-100 pt-5">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={busy} onClick={() => { setOpen(!open); if (!data) setLoading(true); }} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"><Send size={15} aria-hidden="true" />Responder desde el panel<ChevronDown size={14} className={open ? "rotate-180" : ""} aria-hidden="true" /></button>
        <a href={external} className="inline-flex items-center gap-1.5 px-1 py-2 text-xs font-semibold text-slate-500 hover:text-blue-600">Abrir en mi app de correo<ArrowUpRight size={14} aria-hidden="true" /></a>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-400">En la app de correo, revisa que esté seleccionada la cuenta institucional.</p>
      {open && <div className="mt-5 space-y-6">
        {loading && <p role="status" className="text-sm text-slate-500">Cargando respuestas…</p>}
        {error && <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-700">{error}<button type="button" disabled={busy} className="ml-2 underline" onClick={() => { setLoading(true); setError(""); void load(); }}>Actualizar historial</button></div>}
        {success && <p role="status" className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">{success}</p>}
        {data && <>
          {!data.mail.ready && <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><p className="font-semibold">El envío institucional aún no está configurado</p><ul className="mt-2 list-inside list-disc">{data.mail.issues.map(issue => <li key={issue}>{issue}</li>)}</ul><p className="mt-2 text-xs">Un responsable debe verificar el dominio del remitente en Resend. Puedes preparar el texto o usar tu app de correo.</p></div>}
          {message.isSpam && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Marca <strong>No es spam</strong> antes de responder desde el panel.</p>}
          {data.hasPending && <p className="rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-800">Hay un envío por confirmar. Revisa ese intento en el historial antes de redactar otro.</p>}
          <form onSubmit={event => { event.preventDefault(); void submit(); }} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4"><h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Mail size={16} aria-hidden="true" />Nueva respuesta</h4><span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500"><ShieldCheck size={14} aria-hidden="true" />Correo institucional</span></div>
            <div className="space-y-3 border-b border-slate-100 px-5 py-4 text-xs leading-5"><p className="flex flex-wrap gap-x-4"><span className="w-12 text-slate-400">De</span><span className="break-all font-medium text-slate-700">{data.mail.from || "Remitente pendiente de configurar"}</span></p><p className="flex flex-wrap gap-x-4"><span className="w-12 text-slate-400">Para</span><span className="break-all text-slate-600">{message.name} &lt;{message.email}&gt;</span></p><p className="flex flex-wrap gap-x-4"><span className="w-12 text-slate-400">Responde a</span><span className="break-all text-slate-600">{data.mail.replyTo || "Pendiente de configurar"}</span></p></div>
            <div className="p-5">
              <label htmlFor={`reply-subject-${message.id}`} className="text-xs font-semibold text-slate-500">Asunto</label><input id={`reply-subject-${message.id}`} value={subject} onChange={event => setSubject(event.target.value)} maxLength={200} required disabled={busy || !!attempt} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50" />
              <div className="mt-5 flex items-center justify-between gap-3"><label htmlFor={`reply-body-${message.id}`} className="text-xs font-semibold text-slate-500">Tu respuesta</label><button type="button" onClick={() => setPreview(!preview)} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600"><Eye size={14} aria-hidden="true" />{preview ? "Volver al editor" : "Vista previa"}</button></div>
              {preview ? <div className="mt-2 min-h-48 whitespace-pre-wrap break-words rounded-xl border border-slate-100 bg-slate-50 p-5 text-sm leading-7 text-slate-700">{body || "Tu respuesta aparecerá aquí."}</div> : <textarea id={`reply-body-${message.id}`} value={body} onChange={event => setBody(event.target.value)} rows={9} maxLength={10000} required disabled={busy || !!attempt} placeholder="Escribe una respuesta cercana y clara…" className="mt-2 w-full resize-y rounded-xl border border-slate-200 p-4 text-sm leading-7 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50" />}
              <p className="mt-2 text-right text-[11px] tabular-nums text-slate-400">{body.length.toLocaleString(locale)} / 10,000</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4"><p className="max-w-sm text-xs leading-5 text-slate-400">Las contestaciones del destinatario llegarán al buzón indicado; todavía no se importan al panel.</p><button type="submit" disabled={blocked || !subject.trim() || !body.trim()} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"><Send size={15} aria-hidden="true" />{busy ? "Enviando…" : attempt ? "Reintentar mismo envío" : "Enviar respuesta"}</button></div>
              {attempt?.status === "FAILED" && <button type="button" disabled={busy} className="mt-4 text-xs font-semibold text-blue-600 underline" onClick={() => setAttempt(null)}>Editar como una nueva respuesta</button>}
            </div>
          </form>
          <section aria-label="Historial de respuestas" className="space-y-3">
            <div className="flex items-center justify-between gap-3"><h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800"><History size={16} aria-hidden="true" />Historial de respuestas <span className="font-normal text-slate-400">({data.total})</span></h4><span className="text-[11px] text-slate-400">Más recientes primero</span></div>
            {data.replies.length === 0 ? <p className="rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-400">Aún no se ha respondido desde el panel. Los correos enviados desde tu app no se registran aquí.</p> : data.replies.map(reply => <article key={reply.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${reply.status === "SENT" ? "bg-emerald-50 text-emerald-700" : reply.status === "FAILED" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{reply.status === "SENT" ? "Enviado" : reply.status === "FAILED" ? "No enviado" : "Por confirmar"}</span><time dateTime={reply.sentAt || reply.createdAt} className="text-[11px] text-slate-400">{date(reply.sentAt || reply.createdAt)}</time></div>
              <p className="mt-3 text-sm font-semibold text-slate-800">{reply.subject}</p><p className="mt-1 text-xs text-slate-500">Por {reply.staffName} · Desde {reply.fromEmail}</p><details className="mt-3 text-xs text-slate-500"><summary className="cursor-pointer font-semibold">Ver respuesta</summary><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">{reply.body}</p></details>
              {reply.error && <p className="mt-3 text-xs leading-5 text-red-600">{reply.error}</p>}
              {reply.status !== "SENT" && reply.staffId === data.staffId && <button type="button" disabled={busy || !data.mail.ready || message.isSpam || !reply.canRetry} onClick={() => void submit(reply)} className="mt-3 text-xs font-semibold text-blue-600 underline disabled:opacity-40">Reintentar este envío</button>}
            </article>)}
            {data.total > 20 && <div className="flex items-center justify-between text-xs text-slate-500"><button type="button" disabled={page === 1 || busy || loading} onClick={() => { setLoading(true); setPage(page - 1); }}>Más recientes</button><span>Página {page} de {Math.ceil(data.total / 20)}</span><button type="button" disabled={page * 20 >= data.total || busy || loading} onClick={() => { setLoading(true); setPage(page + 1); }}>Anteriores</button></div>}
            <p className="flex items-start gap-2 text-[11px] leading-5 text-slate-400"><CheckCheck size={14} className="mt-0.5 shrink-0" aria-hidden="true" />Enviado indica que Resend aceptó el mensaje. No confirma entrega ni lectura por el destinatario.</p>
          </section>
        </>}
      </div>}
    </div>
  );
}
