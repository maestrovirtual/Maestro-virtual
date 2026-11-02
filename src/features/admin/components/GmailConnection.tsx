"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link2, RefreshCw, Unplug } from "lucide-react";

type Status = { provider: string; configured: boolean; account: string; connected: boolean; mailbox: { email: string; lastSyncedAt: string | null; lastError: string | null } | null };
export default function GmailConnection({ onSynced, paused }: { onSynced: () => void | Promise<void>; paused: boolean }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const running = useRef(false);
  const load = useCallback(async () => {
    const response = await fetch("/api/admin/mailbox/gmail", { cache: "no-store" });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "No se pudo consultar Gmail");
    setStatus(json);
    return json as Status;
  }, []);
  const sync = useCallback(async () => {
    if (running.current || paused) return;
    running.current = true;
    setBusy(true);
    setError("");
    try {
      const current = await load();
      if (!current.connected) return;
      let imported = 0;
      let more = false;
      for (let batch = 0; batch < 3; batch++) {
        const response = await fetch("/api/admin/mailbox/gmail", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}", signal: AbortSignal.timeout(65000) });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || "No se pudo sincronizar Gmail");
        imported += json.imported || 0;
        more = !!json.more;
        if (!more || json.busy) break;
      }
      await onSynced();
      await load();
      setNotice(more ? "La sincronización continuará en la siguiente consulta." : imported ? `${imported} respuesta(s) recibida(s) en el panel.` : "Correo actualizado.");
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo sincronizar Gmail"); }
    finally { setBusy(false); running.current = false; }
  }, [load, onSynced, paused]);
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => { if (active) return load(); }).then(current => {
      if (!active) return;
      const result = new URLSearchParams(window.location.search).get("gmail");
      if (result === "connected" && current?.connected) setNotice("Cuenta institucional conectada. Ya puedes enviar y sincronizar respuestas.");
      else if (result) setError(result === "wrong_account" ? "Selecciona la cuenta institucional configurada, no tu cuenta personal." : result === "cancelled" ? "La conexión con Google fue cancelada." : "No se pudo autorizar Gmail. Revisa las credenciales, la URI y los permisos y vuelve a conectar.");
    }).catch(err => { if (active) setError(err instanceof Error ? err.message : "No se pudo consultar Gmail"); });
    return () => { active = false; };
  }, [load]);
  useEffect(() => {
    if (!status?.connected || paused) return;
    let active = true;
    const refresh = () => { if (active && !document.hidden) void sync(); };
    void Promise.resolve().then(refresh);
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [status?.connected, paused, sync]);
  async function disconnect() {
    if (!window.confirm("¿Desconectar el correo institucional? El historial del panel se conservará.")) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/mailbox/gmail", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: "{}" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "No se pudo desconectar");
      await load();
      setNotice("Gmail desconectado. El historial se conserva.");
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo desconectar Gmail"); }
    finally { setBusy(false); }
  }
  return <section aria-label="Conexión de correo institucional" className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
    <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${status?.connected ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}><Link2 size={19} aria-hidden="true" /></span><div className="min-w-0"><h2 className="text-sm font-semibold text-slate-800">Correo institucional · Gmail</h2><p className="mt-1 break-all text-xs text-slate-500">{status?.connected ? status.mailbox?.email : status?.account || "Consultando conexión…"}</p></div></div>
    <div className="flex flex-wrap gap-3">{status?.connected ? <><button type="button" disabled={busy || paused} onClick={() => void sync()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><RefreshCw size={14} className={busy ? "animate-spin" : ""} aria-hidden="true" />{busy ? "Sincronizando…" : "Sincronizar correo"}</button><button type="button" disabled={busy || paused} onClick={() => void disconnect()} className="inline-flex items-center gap-2 px-2 py-2 text-xs text-slate-400 hover:text-red-600 disabled:opacity-40"><Unplug size={13} aria-hidden="true" />Desconectar</button></> : <form action="/api/admin/mailbox/gmail/connect" method="get"><button type="submit" disabled={!status?.configured || paused} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">Conectar Gmail</button></form>}</div></div>
    <p className="mt-3 text-xs leading-6 text-slate-400">{status?.connected ? "Las contestaciones a conversaciones enviadas desde el panel se consultan cada minuto mientras está abierto. Puedes sincronizar ahora." : "Autoriza la cuenta institucional en Google para enviar desde Gmail y traer sus contestaciones a esta conversación. No necesitas compartir su contraseña."}</p>
    {status && !status.configured && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-800">Falta preparar la conexión de Google. El responsable del sitio debe configurar Gmail API; después podrás autorizar la cuenta institucional.</p>}
    {notice && <p role="status" className="mt-2 text-xs leading-6 text-emerald-700">{notice}</p>}
    {status?.connected && status.configured && (error || status.mailbox?.lastError) && <form action="/api/admin/mailbox/gmail/connect" method="get" className="mt-2"><button type="submit" disabled={busy || paused} className="text-xs font-semibold text-blue-600 underline">Volver a autorizar Gmail</button></form>}
    {(error || status?.mailbox?.lastError) && <p role="alert" className="mt-2 text-xs leading-6 text-red-600">{error || status?.mailbox?.lastError}</p>}
    {status?.mailbox?.lastSyncedAt && <p className="mt-2 text-[10px] text-slate-400">Última sincronización: {new Intl.DateTimeFormat("es-MX", { dateStyle: "short", timeStyle: "short", timeZone: "America/Monterrey" }).format(new Date(status.mailbox.lastSyncedAt))}</p>}
  </section>;
}
