import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

type MediaKind = "video" | "image" | "document"

type TemplateRow = {
  id: string
  key: string
  label?: string | null
  body: string
  mediaUrl?: string | null
  mediaType?: MediaKind | null
  active: boolean
  createdAt: string
  updatedAt: string
}

type TemplatesResponse = {
  templates: TemplateRow[]
}

type UpdateResponse = {
  template: TemplateRow
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

const textareaStyle = {
  ...inputStyle,
  minWidth: "100%",
  minHeight: 80,
  fontFamily: "monospace",
  resize: "vertical" as const,
}

function formatDate(value?: string) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function TemplatesPage() {
  const [data, setData] = useState<TemplatesResponse | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [editBody, setEditBody] = useState("")
  const [editActive, setEditActive] = useState(true)
  const [editMediaUrl, setEditMediaUrl] = useState("")
  const [editMediaType, setEditMediaType] = useState<MediaKind>("video")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | undefined>()
  const [status, setStatus] = useState<string | undefined>()
  // Formulario de creación
  const [newKey, setNewKey] = useState("")
  const [newLabel, setNewLabel] = useState("")
  const [newBody, setNewBody] = useState("")
  const [newMediaUrl, setNewMediaUrl] = useState("")
  const [newMediaType, setNewMediaType] = useState<MediaKind>("video")

  const reload = () => {
    fetch("/admin/b2b/crm/templates?active=false", { credentials: "include" })
      .then((r) => r.json() as Promise<TemplatesResponse>)
      .then(setData)
      .catch(() => undefined)
  }

  useEffect(() => {
    let mounted = true
    setLoading(true)

    fetch("/admin/b2b/crm/templates?active=false", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<TemplatesResponse>
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
  }, [])

  const startEdit = (template: TemplateRow) => {
    setEditing(template.id)
    setEditBody(template.body)
    setEditActive(template.active)
    setEditMediaUrl(template.mediaUrl || "")
    setEditMediaType((template.mediaType as MediaKind) || "video")
    setSaveError(undefined)
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditBody("")
    setEditActive(true)
    setSaveError(undefined)
  }

  const saveEdit = async (key: string) => {
    setSaving(true)
    setSaveError(undefined)

    try {
      const response = await fetch("/admin/b2b/crm/templates", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          body: editBody,
          active: editActive,
          mediaUrl: editMediaUrl.trim() || null,
          mediaType: editMediaUrl.trim() ? editMediaType : null,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`HTTP ${response.status}: ${error}`)
      }

      const result = (await response.json()) as UpdateResponse

      // Actualizar la lista local
      setData((prev) => ({
        templates: (prev?.templates || []).map((t) =>
          t.id === result.template.id ? result.template : t
        ),
      }))

      setEditing(null)
      setEditBody("")
      setEditActive(true)
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  async function seedTemplates() {
    setStatus("Sembrando plantillas base...")
    try {
      const response = await fetch("/admin/b2b/crm/templates/seed", {
        method: "POST",
        credentials: "include",
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const result = (await response.json()) as { message?: string }
      setStatus(result.message || "Listo")
      reload()
    } catch (cause) {
      setStatus(`Error: ${cause instanceof Error ? cause.message : cause}`)
    }
  }

  async function createTemplate() {
    setStatus("Creando plantilla...")
    try {
      const response = await fetch("/admin/b2b/crm/templates", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: newKey.trim().toLowerCase(),
          label: newLabel.trim() || undefined,
          body: newBody,
          mediaUrl: newMediaUrl.trim() || null,
          mediaType: newMediaUrl.trim() ? newMediaType : null,
        }),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`)
      setStatus(`Plantilla "${newKey}" guardada.`)
      setNewKey("")
      setNewLabel("")
      setNewBody("")
      setNewMediaUrl("")
      reload()
    } catch (cause) {
      setStatus(`Error: ${cause instanceof Error ? cause.message : cause}`)
    }
  }

  const keyLabels: Record<string, string> = {
    recompra: "Recompra (30-90 días)",
    complemento: "Complemento (30 días)",
    cuidado: "Cuidado post-venta",
    estacional: "Estacional (Navidad, etc.)",
    cross_sell_cocina: "Cross-sell: Bienestar → Cocina",
    cross_sell_bienestar: "Cross-sell: Cocina → Bienestar",
    generico: "Genérico (fallback)",
  }

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
            / Plantillas
          </p>
          <h1 style={{ fontSize: 28, margin: "4px 0 0" }}>
            Plantillas de mensajes
          </h1>
          <p style={{ color: "var(--fg-subtle)", fontSize: 13, margin: "4px 0 0" }}>
            Variables disponibles: {`{nombre}`}, {`{producto}`}, {`{dias}`}
          </p>
        </div>
        <div style={{ display: "grid", gap: 6, justifyItems: "end" }}>
          <button style={buttonStyle} onClick={seedTemplates}>
            Sembrar plantillas base
          </button>
          {status ? (
            <small style={{ color: "var(--fg-subtle)" }}>{status}</small>
          ) : null}
        </div>
      </header>

      {error ? (
        <section style={cardStyle}>
          <p style={{ color: "var(--fg-error, #e5484d)" }}>
            No se pudo cargar la lista: {error}
          </p>
        </section>
      ) : null}

      <section style={cardStyle}>
        <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>Crear plantilla</h2>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
          <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
            Key (sin espacios, ej. promo_julio)
            <input
              style={inputStyle}
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="promo_julio"
            />
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
            Nombre visible
            <input
              style={inputStyle}
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Promo julio - wok"
            />
          </label>
        </div>
        <label style={{ display: "grid", gap: 4, fontSize: 12, marginTop: 10 }}>
          Mensaje (usa {`{nombre}`}, {`{producto}`}, {`{dias}`})
          <textarea
            style={textareaStyle}
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Hola {nombre} 👋 ..."
          />
        </label>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "2fr 1fr", marginTop: 10 }}>
          <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
            Adjunto opcional (URL https pública)
            <input
              style={inputStyle}
              value={newMediaUrl}
              onChange={(e) => setNewMediaUrl(e.target.value)}
              placeholder="https://cocina.eter-niu.com/media/demo.mp4"
            />
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
            Tipo
            <select
              style={inputStyle}
              value={newMediaType}
              onChange={(e) => setNewMediaType(e.target.value as MediaKind)}
            >
              <option value="video">Video</option>
              <option value="image">Imagen</option>
              <option value="document">Documento</option>
            </select>
          </label>
        </div>
        <button
          style={{ ...buttonStyle, marginTop: 12 }}
          onClick={createTemplate}
          disabled={!newKey.trim() || newBody.trim().length < 10}
        >
          Guardar plantilla
        </button>
      </section>

      <section style={cardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellStyle}>Key</th>
              <th style={cellStyle}>Mensaje</th>
              <th style={cellStyle}>Adjunto</th>
              <th style={cellStyle}>Activa</th>
              <th style={cellStyle}>Acciones</th>
              <th style={cellStyle}>Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {(data?.templates || []).map((template) => (
              <tr key={template.id}>
                <td style={cellStyle}>
                  <strong>{template.label || keyLabels[template.key] || template.key}</strong>
                  <br />
                  <code style={{ fontSize: 11, color: "var(--fg-subtle)" }}>
                    {template.key}
                  </code>
                </td>
                <td style={cellStyle}>
                  {editing === template.id ? (
                    <textarea
                      style={textareaStyle}
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      disabled={saving}
                    />
                  ) : (
                    <div style={{ maxWidth: 400, whiteSpace: "pre-wrap" as const }}>
                      {template.body}
                    </div>
                  )}
                </td>
                <td style={cellStyle}>
                  {editing === template.id ? (
                    <div style={{ display: "grid", gap: 6, minWidth: 220 }}>
                      <input
                        style={{ ...inputStyle, fontSize: 12 }}
                        value={editMediaUrl}
                        onChange={(e) => setEditMediaUrl(e.target.value)}
                        placeholder="https://... (opcional)"
                        disabled={saving}
                      />
                      <select
                        style={{ ...inputStyle, fontSize: 12 }}
                        value={editMediaType}
                        onChange={(e) => setEditMediaType(e.target.value as MediaKind)}
                        disabled={saving || !editMediaUrl.trim()}
                      >
                        <option value="video">Video</option>
                        <option value="image">Imagen</option>
                        <option value="document">Documento</option>
                      </select>
                    </div>
                  ) : template.mediaUrl ? (
                    <div style={{ display: "grid", gap: 4, maxWidth: 200 }}>
                      <span style={{ fontSize: 11 }}>
                        {template.mediaType === "video" ? "🎬" : template.mediaType === "image" ? "🖼️" : "📄"}{" "}
                        {template.mediaType}
                      </span>
                      {template.mediaType === "video" ? (
                        <video
                          src={template.mediaUrl}
                          style={{ width: "100%", borderRadius: 6 }}
                          controls
                          preload="metadata"
                        />
                      ) : template.mediaType === "image" ? (
                        <img
                          src={template.mediaUrl}
                          alt="Adjunto"
                          style={{ width: "100%", borderRadius: 6 }}
                        />
                      ) : null}
                    </div>
                  ) : (
                    <span style={{ color: "var(--fg-subtle)", fontSize: 12 }}>—</span>
                  )}
                </td>
                <td style={cellStyle}>
                  {editing === template.id ? (
                    <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={editActive}
                        onChange={(e) => setEditActive(e.target.checked)}
                        disabled={saving}
                      />
                      Activa
                    </label>
                  ) : template.active ? (
                    "✅ Sí"
                  ) : (
                    "❌ No"
                  )}
                </td>
                <td style={cellStyle}>
                  {editing === template.id ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        style={{ ...buttonStyle, fontSize: 12 }}
                        onClick={() => saveEdit(template.key)}
                        disabled={saving || !editBody.trim()}
                      >
                        {saving ? "Guardando..." : "Guardar"}
                      </button>
                      <button
                        style={{ ...buttonStyle, fontSize: 12 }}
                        onClick={cancelEdit}
                        disabled={saving}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      style={{ ...buttonStyle, fontSize: 12 }}
                      onClick={() => startEdit(template)}
                    >
                      Editar
                    </button>
                  )}
                  {editing === template.id && saveError ? (
                    <div style={{ color: "var(--fg-error, #e5484d)", fontSize: 11, marginTop: 4 }}>
                      {saveError}
                    </div>
                  ) : null}
                </td>
                <td style={cellStyle}>
                  <small style={{ color: "var(--fg-subtle)" }}>
                    {formatDate(template.updatedAt)}
                  </small>
                </td>
              </tr>
            ))}
            {!loading && !(data?.templates || []).length ? (
              <tr>
                <td colSpan={6} style={cellStyle}>
                  No hay plantillas configuradas. Usa "Sembrar plantillas base".
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      <section style={{ ...cardStyle, fontSize: 12, color: "var(--fg-subtle)" }}>
        <p>
          <strong>Nota:</strong> Estas plantillas se usan automáticamente en el
          dispatcher de followups y en las campañas. El mensaje sugerido en la ficha
          del cliente usa la misma plantilla para consistencia.
        </p>
        <p>
          <strong>Sobre el adjunto (video/imagen):</strong> WhatsApp solo permite
          enviar media libremente cuando el cliente te escribió en las últimas 24
          horas. Fuera de esa ventana, Meta exige una plantilla aprobada por ellos;
          si esa plantilla no tiene encabezado de video, el mensaje sale solo con
          texto. El adjunto debe estar en una URL https pública (Meta lo descarga):
          video mp4 hasta 16 MB, imagen jpg/png hasta 5 MB.
        </p>
      </section>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Plantillas",
})

export default TemplatesPage
