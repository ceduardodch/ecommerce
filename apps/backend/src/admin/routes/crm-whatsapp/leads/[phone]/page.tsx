import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useCallback, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

type CustomerEvent = {
  type: string
  at?: string
  payload?: unknown
  orderId?: string
  source?: string
}

type CustomerDetail = {
  phone: string
  name?: string
  email?: string
  whatsappConsent?: boolean
  tags?: string[]
  city?: string
  journeyStage?: string
  campaignSlug?: string
  lastPurchaseAt?: string
  nextFollowupAt?: string
  followupReason?: string
  suggestedFrequencyDays?: number
  suggestedMessage?: string
  purchasedProducts?: Array<{
    sku?: string
    title?: string
    quantity?: number
    purchasedAt?: string
    reorderAfterDays?: number
  }>
  events?: CustomerEvent[]
}

const cardStyle = {
  border: "1px solid var(--border-base)",
  borderRadius: 8,
  background: "var(--bg-base)",
  padding: 16,
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  fontSize: 13,
}

const cellStyle = {
  borderTop: "1px solid var(--border-base)",
  padding: "8px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
}

const inputStyle = {
  border: "1px solid var(--border-base)",
  borderRadius: 6,
  background: "var(--bg-field)",
  color: "var(--fg-base)",
  padding: "8px 10px",
  fontSize: 13,
  width: "100%",
  boxSizing: "border-box" as const,
}

const buttonStyle = {
  border: "1px solid var(--border-base)",
  borderRadius: 6,
  background: "var(--bg-subtle)",
  color: "var(--fg-base)",
  padding: "8px 12px",
  fontSize: 13,
  cursor: "pointer",
}

const labelStyle = {
  fontSize: 12,
  color: "var(--fg-subtle)",
  display: "block",
  marginBottom: 4,
}

function formatDate(value?: string) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function toDateInput(value?: string) {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

function LeadDetailPage() {
  const { phone = "" } = useParams<{ phone: string }>()
  const apiBase = `/admin/b2b/crm/customers/${encodeURIComponent(phone)}`

  const [customer, setCustomer] = useState<CustomerDetail | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [status, setStatus] = useState<string | undefined>()

  const [form, setForm] = useState({
    name: "",
    email: "",
    tags: "",
    journeyStage: "",
    whatsappConsent: false,
    nextFollowupAt: "",
    followupReason: "",
  })
  const [note, setNote] = useState("")
  const [purchase, setPurchase] = useState({
    title: "",
    sku: "",
    quantity: "1",
    reorderAfterDays: "",
  })

  const load = useCallback(() => {
    fetch(apiBase, { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<{ customer: CustomerDetail }>
      })
      .then(({ customer: data }) => {
        setCustomer(data)
        setError(undefined)
        setForm({
          name: data.name || "",
          email: data.email || "",
          tags: (data.tags || []).join(", "),
          journeyStage: data.journeyStage || "",
          whatsappConsent: Boolean(data.whatsappConsent),
          nextFollowupAt: toDateInput(data.nextFollowupAt),
          followupReason: data.followupReason || "",
        })
      })
      .catch((cause: Error) => setError(cause.message))
  }, [apiBase])

  useEffect(() => {
    load()
  }, [load])

  async function call(path: string, method: string, body: unknown) {
    setStatus("Guardando...")
    try {
      const response = await fetch(path, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}))
        throw new Error(detail.error || `HTTP ${response.status}`)
      }
      setStatus("Guardado ✓")
      load()
    } catch (cause) {
      setStatus(`Error: ${cause instanceof Error ? cause.message : cause}`)
    }
  }

  function saveProfile() {
    call(apiBase, "PATCH", {
      name: form.name,
      email: form.email,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      whatsappConsent: form.whatsappConsent,
      nextFollowupAt: form.nextFollowupAt
        ? new Date(`${form.nextFollowupAt}T12:00:00`).toISOString()
        : null,
      followupReason: form.followupReason || undefined,
      metadata: { journeyStage: form.journeyStage || undefined },
    })
  }

  function addNote() {
    if (!note.trim()) return
    call("/admin/b2b/crm/events", "POST", {
      phone,
      type: "note",
      source: "admin",
      payload: { text: note.trim() },
    })
    setNote("")
  }

  function registerPurchase() {
    if (!purchase.title.trim()) return
    call(`${apiBase}/purchase`, "POST", {
      products: [
        {
          title: purchase.title.trim(),
          sku: purchase.sku.trim() || undefined,
          quantity: Number(purchase.quantity) || 1,
          reorderAfterDays: Number(purchase.reorderAfterDays) || undefined,
        },
      ],
    })
    setPurchase({ title: "", sku: "", quantity: "1", reorderAfterDays: "" })
  }

  function snooze(days: number) {
    call(`${apiBase}/snooze`, "POST", { days })
  }

  function optOut() {
    if (!window.confirm("¿Marcar opt-out? Se desactiva el consentimiento de WhatsApp.")) {
      return
    }
    call("/admin/b2b/crm/events", "POST", {
      phone,
      type: "opt_out",
      source: "admin",
    })
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Lead</h1>
        <p>No se pudo cargar el cliente: {error}</p>
      </div>
    )
  }

  if (!customer) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Lead</h1>
        <p>Cargando...</p>
      </div>
    )
  }

  const waLink = `https://wa.me/${customer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
    customer.suggestedMessage || "",
  )}`

  return (
    <div style={{ display: "grid", gap: 16, padding: 24 }}>
      <header>
        <p style={{ color: "var(--fg-subtle)", margin: 0 }}>
          <Link to="/crm-whatsapp" style={{ color: "var(--fg-subtle)" }}>
            CRM WhatsApp
          </Link>{" "}
          /{" "}
          <Link to="/crm-whatsapp/leads" style={{ color: "var(--fg-subtle)" }}>
            Leads
          </Link>{" "}
          / {customer.phone}
        </p>
        <h1 style={{ fontSize: 28, margin: "4px 0 0" }}>
          {customer.name || customer.phone}
        </h1>
        {status ? (
          <p style={{ color: "var(--fg-subtle)", margin: "4px 0 0" }}>{status}</p>
        ) : null}
      </header>

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        }}
      >
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Datos del cliente</h2>
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <label style={labelStyle}>Nombre</label>
              <input
                style={inputStyle}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                style={inputStyle}
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Etiquetas (separadas por coma)</label>
              <input
                style={inputStyle}
                value={form.tags}
                onChange={(event) => setForm({ ...form, tags: event.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Etapa</label>
              <input
                style={inputStyle}
                placeholder="ej. lead_nuevo, cotizacion_pendiente, recompra_90d"
                value={form.journeyStage}
                onChange={(event) =>
                  setForm({ ...form, journeyStage: event.target.value })
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Próximo seguimiento</label>
              <input
                type="date"
                style={inputStyle}
                value={form.nextFollowupAt}
                onChange={(event) =>
                  setForm({ ...form, nextFollowupAt: event.target.value })
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Motivo de seguimiento</label>
              <input
                style={inputStyle}
                value={form.followupReason}
                onChange={(event) =>
                  setForm({ ...form, followupReason: event.target.value })
                }
              />
            </div>
            <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
              <input
                type="checkbox"
                checked={form.whatsappConsent}
                onChange={(event) =>
                  setForm({ ...form, whatsappConsent: event.target.checked })
                }
              />
              Consentimiento WhatsApp
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
              <button style={buttonStyle} onClick={saveProfile}>
                Guardar cambios
              </button>
              <button
                style={{ ...buttonStyle, color: "var(--fg-error, #e5484d)" }}
                onClick={optOut}
              >
                Opt-out
              </button>
            </div>
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Recompra y seguimiento</h2>
          <p style={{ fontSize: 13 }}>
            <strong>Última compra:</strong> {formatDate(customer.lastPurchaseAt)}
            <br />
            <strong>Próximo seguimiento:</strong> {formatDate(customer.nextFollowupAt)}
            <br />
            <strong>Frecuencia sugerida:</strong>{" "}
            {customer.suggestedFrequencyDays
              ? `${customer.suggestedFrequencyDays} días`
              : "-"}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
            <button style={buttonStyle} onClick={() => snooze(7)}>
              Posponer 7d
            </button>
            <button style={buttonStyle} onClick={() => snooze(30)}>
              Posponer 30d
            </button>
            <button style={buttonStyle} onClick={() => snooze(90)}>
              Posponer 90d
            </button>
          </div>

          <h3 style={{ marginBottom: 4 }}>Mensaje sugerido</h3>
          <p
            style={{
              fontSize: 13,
              background: "var(--bg-subtle)",
              borderRadius: 6,
              padding: 10,
            }}
          >
            {customer.suggestedMessage || "-"}
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            style={{ ...buttonStyle, textDecoration: "none", display: "inline-block" }}
          >
            Abrir WhatsApp con el mensaje
          </a>

          <h3 style={{ marginBottom: 4 }}>Registrar compra manual</h3>
          <div style={{ display: "grid", gap: 8 }}>
            <input
              style={inputStyle}
              placeholder="Producto (ej. Olla 20 cm granito)"
              value={purchase.title}
              onChange={(event) =>
                setPurchase({ ...purchase, title: event.target.value })
              }
            />
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={inputStyle}
                placeholder="SKU (opcional)"
                value={purchase.sku}
                onChange={(event) =>
                  setPurchase({ ...purchase, sku: event.target.value })
                }
              />
              <input
                style={{ ...inputStyle, width: 90 }}
                placeholder="Cant."
                value={purchase.quantity}
                onChange={(event) =>
                  setPurchase({ ...purchase, quantity: event.target.value })
                }
              />
              <input
                style={{ ...inputStyle, width: 150 }}
                placeholder="Recompra (días)"
                value={purchase.reorderAfterDays}
                onChange={(event) =>
                  setPurchase({ ...purchase, reorderAfterDays: event.target.value })
                }
              />
            </div>
            <button style={buttonStyle} onClick={registerPurchase}>
              Registrar compra
            </button>
          </div>
        </section>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Agregar nota</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            style={inputStyle}
            placeholder="Nota interna (ej. pidió que le escriban en julio)"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") addNote()
            }}
          />
          <button style={buttonStyle} onClick={addNote}>
            Guardar nota
          </button>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Compras</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellStyle}>Producto</th>
              <th style={cellStyle}>SKU</th>
              <th style={cellStyle}>Cantidad</th>
              <th style={cellStyle}>Fecha</th>
              <th style={cellStyle}>Recompra (días)</th>
            </tr>
          </thead>
          <tbody>
            {(customer.purchasedProducts || []).map((product, index) => (
              <tr key={`${product.sku}-${index}`}>
                <td style={cellStyle}>{product.title || "-"}</td>
                <td style={cellStyle}>{product.sku || "-"}</td>
                <td style={cellStyle}>{product.quantity || 1}</td>
                <td style={cellStyle}>{formatDate(product.purchasedAt)}</td>
                <td style={cellStyle}>{product.reorderAfterDays || "-"}</td>
              </tr>
            ))}
            {!(customer.purchasedProducts || []).length ? (
              <tr>
                <td colSpan={5} style={cellStyle}>
                  Sin compras registradas.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Conversación</h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            maxHeight: 500,
            overflowY: "auto",
            background: "var(--bg-subtle, #f5f5f5)",
            borderRadius: 8,
            padding: 12,
          }}
        >
          {(customer.events || [])
            .filter(
              (event) =>
                ["message_in", "message_out", "paid", "quote_created"].includes(
                  event.type
                )
            )
            .sort((a, b) => {
              const atA = a.at ? new Date(a.at).getTime() : 0
              const atB = b.at ? new Date(b.at).getTime() : 0
              return atA - atB
            })
            .map((event, index) => {
              const isIncoming = event.type === "message_in"
              const isMessage = event.type === "message_in" || event.type === "message_out"
              const isEvent = !isMessage

              const text = isMessage && event.payload && typeof event.payload === "object"
                ? (event.payload as { text?: string }).text || ""
                : event.type === "paid"
                ? "💰 Pagado"
                : event.type === "quote_created"
                ? "📋 Cotización creada"
                : event.type

              return (
                <div
                  key={`${event.type}-${event.at}-${index}`}
                  style={{
                    display: "flex",
                    justifyContent: isIncoming ? "flex-start" : "flex-end",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "70%",
                      background: isIncoming
                        ? "var(--bg-base, #ffffff)"
                        : "var(--fg-muted, #e3f2fd)",
                      borderRadius: 12,
                      padding: "10px 14px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      ...(isEvent
                        ? {
                            background: "var(--bg-muted, #fff9c4)",
                            border: "1px solid var(--border-base)",
                          }
                        : {}),
                    }}
                  >
                    {isEvent && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--fg-subtle)",
                          marginBottom: 4,
                          fontWeight: 600,
                        }}
                      >
                        {event.type === "paid" ? "💰" : "📋"}{" "}
                        {event.type.replace(/_/g, " ")}
                      </div>
                    )}
                    <div style={{ fontSize: 13, lineHeight: 1.5, wordBreak: "break-word" }}>
                      {text}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--fg-subtle)",
                        marginTop: 4,
                        textAlign: "right",
                      }}
                    >
                      {event.at ? formatDate(event.at) : ""}
                    </div>
                  </div>
                </div>
              )
            })}
          {!(customer.events || []).filter((e) =>
            ["message_in", "message_out", "paid", "quote_created"].includes(e.type)
          ).length ? (
            <div
              style={{
                textAlign: "center",
                color: "var(--fg-subtle)",
                fontSize: 13,
                padding: 20,
              }}
            >
              Sin mensajes registrados. La conversación aparecerá aquí cuando Vicky
              registre eventos message_in/message_out.
            </div>
          ) : null}
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Historial de eventos</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellStyle}>Evento</th>
              <th style={cellStyle}>Fecha</th>
              <th style={cellStyle}>Origen</th>
              <th style={cellStyle}>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {(customer.events || []).map((event, index) => (
              <tr key={`${event.type}-${event.at}-${index}`}>
                <td style={cellStyle}>
                  <strong>{event.type}</strong>
                </td>
                <td style={cellStyle}>{formatDate(event.at)}</td>
                <td style={cellStyle}>{event.source || "-"}</td>
                <td style={{ ...cellStyle, maxWidth: 420, overflowWrap: "anywhere" }}>
                  {event.payload && typeof event.payload === "object" &&
                  (event.payload as { text?: string }).text
                    ? (event.payload as { text?: string }).text
                    : event.payload
                      ? JSON.stringify(event.payload)
                      : "-"}
                </td>
              </tr>
            ))}
            {!(customer.events || []).length ? (
              <tr>
                <td colSpan={4} style={cellStyle}>
                  Sin eventos.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export const config = defineRouteConfig({})

export default LeadDetailPage
