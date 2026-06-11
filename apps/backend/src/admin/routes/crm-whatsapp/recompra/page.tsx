import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"

type RepurchaseMetrics = {
  asOf: string
  repurchaseRates: {
    "30d": number
    "60d": number
    "90d": number
  }
  averageLTV: number
  attributedSales: {
    count: number
    totalRevenue: number
    sales: Array<{
      phone: string
      paidAt: string
      amount: number
      followupAt?: string
      daysSinceFollowup?: number
    }>
  }
  cohorts: Array<{
    month: string
    size: number
    phones: string[]
  }>
}

function formatDate(value?: string) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatMonth(value: string) {
  const [year, month] = value.split("-")
  if (!year || !month) return value
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return new Intl.DateTimeFormat("es-EC", {
    year: "numeric",
    month: "long",
  }).format(date)
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`
}

const cardStyle = {
  border: "1px solid var(--border-base)",
  borderRadius: 8,
  background: "var(--bg-base)",
  padding: 16,
  marginBottom: 16,
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

const headerStyle = {
  ...cellStyle,
  fontWeight: "bold" as const,
  background: "var(--bg-subtle)",
}

function CrmRecompraPage() {
  const [metrics, setMetrics] = useState<RepurchaseMetrics | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    setError(undefined)

    fetch("/admin/b2b/crm/reports/recompra")
      .then((res) => res.json())
      .then((data) => {
        setMetrics(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || "error_al_cargar_metricas")
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return <p style={cardStyle}>Cargando métricas de recompra...</p>
  }

  if (error) {
    return (
      <div style={cardStyle}>
        <p style={{ color: "var(--color-error-base)" }}>
          Error: {error}
        </p>
        <button
          onClick={() => load()}
          style={{
            padding: "8px 16px",
            background: "var(--color-bg-base)",
            border: "1px solid var(--border-base)",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!metrics) {
    return <p style={cardStyle}>No hay datos disponibles</p>
  }

  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h1 style={{ margin: 0 }}>Reporte de Recompra y LTV</h1>
        <Link
          to="/admin/crm-whatsapp"
          style={{
            padding: "8px 16px",
            background: "var(--color-bg-base)",
            border: "1px solid var(--border-base)",
            borderRadius: 4,
            textDecoration: "none",
            color: "var(--color-text-base)",
          }}
        >
          Volver al Dashboard
        </Link>
      </div>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 14 }}>Tasa Recompra 30d</h3>
          <p style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>
            {formatPercent(metrics.repurchaseRates["30d"])}
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 14 }}>Tasa Recompra 60d</h3>
          <p style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>
            {formatPercent(metrics.repurchaseRates["60d"])}
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 14 }}>Tasa Recompra 90d</h3>
          <p style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>
            {formatPercent(metrics.repurchaseRates["90d"])}
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 14 }}>LTV Promedio</h3>
          <p style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>
            {formatMoney(metrics.averageLTV)}
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 14 }}>
            Ventas Atribuidas
          </h3>
          <p style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>
            {metrics.attributedSales.count}
          </p>
          <p style={{ fontSize: 12, margin: "4px 0 0 0", color: "var(--color-text-subtle)" }}>
            Total: {formatMoney(metrics.attributedSales.totalRevenue)}
          </p>
        </div>
      </div>

      {/* Cohortes */}
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Cohortes por Mes de Primera Compra</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headerStyle}>Mes</th>
              <th style={headerStyle}>Tamaño</th>
              <th style={headerStyle}>Clientes</th>
            </tr>
          </thead>
          <tbody>
            {metrics.cohorts.map((cohort) => (
              <tr key={cohort.month}>
                <td style={cellStyle}>{formatMonth(cohort.month)}</td>
                <td style={cellStyle}>{cohort.size}</td>
                <td style={cellStyle}>
                  <code
                    style={{
                      fontSize: 11,
                      background: "var(--bg-subtle)",
                      padding: "4px",
                    }}
                  >
                    {cohort.phones.slice(0, 5).join(", ")}
                    {cohort.phones.length > 5 ? "..." : ""}
                  </code>
                </td>
              </tr>
            ))}
            {!metrics.cohorts.length ? (
              <tr>
                <td colSpan={3} style={cellStyle}>
                  No hay cohortes disponibles
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      {/* Ventas Atribuidas */}
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>
          Ventas Atribuidas a Followups (≤ 7 días)
        </h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headerStyle}>Teléfono</th>
              <th style={headerStyle}>Fecha Venta</th>
              <th style={headerStyle}>Monto</th>
              <th style={headerStyle}>Días post Followup</th>
              <th style={headerStyle}>Fecha Followup</th>
            </tr>
          </thead>
          <tbody>
            {metrics.attributedSales.sales.map((sale, index) => (
              <tr key={`${sale.phone}-${index}`}>
                <td style={cellStyle}>{sale.phone}</td>
                <td style={cellStyle}>{formatDate(sale.paidAt)}</td>
                <td style={cellStyle}>{formatMoney(sale.amount)}</td>
                <td style={cellStyle}>{sale.daysSinceFollowup || "-"}</td>
                <td style={cellStyle}>
                  {sale.followupAt ? formatDate(sale.followupAt) : "-"}
                </td>
              </tr>
            ))}
            {!metrics.attributedSales.sales.length ? (
              <tr>
                <td colSpan={5} style={cellStyle}>
                  No hay ventas atribuidas en el periodo
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      <p style={{ fontSize: 12, color: "var(--color-text-subtle)" }}>
        Datos actualizados: {formatDate(metrics.asOf)}
      </p>
    </div>
  )
}

export const Config = defineRouteConfig({
  label: "Recompra",
})

export default CrmRecompraPage
