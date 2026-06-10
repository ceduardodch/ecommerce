import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import * as XLSX from "xlsx"
import {
  autoMapColumns,
  ColumnMapping,
  LEAD_FIELDS,
  LeadField,
  PreparedRow,
  prepareImportRows,
} from "../../../lib/lead-import"

const BATCH_SIZE = 200

const cardStyle = {
  border: "1px solid var(--border-base)",
  borderRadius: 8,
  background: "var(--bg-base)",
  padding: 16,
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  fontSize: 12,
}

const cellStyle = {
  borderTop: "1px solid var(--border-base)",
  padding: "6px 8px",
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

type ImportSummary = {
  created: number
  updated: number
  errors: Array<{ row: number; phone?: string; error: string }>
}

function readWorkbook(buffer: ArrayBuffer) {
  const workbook = XLSX.read(buffer, { type: "array" })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    raw: false,
    defval: "",
  })
  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, String(value ?? "")]),
    ),
  )
}

function ImportLeadsPage() {
  const [fileName, setFileName] = useState("")
  const [rows, setRows] = useState<Array<Record<string, string>>>([])
  const [mapping, setMapping] = useState<ColumnMapping>({})
  const [defaults, setDefaults] = useState({
    journeyStage: "",
    nextFollowupAt: "",
    tags: "",
  })
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState("")
  const [summary, setSummary] = useState<ImportSummary | undefined>()
  const [error, setError] = useState<string | undefined>()

  const headers = rows.length ? Object.keys(rows[0]) : []

  const prepared: PreparedRow[] = useMemo(() => {
    if (!rows.length || !Object.keys(mapping).length) return []
    return prepareImportRows(rows, mapping)
  }, [rows, mapping])

  const validRows = prepared.filter((row) => row.customer && !row.duplicateOfRow)
  const duplicateRows = prepared.filter((row) => row.duplicateOfRow)
  const invalidRows = prepared.filter((row) => !row.customer)
  const phoneMapped = Object.values(mapping).includes("phone")

  async function onFile(file: File | undefined) {
    if (!file) return
    setError(undefined)
    setSummary(undefined)
    setFileName(file.name)
    try {
      const buffer = await file.arrayBuffer()
      const parsed = readWorkbook(buffer)
      if (!parsed.length) {
        setError("El archivo no tiene filas de datos.")
        setRows([])
        return
      }
      setRows(parsed)
      setMapping(autoMapColumns(Object.keys(parsed[0])))
    } catch (cause) {
      setError(
        `No se pudo leer el archivo: ${cause instanceof Error ? cause.message : cause}`,
      )
      setRows([])
    }
  }

  async function runImport() {
    if (!validRows.length) return
    setImporting(true)
    setSummary(undefined)
    setError(undefined)

    const payloadDefaults = {
      journeyStage: defaults.journeyStage.trim() || undefined,
      nextFollowupAt: defaults.nextFollowupAt
        ? new Date(`${defaults.nextFollowupAt}T12:00:00`).toISOString()
        : undefined,
      tags: defaults.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    }

    const total: ImportSummary = {
      created: 0,
      updated: 0,
      errors: invalidRows.map((row) => ({
        row: row.row,
        phone: undefined,
        error: row.error || "fila_invalida",
      })),
    }

    try {
      const customers = validRows.map((row) => row.customer!)
      for (let index = 0; index < customers.length; index += BATCH_SIZE) {
        const batch = customers.slice(index, index + BATCH_SIZE)
        setProgress(
          `Importando ${Math.min(index + BATCH_SIZE, customers.length)} de ${customers.length}...`,
        )
        const response = await fetch("/admin/b2b/crm/customers/import", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customers: batch, defaults: payloadDefaults }),
        })
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const result = (await response.json()) as ImportSummary
        total.created += result.created
        total.updated += result.updated
        total.errors.push(...(result.errors || []))
      }
      setSummary(total)
    } catch (cause) {
      setError(
        `La importación falló: ${cause instanceof Error ? cause.message : cause}`,
      )
    } finally {
      setImporting(false)
      setProgress("")
    }
  }

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
          / Importar
        </p>
        <h1 style={{ fontSize: 28, margin: "4px 0 0" }}>
          Importar leads (CSV / Excel)
        </h1>
      </header>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>1. Archivo</h2>
        <p style={{ fontSize: 13, color: "var(--fg-subtle)" }}>
          Sube un .csv o .xlsx con una fila por lead. La única columna
          obligatoria es el teléfono; los números 09XXXXXXXX se convierten
          automáticamente a +593.
        </p>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(event) => onFile(event.target.files?.[0])}
        />
        {fileName ? (
          <p style={{ fontSize: 13 }}>
            <strong>{fileName}</strong> — {rows.length} filas
          </p>
        ) : null}
        {error ? (
          <p style={{ fontSize: 13, color: "var(--fg-error, #e5484d)" }}>{error}</p>
        ) : null}
      </section>

      {headers.length ? (
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>2. Mapeo de columnas</h2>
          <div
            style={{
              display: "grid",
              gap: 8,
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            }}
          >
            {headers.map((header) => (
              <label key={header} style={{ fontSize: 13 }}>
                <span style={{ display: "block", color: "var(--fg-subtle)" }}>
                  {header}
                </span>
                <select
                  style={{ ...inputStyle, width: "100%" }}
                  value={mapping[header] || "ignore"}
                  onChange={(event) =>
                    setMapping({
                      ...mapping,
                      [header]: event.target.value as LeadField,
                    })
                  }
                >
                  <option value="ignore">(ignorar)</option>
                  {LEAD_FIELDS.map((definition) => (
                    <option key={definition.field} value={definition.field}>
                      {definition.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <h3>Valores por defecto del lote (opcional)</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
            <input
              style={inputStyle}
              placeholder="Etapa (ej. lead_importado)"
              value={defaults.journeyStage}
              onChange={(event) =>
                setDefaults({ ...defaults, journeyStage: event.target.value })
              }
            />
            <input
              type="date"
              style={inputStyle}
              title="Próximo seguimiento para leads sin fecha"
              value={defaults.nextFollowupAt}
              onChange={(event) =>
                setDefaults({ ...defaults, nextFollowupAt: event.target.value })
              }
            />
            <input
              style={inputStyle}
              placeholder="Etiquetas extra (coma)"
              value={defaults.tags}
              onChange={(event) =>
                setDefaults({ ...defaults, tags: event.target.value })
              }
            />
          </div>
          {!phoneMapped ? (
            <p style={{ fontSize: 13, color: "var(--fg-error, #e5484d)" }}>
              Asigna una columna al campo "Teléfono (WhatsApp)" para continuar.
            </p>
          ) : null}
        </section>
      ) : null}

      {phoneMapped && prepared.length ? (
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>3. Vista previa y validación</h2>
          <p style={{ fontSize: 13 }}>
            <strong>{validRows.length}</strong> filas listas ·{" "}
            <strong>{duplicateRows.length}</strong> duplicadas en el archivo
            (se omiten) · <strong>{invalidRows.length}</strong> con error
          </p>
          <div style={{ maxHeight: 360, overflow: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={cellStyle}>Fila</th>
                  <th style={cellStyle}>Teléfono</th>
                  <th style={cellStyle}>Nombre</th>
                  <th style={cellStyle}>Producto</th>
                  <th style={cellStyle}>Próx. seguimiento</th>
                  <th style={cellStyle}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {prepared.slice(0, 100).map((row) => (
                  <tr
                    key={row.row}
                    style={
                      row.error || row.duplicateOfRow
                        ? { color: "var(--fg-error, #e5484d)" }
                        : undefined
                    }
                  >
                    <td style={cellStyle}>{row.row}</td>
                    <td style={cellStyle}>
                      {row.customer?.phone || row.raw[
                        Object.keys(mapping).find(
                          (header) => mapping[header] === "phone",
                        ) || ""
                      ] || "-"}
                    </td>
                    <td style={cellStyle}>{row.customer?.name || "-"}</td>
                    <td style={cellStyle}>
                      {row.customer?.purchasedProducts?.[0]?.title || "-"}
                    </td>
                    <td style={cellStyle}>
                      {row.customer?.nextFollowupAt
                        ? row.customer.nextFollowupAt.slice(0, 10)
                        : "-"}
                    </td>
                    <td style={cellStyle}>
                      {row.error
                        ? `Error: ${row.error}`
                        : row.duplicateOfRow
                          ? `Duplicado de fila ${row.duplicateOfRow}`
                          : "OK"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {prepared.length > 100 ? (
              <p style={{ fontSize: 12, color: "var(--fg-subtle)" }}>
                Mostrando las primeras 100 filas de {prepared.length}.
              </p>
            ) : null}
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
            <button
              style={buttonStyle}
              disabled={importing || !validRows.length}
              onClick={runImport}
            >
              {importing
                ? progress || "Importando..."
                : `Importar ${validRows.length} leads`}
            </button>
          </div>
        </section>
      ) : null}

      {summary ? (
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Resultado</h2>
          <p style={{ fontSize: 14 }}>
            <strong>{summary.created}</strong> creados ·{" "}
            <strong>{summary.updated}</strong> actualizados ·{" "}
            <strong>{summary.errors.length}</strong> errores
          </p>
          {summary.errors.length ? (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={cellStyle}>Fila</th>
                  <th style={cellStyle}>Teléfono</th>
                  <th style={cellStyle}>Error</th>
                </tr>
              </thead>
              <tbody>
                {summary.errors.map((row, index) => (
                  <tr key={`${row.row}-${index}`}>
                    <td style={cellStyle}>{row.row}</td>
                    <td style={cellStyle}>{row.phone || "-"}</td>
                    <td style={cellStyle}>{row.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          <p style={{ marginTop: 12 }}>
            <Link to="/crm-whatsapp/leads" style={{ ...buttonStyle, textDecoration: "none" }}>
              Ver leads importados
            </Link>
          </p>
        </section>
      ) : null}
    </div>
  )
}

export const config = defineRouteConfig({})

export default ImportLeadsPage
