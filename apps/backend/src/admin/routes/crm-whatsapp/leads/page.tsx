import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

type CustomerRow = {
  phone: string
  name?: string
  email?: string
  city?: string
  journeyStage?: string
  tags?: string[]
  whatsappConsent?: boolean
  lastPurchaseAt?: string
  nextFollowupAt?: string
  followupReason?: string
  priority?: string
}

type CustomersResponse = {
  customers: CustomerRow[]
  count: number
  offset: number
  limit: number
}

const PAGE_SIZE = 25

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

const inputStyle = {
  border: "1px solid var(--border-base)",
  borderRadius: 6,
  background: "var(--bg-field)",
  color: "var(--fg-base)",
  padding: "8px 10px",
  fontSize: 13,
}

const buttonStyle = {
  ...inputStyle,
  cursor: "pointer",
  background: "var(--bg-subtle)",
}

function formatDate(value?: string) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium" }).format(
    new Date(value),
  )
}

function isDue(value?: string) {
  return Boolean(value && Date.parse(value) <= Date.now())
}

function escapeCsvValue(value: string | undefined | null): string {
  if (!value) return ""
  const stringValue = String(value)
  // Escapar comillas y envolver en comillas si contiene comas, comillas o saltos de línea
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

function exportCustomersToCsv(customers: CustomerRow[]) {
  // Headers compatibles con import (columnas en orden del import CSV)
  const headers = [
    "telefono",
    "nombre",
    "email",
    "ciudad",
    "etapa",
    "etiquetas",
    "consentimiento_whatsapp",
    "ultima_compra",
    "proximo_seguimiento",
    "motivo_seguimiento",
  ]

  const rows = customers.map((customer) => [
    escapeCsvValue(customer.phone),
    escapeCsvValue(customer.name),
    escapeCsvValue(customer.email),
    escapeCsvValue(customer.city),
    escapeCsvValue(customer.journeyStage),
    escapeCsvValue(customer.tags?.join(", ")),
    escapeCsvValue(customer.whatsappConsent ? "si" : "no"),
    escapeCsvValue(customer.lastPurchaseAt ? formatDate(customer.lastPurchaseAt) : ""),
    escapeCsvValue(customer.nextFollowupAt ? formatDate(customer.nextFollowupAt) : ""),
    escapeCsvValue(customer.followupReason),
  ])

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n")

  // Crear Blob y descargar
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `leads_crm_${new Date().toISOString().split("T")[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

type CampaignFilter = {
  stage?: string
  tag?: string
  consent?: boolean
  vertical?: string
}

type DryRunResult = {
  totalCandidates: number
  eligibleTargets: number
  skipped: number
  skipReasons: Record<string, number>
  sample: Array<{ phone: string; name?: string; renderedMessage: string }>
}

type SendResult = {
  results: {
    totalCandidates: number
    sent: number
    queued: number
    skipped: number
  }
}

const TEMPLATE_KEYS = [
  "recompra",
  "complemento",
  "cuidado",
  "estacional",
  "cross_sell_cocina",
  "cross_sell_bienestar",
  "generico",
]

function CampaignModal({
  filter,
  onClose,
}: {
  filter: CampaignFilter
  onClose: () => void
}) {
  const [templateKey, setTemplateKey] = useState("recompra")
  const [preview, setPreview] = useState<DryRunResult | undefined>()
  const [sent, setSent] = useState<SendResult | undefined>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | undefined>()

  async function call(dryRun: boolean) {
    setBusy(true)
    setError(undefined)
    try {
      const response = await fetch("/admin/b2b/crm/broadcasts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filter, templateKey, dryRun }),
      })
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}))
        throw new Error(detail.message || detail.error || `HTTP ${response.status}`)
      }
      const json = await response.json()
      if (dryRun) {
        setPreview(json)
        setSent(undefined)
      } else {
        setSent(json)
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setBusy(false)
    }
  }

  function confirmSend() {
    if (!preview) return
    if (
      !window.confirm(
        `Vas a enviar la campaña "${templateKey}" a ${preview.eligibleTargets} clientes elegibles. ¿Confirmas?`,
      )
    ) {
      return
    }
    call(false)
  }

  const filterChips = Object.entries(filter)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${value}`)

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{ ...cardStyle, maxWidth: 560, width: "100%", maxHeight: "90vh", overflow: "auto" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Campaña por WhatsApp</h2>
          <button onClick={onClose} style={buttonStyle}>
            Cerrar
          </button>
        </div>

        <p style={{ color: "var(--fg-subtle)", fontSize: 13, marginTop: 8 }}>
          Segmento:{" "}
          {filterChips.length ? filterChips.join(" · ") : "todos los clientes"}.
          Se respetan consentimiento, opt-out, cooldown y el tope diario.
        </p>

        <label style={{ display: "block", fontSize: 13, marginTop: 12 }}>
          Plantilla
          <select
            value={templateKey}
            onChange={(event) => {
              setTemplateKey(event.target.value)
              setPreview(undefined)
              setSent(undefined)
            }}
            style={{ ...inputStyle, width: "100%", marginTop: 4 }}
          >
            {TEMPLATE_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={() => call(true)} disabled={busy} style={buttonStyle}>
            {busy ? "Calculando..." : "Vista previa (dry-run)"}
          </button>
          {preview ? (
            <button
              onClick={confirmSend}
              disabled={busy || preview.eligibleTargets === 0}
              style={{
                ...buttonStyle,
                background: "var(--button-inverted-bg, #2d2d2d)",
                color: "var(--button-inverted-fg, #fff)",
                opacity: preview.eligibleTargets === 0 ? 0.5 : 1,
              }}
            >
              Enviar a {preview.eligibleTargets}
            </button>
          ) : null}
        </div>

        {error ? (
          <p style={{ color: "var(--fg-error, #e5484d)", fontSize: 13, marginTop: 10 }}>
            {error}
          </p>
        ) : null}

        {preview && !sent ? (
          <div style={{ marginTop: 12, fontSize: 13 }}>
            <p style={{ margin: "4px 0" }}>
              <strong>{preview.eligibleTargets}</strong> elegibles de{" "}
              {preview.totalCandidates} candidatos · {preview.skipped} omitidos
              {Object.keys(preview.skipReasons).length
                ? ` (${Object.entries(preview.skipReasons)
                    .map(([reason, n]) => `${reason}: ${n}`)
                    .join(", ")})`
                : ""}
            </p>
            <p style={{ margin: "8px 0 4px", color: "var(--fg-subtle)" }}>Muestra del mensaje:</p>
            {preview.sample.map((item) => (
              <div
                key={item.phone}
                style={{
                  border: "1px solid var(--border-base)",
                  borderRadius: 6,
                  padding: 8,
                  marginBottom: 6,
                }}
              >
                <strong>{item.name || item.phone}</strong>
                <p style={{ margin: "4px 0 0" }}>{item.renderedMessage}</p>
              </div>
            ))}
            {preview.sample.length === 0 ? (
              <p style={{ color: "var(--fg-subtle)" }}>Sin clientes elegibles con este filtro.</p>
            ) : null}
          </div>
        ) : null}

        {sent ? (
          <div style={{ marginTop: 12, fontSize: 13 }}>
            <p>
              <strong>Campaña despachada.</strong> {sent.results.sent} enviados,{" "}
              {sent.results.queued} en cola, {sent.results.skipped} omitidos.
            </p>
            <p style={{ color: "var(--fg-subtle)" }}>
              Revisa la cola de envío en el dashboard del CRM.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function LeadsPage() {
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [stage, setStage] = useState("")
  const [consent, setConsent] = useState("")
  const [dueOnly, setDueOnly] = useState(false)
  const [tag, setTag] = useState("")
  const [vertical, setVertical] = useState("")
  const [page, setPage] = useState(0)
  const [data, setData] = useState<CustomersResponse | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const [campaignOpen, setCampaignOpen] = useState(false)

  useEffect(() => {
    const handle = setTimeout(() => {
      setQuery(search.trim())
      setPage(0)
    }, 350)
    return () => clearTimeout(handle)
  }, [search])

  const params = useMemo(() => {
    const searchParams = new URLSearchParams()
    searchParams.set("limit", String(PAGE_SIZE))
    searchParams.set("offset", String(page * PAGE_SIZE))
    if (query) searchParams.set("q", query)
    if (stage) searchParams.set("stage", stage)
    if (consent) searchParams.set("consent", consent)
    if (dueOnly) searchParams.set("due", "1")
    if (tag.trim()) searchParams.set("tag", tag.trim())
    if (vertical) searchParams.set("vertical", vertical)
    return searchParams.toString()
  }, [query, stage, consent, dueOnly, tag, vertical, page])

  const campaignFilter = useMemo(
    () => ({
      stage: stage || undefined,
      tag: tag.trim() || undefined,
      consent: consent === "1" ? true : consent === "0" ? false : undefined,
      vertical: vertical || undefined,
    }),
    [stage, tag, consent, vertical],
  )

  useEffect(() => {
    let mounted = true
    setLoading(true)

    fetch(`/admin/b2b/crm/customers?${params}`, { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<CustomersResponse>
      })
      .then((payload) => {
        if (!mounted) return
        setData(payload)
        setError(undefined)
      })
      .catch((cause: Error) => {
        if (mounted) setError(cause.message)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [params])

  const totalPages = data ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1

  return (
    <div style={{ display: "grid", gap: 16, padding: 24 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap" as const,
          gap: 12,
        }}
      >
        <div>
          <p style={{ color: "var(--fg-subtle)", margin: 0 }}>
            <Link to="/crm-whatsapp" style={{ color: "var(--fg-subtle)" }}>
              CRM WhatsApp
            </Link>{" "}
            / Leads
          </p>
          <h1 style={{ fontSize: 28, margin: "4px 0 0" }}>Leads y clientes</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => data?.customers && exportCustomersToCsv(data.customers)}
            disabled={!data || data.customers.length === 0}
            style={{
              ...buttonStyle,
              opacity: !data || data.customers.length === 0 ? 0.5 : 1,
              cursor: !data || data.customers.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            Exportar CSV ({data?.customers.length || 0})
          </button>
          <button
            onClick={() => setCampaignOpen(true)}
            style={{
              ...buttonStyle,
              background: "var(--button-inverted-bg, #2d2d2d)",
              color: "var(--button-inverted-fg, #fff)",
            }}
          >
            Campaña a este filtro
          </button>
          <Link to="/crm-whatsapp/import" style={{ ...buttonStyle, textDecoration: "none" }}>
            Importar leads (CSV/Excel)
          </Link>
        </div>
      </header>

      {campaignOpen ? (
        <CampaignModal
          filter={campaignFilter}
          onClose={() => setCampaignOpen(false)}
        />
      ) : null}

      <section
        style={{
          ...cardStyle,
          display: "flex",
          gap: 8,
          flexWrap: "wrap" as const,
          alignItems: "center",
        }}
      >
        <input
          style={{ ...inputStyle, minWidth: 220 }}
          placeholder="Buscar por nombre, teléfono o email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <input
          style={{ ...inputStyle, width: 140 }}
          placeholder="Etapa (ej. recompra)"
          value={stage}
          onChange={(event) => {
            setStage(event.target.value)
            setPage(0)
          }}
        />
        <input
          style={{ ...inputStyle, width: 140 }}
          placeholder="Etiqueta"
          value={tag}
          onChange={(event) => {
            setTag(event.target.value)
            setPage(0)
          }}
        />
        <select
          style={inputStyle}
          value={consent}
          onChange={(event) => {
            setConsent(event.target.value)
            setPage(0)
          }}
        >
          <option value="">Consentimiento: todos</option>
          <option value="1">Con consentimiento</option>
          <option value="0">Sin consentimiento</option>
        </select>
        <select
          style={inputStyle}
          value={vertical}
          onChange={(event) => {
            setVertical(event.target.value)
            setPage(0)
          }}
        >
          <option value="">Línea: todas</option>
          <option value="cocina">Cocina</option>
          <option value="bienestar">Bienestar</option>
          <option value="cross-sell-cocina">Cross-sell a cocina (compró bienestar)</option>
          <option value="cross-sell-bienestar">Cross-sell a bienestar (compró cocina)</option>
        </select>
        <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
          <input
            type="checkbox"
            checked={dueOnly}
            onChange={(event) => {
              setDueOnly(event.target.checked)
              setPage(0)
            }}
          />
          Solo seguimiento vencido
        </label>
        <span style={{ color: "var(--fg-subtle)", fontSize: 13, marginLeft: "auto" }}>
          {loading ? "Cargando..." : data ? `${data.count} resultados` : ""}
        </span>
      </section>

      {error ? (
        <section style={cardStyle}>
          <p>No se pudo cargar la lista: {error}</p>
        </section>
      ) : null}

      <section style={cardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellStyle}>Cliente</th>
              <th style={cellStyle}>Etapa / Motivo</th>
              <th style={cellStyle}>Etiquetas</th>
              <th style={cellStyle}>Consent.</th>
              <th style={cellStyle}>Última compra</th>
              <th style={cellStyle}>Próximo seguimiento</th>
            </tr>
          </thead>
          <tbody>
            {(data?.customers || []).map((customer) => (
              <tr key={customer.phone}>
                <td style={cellStyle}>
                  <Link
                    to={`/crm-whatsapp/leads/${encodeURIComponent(customer.phone)}`}
                    style={{ color: "var(--fg-base)", fontWeight: 600 }}
                  >
                    {customer.name || customer.phone}
                  </Link>
                  <br />
                  <span style={{ color: "var(--fg-subtle)" }}>{customer.phone}</span>
                  {customer.city ? (
                    <>
                      <br />
                      <small>{customer.city}</small>
                    </>
                  ) : null}
                </td>
                <td style={cellStyle}>
                  {customer.journeyStage || customer.followupReason || "-"}
                </td>
                <td style={cellStyle}>{(customer.tags || []).join(", ") || "-"}</td>
                <td style={cellStyle}>{customer.whatsappConsent ? "Sí" : "No"}</td>
                <td style={cellStyle}>{formatDate(customer.lastPurchaseAt)}</td>
                <td
                  style={{
                    ...cellStyle,
                    color: isDue(customer.nextFollowupAt)
                      ? "var(--fg-error, #e5484d)"
                      : undefined,
                  }}
                >
                  {formatDate(customer.nextFollowupAt)}
                  {isDue(customer.nextFollowupAt) ? " (vencido)" : ""}
                </td>
              </tr>
            ))}
            {!loading && !(data?.customers || []).length ? (
              <tr>
                <td colSpan={6} style={cellStyle}>
                  No hay leads con esos filtros. Puedes importar tus leads
                  anteriores con el botón de arriba.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "flex-end",
            marginTop: 12,
          }}
        >
          <button
            style={buttonStyle}
            disabled={page === 0}
            onClick={() => setPage((value) => Math.max(0, value - 1))}
          >
            Anterior
          </button>
          <span style={{ fontSize: 13 }}>
            Página {page + 1} de {totalPages}
          </span>
          <button
            style={buttonStyle}
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((value) => value + 1)}
          >
            Siguiente
          </button>
        </div>
      </section>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Leads",
})

export default LeadsPage
