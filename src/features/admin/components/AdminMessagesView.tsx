"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { ArrowDownWideNarrow, ArrowUpRight, CheckCheck, ChevronDown, ChevronLeft, ChevronRight, Inbox as InboxIcon, Mail, MailOpen, RefreshCw } from "lucide-react";

type ContactMessage = {
  id: string; name: string; email: string; subject: string;
  message: string; date: string; isRead: boolean;
};
type Inbox = { messages: ContactMessage[]; total: number; page: number; pageSize: number };

export default function AdminMessagesView() {
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const [inbox, setInbox] = useState<Inbox | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(`/api/admin/messages?page=${page}`, { cache: "no-store", signal });
      if (!response.ok) throw new Error(response.status === 401 || response.status === 403
        ? "Tu sesión terminó o no tienes acceso. Vuelve a iniciar sesión."
        : "No se pudieron cargar los mensajes. Intenta de nuevo.");
      const data: Inbox = await response.json();
      if (!signal?.aborted) setInbox(data);
    } catch (err) {
      if (!signal?.aborted) setError(err instanceof Error ? err.message : "Error al cargar mensajes.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) return load(controller.signal);
    });
    return () => controller.abort();
  }, [load]);

  function reload() {
    setLoading(true);
    setError("");
    void load();
  }

  function changePage(nextPage: number) {
    setLoading(true);
    setError("");
    setSelectedId(null);
    setPage(nextPage);
  }

  async function toggleRead(message: ContactMessage) {
    setPendingId(message.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/messages/${encodeURIComponent(message.id)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !message.isRead }),
      });
      if (!response.ok) throw new Error("No se pudo cambiar el estado. Intenta de nuevo.");
      const updated: { isRead: boolean } = await response.json();
      setInbox(current => current && ({ ...current, messages: current.messages.map(item =>
        item.id === message.id ? { ...item, isRead: updated.isRead } : item) }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el mensaje.");
    } finally { setPendingId(null); }
  }

  const selected = inbox?.messages.find(message => message.id === selectedId);
  const pages = Math.max(1, Math.ceil((inbox?.total ?? 0) / (inbox?.pageSize ?? 20)));
  const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40";
  const formatDate = (date: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "America/Monterrey" }).format(new Date(date));

  return (
    <section aria-labelledby="inbox-title" className="mx-auto w-full max-w-6xl">
      <div className="mb-8 text-xs font-semibold tracking-wide text-slate-400">PANEL DE ADMINISTRACIÓN <span className="mx-2 text-slate-300">/</span> <span className="text-slate-600">MENSAJES</span></div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-5">
        <div>
          <h1 id="inbox-title" className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Mensajes de contacto<span className="text-blue-600">.</span></h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Un espacio para escuchar, conectar y dar seguimiento a tu comunidad.</p>
        </div>
        <button className={buttonClass} disabled={loading || pendingId !== null} onClick={reload}><RefreshCw size={16} className={loading ? "animate-spin" : ""} aria-hidden="true" />Actualizar</button>
      </div>
      {error && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error} <button className="font-semibold underline" disabled={loading || pendingId !== null} onClick={reload}>Reintentar</button></div>}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_-12px_rgba(15,23,42,0.12)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><InboxIcon size={18} aria-hidden="true" /></div>
            <h2 className="text-sm font-semibold text-slate-900">Bandeja de entrada</h2>
            {inbox && <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-500">{inbox.total}</span>}
          </div>
          <span className="flex items-center gap-2 text-xs text-slate-400"><ArrowDownWideNarrow size={14} aria-hidden="true" />Más recientes primero</span>
        </div>
        {loading ? <div role="status" className="space-y-6 p-7"><span className="sr-only">Cargando mensajes…</span>{[1, 2, 3].map(item => <div key={item} aria-hidden="true" className="flex animate-pulse gap-4 motion-reduce:animate-none"><div className="h-10 w-10 rounded-full bg-slate-100" /><div className="flex-1 space-y-3"><div className="h-3 w-1/3 rounded bg-slate-100" /><div className="h-3 w-2/3 rounded bg-slate-50" /></div></div>)}</div> : inbox && (
          <>
            {inbox.messages.length === 0 ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-14 text-center sm:min-h-[420px]">
                <div className="relative mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50/70">
                  <div className="flex h-16 w-16 -rotate-6 items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-500 shadow-sm"><Mail size={30} strokeWidth={1.5} aria-hidden="true" /></div>
                  <div className="absolute right-0 bottom-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-emerald-100 text-emerald-600"><CheckCheck size={15} aria-hidden="true" /></div>
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">{inbox.total === 0 ? "Todo listo para tu primer mensaje" : "No hay mensajes en esta página"}</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">{inbox.total === 0 ? "Cuando alguien te escriba desde el formulario de contacto, su mensaje aparecerá aquí." : "Regresa a la página anterior para consultar los mensajes recibidos."}</p>
                <p className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs text-slate-400"><MailOpen size={14} aria-hidden="true" />{inbox.total} mensajes recibidos</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {inbox.messages.map(message => {
                  const isSelected = selected?.id === message.id;
                  return (
                    <li key={message.id} className={`border-l-[3px] transition-colors ${!message.isRead ? "border-l-blue-500 bg-blue-50/30" : "border-l-transparent"}`}>
                      <button className="flex w-full items-start gap-3 px-4 py-5 text-left transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 sm:gap-4 sm:px-6" aria-expanded={isSelected} aria-controls={`message-${message.id}`} onClick={() => setSelectedId(isSelected ? null : message.id)}>
                        <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${message.isRead ? "bg-slate-100 text-slate-500" : "bg-blue-100 text-blue-700"}`} aria-hidden="true">{message.name.trim().charAt(0).toUpperCase()}</span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1"><span className="text-sm font-semibold text-slate-800">{message.name}</span><time dateTime={message.date} className="text-xs font-normal text-slate-400">{formatDate(message.date)}</time></span>
                          <span className={`mt-1 block truncate text-sm ${message.isRead ? "text-slate-600" : "font-semibold text-slate-900"}`}>{message.subject || "Sin asunto"}</span>
                          <span className="mt-1 block truncate text-xs leading-5 text-slate-400">{message.email}</span>
                          <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500"><span className={`h-1.5 w-1.5 rounded-full ${message.isRead ? "bg-slate-300" : "bg-blue-500"}`} />{message.isRead ? "Leído" : "No leído"}</span>
                        </span>
                        <ChevronDown size={16} className={`mt-1 shrink-0 text-slate-400 transition-transform ${isSelected ? "rotate-180" : ""}`} aria-hidden="true" />
                        <span className="sr-only">{isSelected ? "Cerrar mensaje" : "Ver mensaje"}</span>
                      </button>
                      {isSelected && <div id={`message-${message.id}`} className="mx-4 mb-5 rounded-xl border border-slate-200 bg-white p-5 sm:ml-20 sm:mr-6 sm:p-6"><p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">{message.message}</p><a href={`mailto:${message.email}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800">Responder por correo<ArrowUpRight size={15} aria-hidden="true" /></a></div>}
                      <div className="flex justify-end px-5 pb-4 sm:px-7"><button className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-40" disabled={pendingId !== null} onClick={() => void toggleRead(message)}>{message.isRead ? <Mail size={14} aria-hidden="true" /> : <CheckCheck size={14} aria-hidden="true" />}{pendingId === message.id ? "Guardando…" : message.isRead ? "Marcar como no leído" : "Marcar como leído"}</button></div>
                    </li>
                  );
                })}
              </ul>
            )}
            {inbox.total > 0 && <nav aria-label="Páginas de mensajes" className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-7">
              <span className="text-xs text-slate-400">Página {page} de {pages} · {inbox.total} mensajes</span>
              <div className="flex gap-2"><button className={buttonClass} disabled={page === 1 || pendingId !== null} onClick={() => changePage(page - 1)}><ChevronLeft size={14} aria-hidden="true" />Anterior</button><button className={buttonClass} disabled={page >= pages || pendingId !== null} onClick={() => changePage(page + 1)}>Siguiente<ChevronRight size={14} aria-hidden="true" /></button></div>
            </nav>}
          </>
        )}
      </div>
      <p className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400"><CheckCheck size={14} aria-hidden="true" />Solo el staff puede consultar esta bandeja.</p>
    </section>
  );
}
