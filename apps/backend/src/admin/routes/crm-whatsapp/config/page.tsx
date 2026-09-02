import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

type Setting = {
  key: string
  label: string
  help: string
  group: "pago" | "marca" | "comercial"
  kind: "text" | "number" | "phone" | "url" | "boolean"
  publico: boolean
  value: string
  isDefault?: boolean
  updatedAt?: string
}
type SettingsResponse = { items: Setting[]; warning?: string; errorId?: string; error?: string }

const GROUPS: Array<{ id: Setting["group"]; title: string; hint: string }> = [
  {
    id: "pago",
    title: "Formas de pago",
    hint: "Vicky lee estos datos antes de dictar una cuenta. El número de cuenta nunca se publica en la web: solo lo entrega por WhatsApp.",
  },
  {
    id: "marca",
    title: "Marca y contacto",
    hint: "El Instagram se usa como prueba de confianza (videos de despacho) y el número recibe los CTA de la web y las campañas.",
  },
  {
    id: "comercial",
    title: "Condiciones comerciales",
    hint: "Cupón, IVA y marca del catálogo Meta. El IVA entra en la cotización y en el desglose que exige Datafast.",
  },
]

const card = { border: "1px solid var(--border-base)", borderRadius: 8, background: "var(--bg-base)", padding: 16 }
const input = { border: "1px solid var(--border-base)", borderRadius: 6, background: "var(--bg-field)", color: "var(--fg-base)", padding: "8px 10px", fontSize: 13 }

function CommerceSettingsPage() {
  const [items, setItems] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [warning, setWarning] = useState("")

  const load = async () => {
    setLoading(true)
    try {
      const response = await fetch("/admin/b2b/crm/commerce-settings", { credentials: "include" })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const payload = await response.json() as SettingsResponse
      setItems(payload.items)
      setWarning(payload.warning ? `${payload.warning}${payload.errorId ? ` (${payload.errorId})` : ""}` : "")
      setMessage("")
    } catch (error) {
      setMessage(error instanceof Error ? `No se pudo cargar: ${error.message}` : "No se pudo cargar.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const change = (key: string, value: string) =>
    setItems((current) => current.map((item) => item.key === key ? { ...item, value } : item))

  const save = async () => {
    setSaving(true)
    setMessage("")
    try {
      const response = await fetch("/admin/b2b/crm/commerce-settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map(({ key, value }) => ({ key, value })) }),
      })
      const payload = await response.json() as SettingsResponse
      if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`)
      setItems(payload.items || items)
      setMessage("Configuración guardada. Vicky y la web la toman en pocos minutos, sin redeploy.")
    } catch (error) {
      setMessage(error instanceof Error ? `No se pudo guardar: ${error.message}` : "No se pudo guardar.")
    } finally {
      setSaving(false)
    }
  }

  return <div style={{ padding: 24, maxWidth: 920 }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 16 }}>
      <div>
        <h1 style={{ margin: 0 }}>Configuración comercial</h1>
        <p style={{ margin: "8px 0 0" }}>Datos de negocio que antes vivían en variables del servidor. Cambiarlos aquí no necesita redeploy.</p>
      </div>
      <Link to="/crm-whatsapp">Volver al CRM</Link>
    </div>

    {message ? <p role="status">{message}</p> : null}
    {warning ? <p role="status" style={{ ...card, borderColor: "#b36b00" }}>{warning} <button type="button" onClick={() => void load()} style={{ ...input, marginLeft: 8, cursor: "pointer" }}>Reintentar</button></p> : null}

    {loading ? <p>Cargando…</p> : <>
      {GROUPS.map((group) => {
        const groupItems = items.filter((item) => item.group === group.id)
        if (!groupItems.length) return null
        return <section key={group.id} style={{ ...card, marginBottom: 18 }} aria-label={group.title}>
          <strong>{group.title}</strong>
          <p style={{ margin: "6px 0 14px", fontSize: 13 }}>{group.hint}</p>
          {groupItems.map((item) => <div key={item.key} style={{ marginBottom: 14 }}>
            <label htmlFor={item.key} style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              {item.label}
              {item.publico ? null : <span style={{ marginLeft: 8, fontWeight: 400, fontSize: 12 }}>· privado</span>}
            </label>
            {item.kind === "boolean"
              ? <select id={item.key} value={item.value} onChange={(event) => change(item.key, event.target.value)} style={{ ...input, minWidth: 260 }}>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              : <input
                  id={item.key}
                  value={item.value}
                  onChange={(event) => change(item.key, event.target.value)}
                  style={{ ...input, width: "100%", boxSizing: "border-box" }}
                  placeholder={item.kind === "number" ? "0.15" : ""}
                />}
            <p style={{ margin: "4px 0 0", fontSize: 12 }}>{item.help}</p>
          </div>)}
        </section>
      })}
      <button type="button" onClick={() => void save()} disabled={saving} style={{ ...input, cursor: "pointer", background: "var(--bg-subtle)" }}>
        {saving ? "Guardando…" : "Guardar configuración"}
      </button>
    </>}
  </div>
}

export const config = defineRouteConfig({ label: "Configuración", rank: 72 })
export default CommerceSettingsPage
