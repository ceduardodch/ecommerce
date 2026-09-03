#!/usr/bin/env node
/**
 * Inspector de solo lectura contra el admin de producción.
 *
 * Solo emite peticiones GET: no despacha campañas, no muta clientes y no
 * escribe eventos. Sirve para auditar lo que YA pasó (REGLA #1: verificar
 * contra evidencia antes de afirmar).
 *
 * Credenciales: `.env.prod.local` (gitignored). Ver `.env.prod.local.template`.
 *
 * Uso:
 *   node scripts/prod-inspect.mjs health
 *   node scripts/prod-inspect.mjs broadcasts [limit]
 *   node scripts/prod-inspect.mjs statuses [limit]
 *   node scripts/prod-inspect.mjs verify-campaign [templateKey] [limit]
 *   node scripts/prod-inspect.mjs customer <telefono>
 */

import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")

// El sentinel bajo el que el webhook agrupa los acuses de Meta.
// Ver services/ecommerce-tools/src/whatsapp-webhook.ts (`phone: "status"`).
const STATUS_SENTINEL = "status"

function loadEnv() {
  const path = resolve(repoRoot, ".env.prod.local")
  let raw
  try {
    raw = readFileSync(path, "utf8")
  } catch {
    fail(
      `No existe ${path}\n` +
        `Crealo con:  cp .env.prod.local.template .env.prod.local\n` +
        `y llena PROD_ADMIN_URL y PROD_ADMIN_API_KEY.`,
    )
  }

  const env = {}
  for (const line of raw.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const index = trimmed.indexOf("=")
    if (index === -1) continue
    env[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim()
  }
  return env
}

function fail(message) {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

/** Basic auth con la secret key como usuario y contraseña vacía (Medusa v2). */
function authHeader(apiKey) {
  return `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`
}

async function getJson(config, path) {
  const url = new URL(path, config.baseUrl)
  const response = await fetch(url, {
    headers: { Authorization: authHeader(config.apiKey), Accept: "application/json" },
  })
  const text = await response.text()

  if (!response.ok) {
    const hint =
      response.status === 401
        ? " (¿la secret key es válida y sigue activa?)"
        : ""
    fail(`GET ${path} → HTTP ${response.status}${hint}\n${text.slice(0, 400)}`)
  }

  try {
    return JSON.parse(text)
  } catch {
    fail(`GET ${path} devolvió algo que no es JSON:\n${text.slice(0, 400)}`)
  }
}

function formatDate(value) {
  if (!value) return "-"
  return new Date(value).toISOString().replace("T", " ").slice(0, 19)
}

// --- Subcomandos ------------------------------------------------------------

async function health(config) {
  const data = await getJson(config, "/admin/b2b/crm/dashboard")
  console.log("\n✓ Conexión al admin de producción OK\n")
  console.log("Conteos:")
  for (const [key, value] of Object.entries(data.counts || {})) {
    console.log(`  ${key.padEnd(18)} ${value}`)
  }
  console.log(`\n  opt-outs registrados: ${data.optOuts?.length ?? 0}`)
}

async function fetchBroadcasts(config, limit) {
  const data = await getJson(config, `/admin/b2b/crm/broadcasts?limit=${limit}`)
  return data.broadcasts || []
}

async function broadcasts(config, limit = 50) {
  const rows = await fetchBroadcasts(config, limit)
  if (!rows.length) {
    console.log("\nNo hay eventos de broadcast registrados.\n")
    return
  }

  console.log(`\n${rows.length} evento(s) de broadcast (más reciente primero):\n`)
  console.log(
    "ESTADO".padEnd(9) +
      "TELEFONO".padEnd(16) +
      "FECHA (UTC)".padEnd(21) +
      "PLANTILLA".padEnd(26) +
      "MODO",
  )
  for (const row of rows) {
    const state = row.type === "broadcast_sent" ? "enviado" : "en cola"
    console.log(
      state.padEnd(9) +
        String(row.phone || "-").padEnd(16) +
        formatDate(row.at).padEnd(21) +
        String(row.templateKey || "-").padEnd(26) +
        String(row.mode || "-"),
    )
  }
}

/** Los acuses de Meta viven como eventos del cliente sentinel `status`. */
async function fetchStatuses(config, limit) {
  const url = `/admin/b2b/crm/customers/${STATUS_SENTINEL}?limit=${limit}`
  const response = await fetch(new URL(url, config.baseUrl), {
    headers: { Authorization: authHeader(config.apiKey), Accept: "application/json" },
  })

  if (response.status === 404) return []
  if (!response.ok) {
    fail(`GET ${url} → HTTP ${response.status}`)
  }

  const data = await response.json()
  return (data.customer?.events || []).filter(
    (event) => event.type === "message_status",
  )
}

async function statuses(config, limit = 200) {
  const rows = await fetchStatuses(config, limit)
  if (!rows.length) {
    console.log(
      "\nNo hay eventos `message_status`.\n" +
        "Eso significa que el webhook de Meta no está entregando acuses,\n" +
        "o que aún no ha llegado ninguno.\n",
    )
    return
  }

  const tally = {}
  for (const row of rows) {
    const state = row.payload?.status || "desconocido"
    tally[state] = (tally[state] || 0) + 1
  }

  console.log(`\n${rows.length} acuse(s) de Meta:\n`)
  for (const [state, count] of Object.entries(tally)) {
    console.log(`  ${state.padEnd(12)} ${count}`)
  }
}

/**
 * El cruce que importa: por cada broadcast enviado, busca su acuse de entrega.
 * Un HTTP 200 de Meta solo prueba que Meta ACEPTÓ el mensaje; la entrega real
 * llega después por webhook.
 */
async function verifyCampaign(config, templateKey, limit = 100) {
  const [allBroadcasts, allStatuses] = await Promise.all([
    fetchBroadcasts(config, limit),
    fetchStatuses(config, 500),
  ])

  const relevant = templateKey
    ? allBroadcasts.filter((row) => row.templateKey === templateKey)
    : allBroadcasts

  if (!relevant.length) {
    console.log(
      `\nNo hay broadcasts${templateKey ? ` con templateKey "${templateKey}"` : ""}.\n`,
    )
    return
  }

  // Último estado conocido por wamid.
  const statusByMessageId = new Map()
  for (const event of allStatuses) {
    const id = event.payload?.messageId
    if (!id) continue
    const previous = statusByMessageId.get(id)
    if (!previous || new Date(event.at) > new Date(previous.at)) {
      statusByMessageId.set(id, {
        at: event.at,
        status: event.payload?.status,
        failedReason: event.payload?.failedReason,
      })
    }
  }

  console.log(`\nCampaña: ${templateKey || "(todas)"}`)
  console.log(`Eventos de broadcast: ${relevant.length}\n`)
  console.log(
    "TELEFONO".padEnd(16) + "DESPACHO".padEnd(10) + "ENTREGA".padEnd(14) + "DETALLE",
  )

  const tally = { sin_acuse: 0 }
  for (const row of relevant) {
    const messageId = row.messageId || row.payload?.messageId
    const status = messageId ? statusByMessageId.get(messageId) : undefined
    const delivery = status?.status || "sin acuse"
    if (status?.status) {
      tally[status.status] = (tally[status.status] || 0) + 1
    } else {
      tally.sin_acuse += 1
    }

    console.log(
      String(row.phone || "-").padEnd(16) +
        (row.type === "broadcast_sent" ? "enviado" : "en cola").padEnd(10) +
        delivery.padEnd(14) +
        (status?.failedReason || ""),
    )
  }

  console.log("\nResumen de entrega:")
  for (const [state, count] of Object.entries(tally)) {
    if (count) console.log(`  ${state.padEnd(12)} ${count}`)
  }

  if (tally.sin_acuse === relevant.length) {
    console.log(
      "\n⚠ Ningún mensaje tiene acuse de entrega.\n" +
        "  Puede ser (a) el webhook de estados no está llegando al servicio, o\n" +
        "  (b) los eventos de broadcast no guardan el wamid en un campo que la\n" +
        "  API GET exponga. Revisa con: node scripts/prod-inspect.mjs statuses",
    )
  }
}

async function customer(config, phone) {
  if (!phone) fail("Falta el teléfono. Uso: prod-inspect.mjs customer 5939XXXXXXX")
  const data = await getJson(
    config,
    `/admin/b2b/crm/customers/${encodeURIComponent(phone)}?limit=50`,
  )
  const record = data.customer
  console.log(`\n${record.name || "(sin nombre)"} — ${record.phone}`)
  console.log(`  consentimiento: ${record.whatsappConsent ? "sí" : "no"}`)
  console.log(`  etapa:          ${record.journeyStage || "-"}`)
  console.log(`\nEventos (${record.events?.length || 0}):`)
  for (const event of record.events || []) {
    console.log(`  ${formatDate(event.at)}  ${String(event.type).padEnd(20)} ${event.source || ""}`)
  }
}

// --- Entrada ----------------------------------------------------------------

async function main() {
  const env = loadEnv()
  const config = {
    baseUrl: (env.PROD_ADMIN_URL || "").replace(/\/+$/, ""),
    apiKey: env.PROD_ADMIN_API_KEY,
  }

  if (!config.baseUrl) fail("Falta PROD_ADMIN_URL en .env.prod.local")
  if (!config.apiKey) fail("Falta PROD_ADMIN_API_KEY en .env.prod.local")

  const [command, ...args] = process.argv.slice(2)

  switch (command) {
    case "health":
      return health(config)
    case "broadcasts":
      return broadcasts(config, Number(args[0]) || 50)
    case "statuses":
      return statuses(config, Number(args[0]) || 200)
    case "verify-campaign":
      return verifyCampaign(config, args[0], Number(args[1]) || 100)
    case "customer":
      return customer(config, args[0])
    default:
      console.log(
        "\nInspector de producción (solo lectura)\n\n" +
          "  health                              prueba la conexión y muestra conteos\n" +
          "  broadcasts [limit]                  eventos de campaña recientes\n" +
          "  statuses [limit]                    acuses de entrega de Meta\n" +
          "  verify-campaign [key] [limit]       cruza despacho contra entrega\n" +
          "  customer <telefono>                 ficha y eventos de un cliente\n",
      )
  }
}

main().catch((cause) => fail(cause instanceof Error ? cause.message : String(cause)))
