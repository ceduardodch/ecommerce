import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

type Media = { type: string; name?: string; mimeType?: string }
type Message = {
  id: string; direction: "in" | "out"; senderType?: string; text?: string; media?: Media
  status?: string; failedReason?: string; at?: string
}
type Conversation = {
  id: string; phone: string; status: string; mode: "ai" | "human"; assignedUserId?: string
  assignedUserName?: string; unreadCount: number; lastMessageAt?: string; lastInboundAt?: string
  metadata?: Record<string, unknown>
}
type Detail = { conversation: Conversation; messages: Message[]; notes: Array<{ id: string; body: string; authorUserName?: string; at?: string }> }
type Assignee = { id: string; name: string; email?: string }

const filters = [
  ["", "Abiertas"], ["new", "Nuevos"], ["ai", "IA atendiendo"], ["human", "Requiere humano"],
  ["unassigned", "Sin asignar"], ["waiting_customer", "Pendiente cliente"], ["closed", "Cerrados"],
] as const

function time(value?: string) {
  if (!value) return "Sin actividad"
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "short", timeStyle: "short" }).format(new Date(value))
}

function modeLabel(mode: Conversation["mode"]) { return mode === "human" ? "Humano" : "Vicky" }

function InboxPage() {
  const [rows, setRows] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string>()
  const [detail, setDetail] = useState<Detail>()
  const [filter, setFilter] = useState("")
  const [query, setQuery] = useState("")
  const [message, setMessage] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>()
  const [assignees, setAssignees] = useState<Assignee[]>([])
  const [assigneeId, setAssigneeId] = useState("")

  const loadQueue = useCallback(async () => {
    const params = new URLSearchParams({ limit: "80" })
    if (filter === "ai" || filter === "human") params.set("mode", filter)
    else if (filter === "unassigned") params.set("assigned", "unassigned")
    else if (filter) params.set("status", filter)
    if (query.trim()) params.set("q", query.trim())
    const response = await fetch(`/admin/b2b/crm/conversations?${params}`, { credentials: "include" })
    if (!response.ok) throw new Error("No se pudo cargar la bandeja.")
    const data = await response.json()
    setRows(data.conversations || [])
    setError(undefined)
  }, [filter, query])

  const loadDetail = useCallback(async (id: string) => {
    const response = await fetch(`/admin/b2b/crm/conversations/${id}`, { credentials: "include" })
    if (!response.ok) throw new Error("No se pudo abrir la conversación.")
    const data = await response.json()
    setDetail(data)
    setSelectedId(id)
  }, [])

  useEffect(() => { setLoading(true); loadQueue().catch((e) => setError(e.message)).finally(() => setLoading(false)) }, [loadQueue])
  useEffect(() => { fetch("/admin/b2b/crm/conversations/assignees", { credentials: "include" }).then((response) => response.ok ? response.json() : { users: [] }).then((data) => setAssignees(data.users || [])).catch(() => undefined) }, [])
  useEffect(() => { if (selectedId) loadDetail(selectedId).catch((e) => setError(e.message)) }, [selectedId, loadDetail])
  useEffect(() => {
    const stream = new EventSource("/admin/b2b/crm/inbox/stream", { withCredentials: true })
    stream.onmessage = () => { loadQueue().catch(() => undefined); if (selectedId) loadDetail(selectedId).catch(() => undefined) }
    stream.onerror = () => undefined
    const poll = window.setInterval(() => { loadQueue().catch(() => undefined) }, 60_000)
    return () => { stream.close(); window.clearInterval(poll) }
  }, [loadQueue, loadDetail, selectedId])

  async function patchConversation(input: Record<string, unknown>) {
    if (!detail) return
    setSaving(true)
    try {
      const response = await fetch(`/admin/b2b/crm/conversations/${detail.conversation.id}`, {
        method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "No se pudo guardar el cambio.")
      setDetail((current) => current ? { ...current, conversation: data.conversation } : current)
      await loadQueue()
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo guardar el cambio.") } finally { setSaving(false) }
  }

  async function sendMessage() {
    if (!detail || !message.trim()) return
    setSaving(true)
    try {
      const response = await fetch(`/admin/b2b/crm/conversations/${detail.conversation.id}/messages`, {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: message.trim() }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || data.error || "No se pudo enviar el mensaje.")
      setMessage("")
      await loadDetail(detail.conversation.id); await loadQueue()
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo enviar el mensaje.") } finally { setSaving(false) }
  }

  async function addNote() {
    if (!detail || !note.trim()) return
    setSaving(true)
    try {
      const response = await fetch(`/admin/b2b/crm/conversations/${detail.conversation.id}/notes`, {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: note.trim() }),
      })
      if (!response.ok) throw new Error("No se pudo guardar la nota.")
      setNote(""); await loadDetail(detail.conversation.id)
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo guardar la nota.") } finally { setSaving(false) }
  }

  const canReply = useMemo(() => Boolean(detail?.conversation.lastInboundAt && Date.now() - new Date(detail.conversation.lastInboundAt).getTime() <= 24 * 60 * 60 * 1000), [detail?.conversation.lastInboundAt])

  return <div style={{ padding: 20, maxWidth: 1520, margin: "0 auto" }}>
    <style>{`.inbox-grid{display:grid;grid-template-columns:minmax(260px,0.85fr) minmax(360px,1.45fr) minmax(230px,.7fr);min-height:680px;border:1px solid var(--border-base);border-radius:10px;overflow:hidden}.inbox-pane{min-width:0;border-right:1px solid var(--border-base);background:var(--bg-base)}.inbox-pane:last-child{border-right:0}.inbox-list{max-height:640px;overflow:auto}.inbox-row{width:100%;border:0;border-bottom:1px solid var(--border-base);background:transparent;text-align:left;padding:12px;cursor:pointer}.inbox-row:hover,.inbox-row[aria-current=true]{background:var(--bg-subtle)}.bubble{max-width:78%;padding:10px 12px;border-radius:12px;margin:8px 0;white-space:pre-wrap}.bubble.in{background:var(--bg-subtle)}.bubble.out{background:#dbeafe;margin-left:auto}.toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.input{box-sizing:border-box;width:100%;border:1px solid var(--border-base);border-radius:7px;padding:9px;background:var(--bg-base);color:var(--fg-base)}.button{border:1px solid var(--border-base);border-radius:7px;background:var(--bg-base);padding:8px 10px;cursor:pointer;color:var(--fg-base)}.button.primary{background:#155eef;color:white;border-color:#155eef}.muted{color:var(--fg-subtle);font-size:12px}@media(max-width:900px){.inbox-grid{grid-template-columns:1fr;min-height:0}.inbox-pane{border-right:0;border-bottom:1px solid var(--border-base)}.inbox-list{max-height:280px}.context-pane{display:none}}`}</style>
    <header style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
      <div><h1 style={{ margin: 0 }}>Bandeja WhatsApp</h1><p className="muted">Vicky atiende por defecto. Al tomar un caso, se pausa hasta liberarlo.</p></div>
      <Link className="button" to="/crm-whatsapp">Volver al CRM</Link>
    </header>
    <div className="toolbar" style={{ marginBottom: 12 }} aria-label="Filtros de conversaciones">
      {filters.map(([value, label]) => <button className="button" aria-pressed={filter === value} onClick={() => setFilter(value)} key={value}>{label}</button>)}
      <label style={{ marginLeft: "auto", minWidth: 220 }}><span className="muted">Buscar por teléfono</span><input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="+593…" /></label>
    </div>
    {error ? <div role="alert" style={{ marginBottom: 12, padding: 10, borderRadius: 7, background: "#fff1f0" }}>{error} <button className="button" onClick={() => { loadQueue().catch((e) => setError(e.message)); if (selectedId) loadDetail(selectedId).catch((e) => setError(e.message)) }}>Reintentar</button></div> : null}
    <main className="inbox-grid">
      <section className="inbox-pane" aria-label="Cola de conversaciones"><div style={{ padding: 12, borderBottom: "1px solid var(--border-base)" }}><strong>Conversaciones</strong><span className="muted"> · {rows.length}</span></div><div className="inbox-list">
        {loading ? <p style={{ padding: 12 }}>Cargando…</p> : null}
        {!loading && !rows.length ? <p style={{ padding: 12 }}>No hay conversaciones en este filtro.</p> : null}
        {rows.map((row) => <button key={row.id} className="inbox-row" aria-current={selectedId === row.id} onClick={() => loadDetail(row.id).catch((e) => setError(e.message))}><div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}><strong>{row.phone}</strong>{row.unreadCount ? <span aria-label={`${row.unreadCount} no leídos`} style={{ background: "#155eef", color: "white", borderRadius: 99, padding: "1px 7px" }}>{row.unreadCount}</span> : null}</div><div className="muted">{modeLabel(row.mode)} · {row.assignedUserName || "Sin asignar"}</div><div className="muted">{time(row.lastMessageAt)}</div></button>)}
      </div></section>
      <section className="inbox-pane" aria-live="polite">
        {!detail ? <p style={{ padding: 20 }}>Elige una conversación para ver sus mensajes.</p> : <>
          <div style={{ padding: 14, borderBottom: "1px solid var(--border-base)" }}><strong>{detail.conversation.phone}</strong><div className="muted">{detail.conversation.status} · {modeLabel(detail.conversation.mode)} · última entrada {time(detail.conversation.lastInboundAt)}</div></div>
          <div style={{ padding: 14, minHeight: 400, maxHeight: 470, overflow: "auto" }}>{detail.messages.map((item) => <div className={`bubble ${item.direction === "out" ? "out" : "in"}`} key={item.id}><div className="muted">{item.direction === "out" ? (item.senderType === "human" ? "Equipo" : "Vicky") : "Cliente"} · {time(item.at)}</div>{item.text ? <div>{item.text}</div> : null}{item.media ? <a href={`/admin/b2b/crm/conversations/${detail.conversation.id}/media/${item.id}`} target="_blank" rel="noreferrer">Abrir {item.media.name || item.media.type}</a> : null}<div className="muted">{item.status || "recibido"}{item.failedReason ? ` · ${item.failedReason}` : ""}</div></div>)}</div>
          <div style={{ padding: 14, borderTop: "1px solid var(--border-base)" }}>{canReply ? <><label htmlFor="reply" className="muted">Respuesta manual</label><textarea id="reply" className="input" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => { if (e.ctrlKey && e.key === "Enter") sendMessage() }} placeholder="Escribe una respuesta (Ctrl + Enter para enviar)" /><div className="toolbar" style={{ marginTop: 8 }}><button disabled={saving || !message.trim()} className="button primary" onClick={sendMessage}>Enviar</button><span className="muted">Ventana de 24 horas activa.</span></div></> : <div role="status" style={{ padding: 8, background: "#fff7e6", borderRadius: 7 }}>Requiere plantilla aprobada: la ventana de 24 horas ya cerró.</div>}</div>
        </>}
      </section>
      <aside className="inbox-pane context-pane" aria-label="Contexto comercial" style={{ padding: 14 }}>
        {!detail ? <p className="muted">Aquí verás responsable, modo y notas internas.</p> : <><h2 style={{ fontSize: 16, marginTop: 0 }}>Control</h2><p><strong>Responsable:</strong><br />{detail.conversation.assignedUserName || "Sin asignar"}</p><div className="toolbar"><button className="button primary" disabled={saving} onClick={() => patchConversation({ mode: "human", assignToCurrentUser: true, status: "assigned" })}>Tomar caso</button><button className="button" disabled={saving} onClick={() => patchConversation({ mode: "ai", clearAssignment: true, status: "ai_active" })}>Liberar a Vicky</button><button className="button" disabled={saving} onClick={() => patchConversation({ status: "closed" })}>Cerrar</button></div><label className="muted" style={{ display: "block", marginTop: 12 }}>Asignar a vendedor<select className="input" value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}><option value="">Elegir vendedor</option>{assignees.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label><button className="button" disabled={saving || !assigneeId} style={{ marginTop: 8 }} onClick={() => { const user = assignees.find((item) => item.id === assigneeId); if (user) patchConversation({ mode: "human", status: "assigned", assignedUserId: user.id, assignedUserName: user.name }) }}>Reasignar</button><h2 style={{ fontSize: 16, marginTop: 22 }}>Notas internas</h2><div>{detail.notes.length ? detail.notes.map((item) => <div key={item.id} style={{ borderTop: "1px solid var(--border-base)", padding: "8px 0" }}><div>{item.body}</div><div className="muted">{item.authorUserName || "Equipo"} · {time(item.at)}</div></div>) : <p className="muted">Sin notas.</p>}</div><textarea aria-label="Nueva nota interna" className="input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota interna: nunca se envía por WhatsApp" /><button className="button" disabled={saving || !note.trim()} style={{ marginTop: 8 }} onClick={addNote}>Guardar nota</button></>}
      </aside>
    </main>
  </div>
}

export const config = defineRouteConfig({ label: "Bandeja WhatsApp", rank: 71 })
export default InboxPage
