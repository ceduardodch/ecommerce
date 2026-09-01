import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

type Rule = { key: string; label: string; body: string; active: boolean; updatedAt?: string }
type PlaybookResponse = { items: Rule[]; warning?: string; errorId?: string }

const card = { border: "1px solid var(--border-base)", borderRadius: 8, background: "var(--bg-base)", padding: 16 }
const input = { border: "1px solid var(--border-base)", borderRadius: 6, background: "var(--bg-field)", color: "var(--fg-base)", padding: "8px 10px", fontSize: 13 }
const textarea = { ...input, width: "100%", minHeight: 95, fontFamily: "inherit", resize: "vertical" as const, boxSizing: "border-box" as const }

function AgentPlaybookPage() {
  const [items, setItems] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [warning, setWarning] = useState("")

  const load = async () => {
    setLoading(true)
    try {
      const response = await fetch("/admin/b2b/crm/agent-playbook", { credentials: "include" })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const payload = await response.json() as PlaybookResponse
      setItems(payload.items)
      setWarning(payload.warning ? `${payload.warning}${payload.errorId ? ` (${payload.errorId})` : ""}` : "")
      void fetch("/admin/b2b/crm/dashboard", { credentials: "include" })
        .then((r) => r.ok ? r.json() : undefined)
        .then((dashboard) => setCounts({
          Mensaje: Number(dashboard?.recentEvents?.filter((event: any) => event.type === "message_in").length || 0),
          Producto: Number(dashboard?.recentEvents?.filter((event: any) => event.type === "quote_created").length || 0),
          Carrito: Number(dashboard?.recentEvents?.filter((event: any) => event.type === "cart_link_sent").length || 0),
          Pago: Number(dashboard?.pendingOrders?.length || 0),
          Venta: Number(dashboard?.paidOrders?.length || 0),
          Humano: Number(dashboard?.recentEvents?.filter((event: any) => event.type === "human_handoff").length || 0),
        }))
        .catch(() => undefined)
      setMessage("")
    } catch (error) {
      setMessage(error instanceof Error ? `No se pudo cargar: ${error.message}` : "No se pudo cargar.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const change = (key: string, patch: Partial<Rule>) =>
    setItems((current) => current.map((item) => item.key === key ? { ...item, ...patch } : item))

  const save = async () => {
    setSaving(true)
    setMessage("")
    try {
      const response = await fetch("/admin/b2b/crm/agent-playbook", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      })
      const payload = await response.json() as { items?: Rule[]; error?: string }
      if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`)
      setItems(payload.items || items)
      setMessage("Cambios guardados. Vicky los toma en sus siguientes mensajes.")
    } catch (error) {
      setMessage(error instanceof Error ? `No se pudo guardar: ${error.message}` : "No se pudo guardar.")
    } finally {
      setSaving(false)
    }
  }

  return <div style={{ padding: 24, maxWidth: 920 }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 16 }}>
      <div>
        <h1 style={{ margin: 0 }}>Guión de Vicky</h1>
        <p style={{ margin: "8px 0 0" }}>Reglas que la IA recibe junto al mensaje y catálogo real. No pongas precios, stock ni promesas que deban confirmarse.</p>
      </div>
      <Link to="/admin/crm-whatsapp">Volver al CRM</Link>
    </div>

    <section style={{ ...card, marginBottom: 18 }} aria-label="Mapa operativo de venta">
      <strong>Mapa operativo</strong>
      <p style={{ margin: "8px 0" }}>Mensaje → Producto → Datos → Carrito → Checkout DataFast → Pago / Humano</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {Object.entries(counts).map(([label, count]) => <span key={label} style={{ ...input, background: "var(--bg-subtle)" }}>{label}: {count}</span>)}
      </div>
      <p style={{ margin: "12px 0 0", fontSize: 13 }}>Vicky pide producto, cantidad, nombre y ciudad. Envía un carrito temporal para revisar antes del checkout. DataFast cobra la tarjeta; factura, descuentos, garantía, envío urgente y stock exacto pasan a una persona.</p>
      <Link to="/admin/crm-whatsapp/leads" style={{ display: "inline-block", marginTop: 10, fontSize: 13 }}>Ver leads por etapa</Link>
    </section>

    {message ? <p role="status">{message}</p> : null}
    {warning ? <p role="status" style={{ ...card, borderColor: "#b36b00" }}>{warning} <button type="button" onClick={() => void load()} style={{ ...input, marginLeft: 8, cursor: "pointer" }}>Reintentar</button></p> : null}
    {loading ? <p>Cargando…</p> : <>
      {items.map((item) => <section key={item.key} style={{ ...card, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 10 }}>
          <input aria-label={`Nombre ${item.label}`} value={item.label} onChange={(event) => change(item.key, { label: event.target.value })} style={{ ...input, minWidth: 260 }} />
          <label><input type="checkbox" checked={item.active} onChange={(event) => change(item.key, { active: event.target.checked })} /> Usar esta regla</label>
        </div>
        <textarea aria-label={`Regla ${item.label}`} value={item.body} onChange={(event) => change(item.key, { body: event.target.value })} style={textarea} />
      </section>)}
      <button type="button" onClick={() => void save()} disabled={saving} style={{ ...input, cursor: "pointer", background: "var(--bg-subtle)" }}>
        {saving ? "Guardando…" : "Guardar guión"}
      </button>
    </>}
  </div>
}

export const config = defineRouteConfig({ label: "Guión IA", rank: 71 })
export default AgentPlaybookPage
