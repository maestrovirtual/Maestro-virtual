"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";

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
  const buttonClass = "rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-primary/10 disabled:opacity-50";

  return (
    <section aria-labelledby="inbox-title">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 id="inbox-title" className="text-3xl font-bold text-text-primary">Mensajes de contacto</h1>
          <p className="mt-2 text-text-secondary">Revisa los mensajes recibidos, del más reciente al más antiguo.</p>
        </div>
        <button className={buttonClass} disabled={loading || pendingId !== null} onClick={reload}>Actualizar</button>
      </div>
      {error && <div role="alert" className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">{error} <button className="underline" disabled={loading || pendingId !== null} onClick={reload}>Reintentar</button></div>}
      {loading ? <p role="status">Cargando mensajes…</p> : inbox && (
        <>
          <p className="mb-4 text-sm text-text-secondary">{inbox.total} mensajes recibidos</p>
          {inbox.messages.length === 0 ? <p className="rounded-xl border border-border bg-surface p-8">No hay mensajes en esta página.</p> : (
            <ul className="space-y-3">
              {inbox.messages.map(message => (
                <li key={message.id} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <button className="min-w-0 text-left" aria-expanded={selectedId === message.id} onClick={() => setSelectedId(selectedId === message.id ? null : message.id)}>
                      <span className="block font-semibold text-text-primary">{message.subject || "Sin asunto"}</span>
                      <span className="block break-all text-sm text-text-secondary">{message.name} · {message.email}</span>
                    </button>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${message.isRead ? "bg-slate-100 text-slate-600" : "bg-blue-100 text-blue-800"}`}>{message.isRead ? "Leído" : "No leído"}</span>
                  </div>
                  <time dateTime={message.date} className="mt-2 block text-sm text-text-secondary">{new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "America/Monterrey" }).format(new Date(message.date))}</time>
                  {selected?.id === message.id && <div className="mt-4 border-t border-border pt-4"><p className="whitespace-pre-wrap break-words text-text-primary">{message.message}</p><a href={`mailto:${message.email}`} className="mt-3 inline-block text-primary underline">Responder por correo</a></div>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className={buttonClass} onClick={() => setSelectedId(selectedId === message.id ? null : message.id)}>{selectedId === message.id ? "Cerrar mensaje" : "Ver mensaje"}</button>
                    <button className={buttonClass} disabled={pendingId !== null} onClick={() => void toggleRead(message)}>{pendingId === message.id ? "Guardando…" : message.isRead ? "Marcar como no leído" : "Marcar como leído"}</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <nav aria-label="Páginas de mensajes" className="mt-6 flex items-center gap-4">
            <button className={buttonClass} disabled={page === 1 || pendingId !== null} onClick={() => changePage(page - 1)}>Anterior</button>
            <span>Página {page} de {pages}</span>
            <button className={buttonClass} disabled={page >= pages || pendingId !== null} onClick={() => changePage(page + 1)}>Siguiente</button>
          </nav>
        </>
      )}
    </section>
  );
}
