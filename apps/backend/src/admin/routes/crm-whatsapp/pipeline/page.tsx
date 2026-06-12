/**
 * BMK-1 — Kanban pipeline por etapa de customer journey.
 * Drag & drop HTML5 nativo (draggable/onDragStart/onDragOver/onDrop, sin librerías).
 * Persiste en metadata.journeyStage vía PATCH /admin/b2b/crm/customers/[phone].
 */

import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type CustomerRow = {
  phone: string
  name?: string
  followupReason?: string
  journeyStage?: string
  nextFollowupAt?: string
  rfmSegment?: string
  vertical?: string
  metadata?: Record<string, unknown>
}

type Column = {
  id: PipelineColumnId
  label: string
}

type PipelineColumnId =
  | "lead_nuevo"
  | "cotizacion_pendiente"
  | "pago_pendiente"
  | "cliente_pagado"
  | "recompra"

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const COLUMNS: Column[] = [
  { id: "lead_nuevo", label: "Lead nuevo" },
  { id: "cotizacion_pendiente", label: "Cotización pendiente" },
  { id: "pago_pendiente", label: "Pago pendiente" },
  { id: "cliente_pagado", label: "Cliente pagado" },
  { id: "recompra", label: "Recompra" },
]

const RFM_COLORS: Record<string, string> = {
  vip: "#8b5cf6",
  leal: "#2563eb",
  prometedor: "#16a34a",
  nuevo: "#0891b2",
  dormido: "#9ca3af",
  en_riesgo: "#dc2626",
}

// ---------------------------------------------------------------------------
// Clasificación: reason → columna
// ---------------------------------------------------------------------------

function mapToColumn(customer: CustomerRow): PipelineColumnId {
  const journeyStage = String(
    customer.journeyStage || customer.metadata?.journeyStage || "",
  ).toLowerCase()
  const followupReason = String(customer.followupReason || "").toLowerCase()
  const combined = journeyStage || followupReason

  // journeyStage explícito tiene prioridad
  if (journeyStage === "lead_nuevo") return "lead_nuevo"
  if (journeyStage === "cotizacion_pendiente") return "cotizacion_pendiente"
  if (journeyStage === "pago_pendiente") return "pago_pendiente"
  if (journeyStage === "cliente_pagado") return "cliente_pagado"
  if (journeyStage === "recompra") return "recompra"

  // Derivar de followup_reason
  if (
    combined.includes("cotizacion") ||
    combined.includes("cotización") ||
    combined.includes("quote")
  ) {
    return "cotizacion_pendiente"
  }
  if (combined.includes("pago") || combined.includes("payment")) {
    return "pago_pendiente"
  }
  if (
    combined.includes("cliente_pagado") ||
    combined.includes("paid") ||
    combined.includes("pagado")
  ) {
    return "cliente_pagado"
  }
  if (
    combined.includes("recompra") ||
    combined.includes("complemento") ||
    combined.includes("cuidado") ||
    combined.includes("reorder") ||
    combined.includes("complement")
  ) {
    return "recompra"
  }

  return "lead_nuevo"
}

// ---------------------------------------------------------------------------
// Helpers de formato
// ---------------------------------------------------------------------------

function formatDate(value?: string) {
  if (!value) return null
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "short" }).format(
    new Date(value),
  )
}

function isDue(value?: string) {
  return Boolean(value && Date.parse(value) <= Date.now())
}

// ---------------------------------------------------------------------------
// Estilos inline (patrón de las demás páginas del admin CRM)
// ---------------------------------------------------------------------------

const cardStyle = {
  border: "1px solid var(--border-base)",
  borderRadius: 8,
  background: "var(--bg-base)",
  padding: 12,
}

const columnContainerStyle = {
  border: "2px solid var(--border-base)",
  borderRadius: 10,
  background: "var(--bg-subtle)",
  padding: 12,
  minWidth: 200,
  flex: "0 0 220px",
  display: "flex",
  flexDirection: "column" as const,
  gap: 8,
}

const columnHeaderStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: "var(--fg-subtle)",
  marginBottom: 4,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
}

const customerCardBaseStyle = {
  border: "1px solid var(--border-base)",
  borderRadius: 8,
  background: "var(--bg-base)",
  padding: "10px 12px",
  cursor: "grab",
  fontSize: 13,
  userSelect: "none" as const,
}

const buttonStyle = {
  border: "1px solid var(--border-base)",
  borderRadius: 6,
  background: "var(--bg-subtle)",
  color: "var(--fg-base)",
  padding: "8px 12px",
  fontSize: 13,
  cursor: "pointer",
  textDecoration: "none",
}

// ---------------------------------------------------------------------------
// Componente de tarjeta de cliente
// ---------------------------------------------------------------------------

function CustomerCard({
  customer,
  onDragStart,
}: {
  customer: CustomerRow
  onDragStart: (phone: string) => void
}) {
  const nextDate = formatDate(customer.nextFollowupAt)
  const overdue = isDue(customer.nextFollowupAt)
  const rfmColor = customer.rfmSegment
    ? RFM_COLORS[customer.rfmSegment] || "var(--fg-subtle)"
    : undefined

  return (
    <div
      draggable
      onDragStart={() => onDragStart(customer.phone)}
      style={customerCardBaseStyle}
    >
      <div style={{ fontWeight: 600, color: "var(--fg-base)", marginBottom: 2 }}>
        {customer.name || customer.phone}
      </div>
      <div style={{ color: "var(--fg-subtle)", fontSize: 12 }}>
        {customer.phone}
      </div>
      {customer.vertical ? (
        <div style={{ color: "var(--fg-subtle)", fontSize: 11, marginTop: 2 }}>
          {customer.vertical}
        </div>
      ) : null}
      {customer.rfmSegment ? (
        <span
          style={{
            display: "inline-block",
            marginTop: 4,
            padding: "1px 6px",
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600,
            color: "#fff",
            background: rfmColor,
          }}
        >
          {customer.rfmSegment}
        </span>
      ) : null}
      {nextDate ? (
        <div
          style={{
            marginTop: 4,
            fontSize: 11,
            color: overdue ? "#dc2626" : "var(--fg-subtle)",
            fontWeight: overdue ? 600 : 400,
          }}
        >
          {overdue ? "Vencido: " : "Seguimiento: "}
          {nextDate}
        </div>
      ) : null}
      <div style={{ marginTop: 6 }}>
        <Link
          to={`/crm-whatsapp/leads/${encodeURIComponent(customer.phone)}`}
          style={{ fontSize: 11, color: "var(--fg-interactive)" }}
          onClick={(e) => e.stopPropagation()}
        >
          Ver ficha →
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

function PipelinePage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()
  const [saving, setSaving] = useState<string | undefined>()

  // Ref para trackear el cliente que se está arrastrando
  const draggingPhone = useRef<string | null>(null)
  // Para resaltar la columna objetivo
  const [dragOverCol, setDragOverCol] = useState<PipelineColumnId | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch("/admin/b2b/crm/customers?limit=200", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json() as { customers: CustomerRow[] }
        setCustomers(data.customers)
      })
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Agrupar clientes por columna
  const columns: Record<PipelineColumnId, CustomerRow[]> = {
    lead_nuevo: [],
    cotizacion_pendiente: [],
    pago_pendiente: [],
    cliente_pagado: [],
    recompra: [],
  }
  for (const customer of customers) {
    const col = mapToColumn(customer)
    columns[col].push(customer)
  }

  // Drag handlers
  function handleDragStart(phone: string) {
    draggingPhone.current = phone
  }

  function handleDragOver(
    e: React.DragEvent<HTMLDivElement>,
    colId: PipelineColumnId,
  ) {
    e.preventDefault()
    setDragOverCol(colId)
  }

  function handleDragLeave() {
    setDragOverCol(null)
  }

  async function handleDrop(
    e: React.DragEvent<HTMLDivElement>,
    targetCol: PipelineColumnId,
  ) {
    e.preventDefault()
    setDragOverCol(null)
    const phone = draggingPhone.current
    draggingPhone.current = null
    if (!phone) return

    const customer = customers.find((c) => c.phone === phone)
    if (!customer) return

    const currentCol = mapToColumn(customer)
    if (currentCol === targetCol) return

    setSaving(phone)
    try {
      const response = await fetch(
        `/admin/b2b/crm/customers/${encodeURIComponent(phone)}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata: { journeyStage: targetCol } }),
        },
      )
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      // Actualizar localmente sin recargar todo
      setCustomers((prev) =>
        prev.map((c) =>
          c.phone === phone
            ? {
                ...c,
                journeyStage: targetCol,
                metadata: { ...(c.metadata || {}), journeyStage: targetCol },
              }
            : c,
        ),
      )
    } catch (cause) {
      setError(
        `Error actualizando ${phone}: ${cause instanceof Error ? cause.message : cause}`,
      )
    } finally {
      setSaving(undefined)
    }
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Pipeline</h1>
        <p style={{ color: "#dc2626" }}>Error: {error}</p>
        <button style={buttonStyle} onClick={() => { setError(undefined); load() }}>
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: "grid", gap: 20, padding: 24 }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <p style={{ color: "var(--fg-subtle)", margin: 0, fontSize: 13 }}>
            Drag & drop para mover clientes entre etapas
          </p>
          <h1 style={{ fontSize: 28, margin: "4px 0 0" }}>Pipeline</h1>
          {saving ? (
            <p style={{ color: "var(--fg-subtle)", margin: "4px 0 0", fontSize: 12 }}>
              Guardando {saving}…
            </p>
          ) : null}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link to="/crm-whatsapp" style={buttonStyle}>
            Dashboard
          </Link>
          <Link to="/crm-whatsapp/leads" style={buttonStyle}>
            Leads
          </Link>
          <Link to="/crm-whatsapp/import" style={buttonStyle}>
            Importar leads
          </Link>
          <button style={buttonStyle} onClick={load}>
            Actualizar
          </button>
        </div>
      </header>

      {/* Leyenda RFM */}
      <div style={{ ...cardStyle, padding: "8px 12px" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12 }}>
          <span style={{ color: "var(--fg-subtle)" }}>RFM:</span>
          {Object.entries(RFM_COLORS).map(([seg, color]) => (
            <span key={seg} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: color,
                }}
              />
              {seg}
            </span>
          ))}
        </div>
      </div>

      {/* Tablero Kanban */}
      {loading ? (
        <p style={{ color: "var(--fg-subtle)" }}>Cargando clientes…</p>
      ) : (
        <div
          style={{
            display: "flex",
            gap: 16,
            overflowX: "auto",
            paddingBottom: 12,
          }}
        >
          {COLUMNS.map((col) => {
            const colCustomers = columns[col.id]
            const isDragOver = dragOverCol === col.id
            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                style={{
                  ...columnContainerStyle,
                  borderColor: isDragOver
                    ? "var(--border-interactive)"
                    : "var(--border-base)",
                  background: isDragOver
                    ? "var(--bg-highlight)"
                    : "var(--bg-subtle)",
                }}
              >
                <div style={columnHeaderStyle}>
                  {col.label}{" "}
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 400,
                      color: "var(--fg-muted)",
                    }}
                  >
                    ({colCustomers.length})
                  </span>
                </div>
                {colCustomers.map((customer) => (
                  <CustomerCard
                    key={customer.phone}
                    customer={customer}
                    onDragStart={handleDragStart}
                  />
                ))}
                {colCustomers.length === 0 ? (
                  <div
                    style={{
                      border: "2px dashed var(--border-base)",
                      borderRadius: 8,
                      padding: 16,
                      textAlign: "center",
                      color: "var(--fg-muted)",
                      fontSize: 12,
                      flex: 1,
                    }}
                  >
                    Arrastra aquí
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}

      {/* Stats */}
      {!loading ? (
        <section
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          }}
        >
          {COLUMNS.map((col) => (
            <article key={col.id} style={cardStyle}>
              <p style={{ color: "var(--fg-subtle)", margin: 0, fontSize: 12 }}>
                {col.label}
              </p>
              <strong style={{ fontSize: 22 }}>{columns[col.id].length}</strong>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Pipeline",
})

export default PipelinePage
