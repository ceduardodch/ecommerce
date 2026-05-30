import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"

type CrmCustomerRow = {
  phone: string
  name?: string
  lastPurchaseAt?: string
  nextFollowupAt?: string
  followupReason?: string
  suggestedMessage?: string
  reason?: string
  priority?: string
  recommendedProductSku?: string
  requiresHumanApproval?: boolean
}

type Dashboard = {
  counts: {
    leads: number
    pendingOrders: number
    paidOrders: number
    dueFollowups: number
    customers: number
  }
  dueFollowups: CrmCustomerRow[]
  hotLeads: CrmCustomerRow[]
  careFollowups: CrmCustomerRow[]
  complementFollowups: CrmCustomerRow[]
  reorderFollowups: CrmCustomerRow[]
  optOuts: CrmCustomerRow[]
  pendingOrders: Array<{
    id: string
    medusaDraftOrderId?: string
    status: string
    paymentLink?: string
    createdAt?: string
    customer?: { name?: string; phone?: string; email?: string }
    quote?: { total?: { amount: number; currency: string } }
  }>
  recentEvents: Array<{
    type: string
    at?: string
    phone?: string
    orderId?: string
    source?: string
  }>
}

function formatDate(value?: string) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function money(value?: { amount: number; currency: string }) {
  if (!value) return "-"
  return `$${Number(value.amount || 0).toFixed(2)} ${value.currency || "USD"}`
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
  padding: "10px 8px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
}

function renderCustomerQueue(
  title: string,
  customers: CrmCustomerRow[],
  emptyText: string,
) {
  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={cellStyle}>Cliente</th>
            <th style={cellStyle}>Prioridad</th>
            <th style={cellStyle}>Producto</th>
            <th style={cellStyle}>Mensaje sugerido</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={`${title}-${customer.phone}`}>
              <td style={cellStyle}>
                <strong>{customer.name || customer.phone}</strong>
                <br />
                <span>{customer.phone}</span>
                <br />
                <small>{formatDate(customer.nextFollowupAt)}</small>
              </td>
              <td style={cellStyle}>
                <strong>{customer.priority || "medium"}</strong>
                <br />
                <span>{customer.reason || customer.followupReason || "-"}</span>
                {customer.requiresHumanApproval ? (
                  <>
                    <br />
                    <small>requiere aprobacion</small>
                  </>
                ) : null}
              </td>
              <td style={cellStyle}>
                {customer.recommendedProductSku || "-"}
              </td>
              <td style={cellStyle}>{customer.suggestedMessage || "-"}</td>
            </tr>
          ))}
          {!customers.length ? (
            <tr>
              <td colSpan={4} style={cellStyle}>
                {emptyText}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </section>
  )
}

function CrmWhatsappPage() {
  const [dashboard, setDashboard] = useState<Dashboard | undefined>()
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    let mounted = true

    fetch("/admin/b2b/crm/dashboard", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<Dashboard>
      })
      .then((data) => {
        if (mounted) setDashboard(data)
      })
      .catch((cause: Error) => {
        if (mounted) setError(cause.message)
      })

    return () => {
      mounted = false
    }
  }, [])

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h1>CRM WhatsApp</h1>
        <p>No se pudo cargar el dashboard CRM: {error}</p>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div style={{ padding: 24 }}>
        <h1>CRM WhatsApp</h1>
        <p>Cargando seguimiento comercial...</p>
      </div>
    )
  }

  return (
    <div style={{ display: "grid", gap: 24, padding: 24 }}>
      <header>
        <p style={{ color: "var(--fg-subtle)", margin: 0 }}>
          Cocina, recompra y ventas conversacionales
        </p>
        <h1 style={{ fontSize: 28, margin: "4px 0 0" }}>CRM WhatsApp</h1>
      </header>

      <section
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        }}
      >
        {[
          ["Clientes", dashboard.counts.customers],
          ["Leads", dashboard.counts.leads],
          ["Ordenes pendientes", dashboard.counts.pendingOrders],
          ["Pagadas", dashboard.counts.paidOrders],
          ["Followups vencidos", dashboard.counts.dueFollowups],
        ].map(([label, value]) => (
          <article key={label} style={cardStyle}>
            <p style={{ color: "var(--fg-subtle)", margin: 0 }}>{label}</p>
            <strong style={{ fontSize: 26 }}>{value}</strong>
          </article>
        ))}
      </section>

      <section
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        {[
          ["Leads calientes", dashboard.hotLeads?.length || 0],
          ["Cuidado 7d", dashboard.careFollowups?.length || 0],
          ["Complemento 30d", dashboard.complementFollowups?.length || 0],
          ["Recompra 90d", dashboard.reorderFollowups?.length || 0],
          ["Opt-outs", dashboard.optOuts?.length || 0],
        ].map(([label, value]) => (
          <article key={label} style={cardStyle}>
            <p style={{ color: "var(--fg-subtle)", margin: 0 }}>{label}</p>
            <strong style={{ fontSize: 24 }}>{value}</strong>
          </article>
        ))}
      </section>

      {renderCustomerQueue(
        "Leads calientes",
        dashboard.hotLeads || [],
        "No hay leads calientes.",
      )}

      {renderCustomerQueue(
        "Clientes para cuidado, complemento o recompra",
        dashboard.dueFollowups,
        "No hay followups vencidos.",
      )}

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Ordenes pendientes de pago</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellStyle}>Orden</th>
              <th style={cellStyle}>Cliente</th>
              <th style={cellStyle}>Total</th>
              <th style={cellStyle}>Medusa</th>
            </tr>
          </thead>
          <tbody>
            {dashboard.pendingOrders.map((order) => (
              <tr key={order.id}>
                <td style={cellStyle}>
                  <strong>{order.id}</strong>
                  <br />
                  {formatDate(order.createdAt)}
                </td>
                <td style={cellStyle}>
                  {order.customer?.name || order.customer?.phone || "-"}
                </td>
                <td style={cellStyle}>{money(order.quote?.total)}</td>
                <td style={cellStyle}>{order.medusaDraftOrderId || "-"}</td>
              </tr>
            ))}
            {!dashboard.pendingOrders.length ? (
              <tr>
                <td colSpan={4} style={cellStyle}>
                  No hay ordenes pendientes.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Eventos recientes</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellStyle}>Evento</th>
              <th style={cellStyle}>Telefono</th>
              <th style={cellStyle}>Orden</th>
              <th style={cellStyle}>Origen</th>
            </tr>
          </thead>
          <tbody>
            {dashboard.recentEvents.map((event, index) => (
              <tr key={`${event.type}-${event.at}-${index}`}>
                <td style={cellStyle}>
                  <strong>{event.type}</strong>
                  <br />
                  {formatDate(event.at)}
                </td>
                <td style={cellStyle}>{event.phone || "-"}</td>
                <td style={cellStyle}>{event.orderId || "-"}</td>
                <td style={cellStyle}>{event.source || "-"}</td>
              </tr>
            ))}
            {!dashboard.recentEvents.length ? (
              <tr>
                <td colSpan={4} style={cellStyle}>
                  Aun no hay eventos CRM.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "CRM WhatsApp",
  rank: 70,
})

export default CrmWhatsappPage
