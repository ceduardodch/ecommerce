#!/usr/bin/env node
/**
 * Gestiona las plantillas de WhatsApp en Meta (Cloud API).
 *
 *   node scripts/meta-whatsapp-templates.mjs list      # estado de aprobación
 *   node scripts/meta-whatsapp-templates.mjs create    # crea las que falten
 *   node scripts/meta-whatsapp-templates.mjs create --video   # con header de video
 *
 * Credenciales por entorno (NUNCA se escriben en el repo):
 *   WHATSAPP_BUSINESS_ACCOUNT_ID  (WABA ID, en Meta Business Settings)
 *   WHATSAPP_ACCESS_TOKEN         (el mismo del webhook de Vicky)
 *   META_API_VERSION              (opcional, default v23.0)
 *
 * Las plantillas usan 3 variables en el body: {{1}} nombre, {{2}} producto,
 * {{3}} días — el mismo orden que envía buildMetaTemplatePayload.
 */

const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
const token = process.env.WHATSAPP_ACCESS_TOKEN
const apiVersion = process.env.META_API_VERSION || "v23.0"
const command = process.argv[2] || "list"
const withVideo = process.argv.includes("--video")

if (!wabaId || !token) {
  console.error(
    "Faltan credenciales. Exporta WHATSAPP_BUSINESS_ACCOUNT_ID y WHATSAPP_ACCESS_TOKEN.",
  )
  process.exit(1)
}

const base = `https://graph.facebook.com/${apiVersion}`

/**
 * Cuerpos de las plantillas. Meta exige texto plano con {{n}} y NO permite
 * que el body empiece/termine con variable ni dos variables seguidas.
 */
const TEMPLATES = [
  {
    name: "eterniu_recompra",
    body:
      "Hola {{1}}, soy Vicky de Eter Niu. Han pasado {{3}} dias desde que llevaste tu {{2}}. " +
      "Te ayudo con la reposicion o quieres ver algo nuevo para tu cocina?",
    example: ["Carlos", "Wok de granito 32 cm", "92"],
  },
  {
    name: "eterniu_complemento",
    body:
      "Hola {{1}}, soy Vicky de Eter Niu. Vi que tienes tu {{2}} desde hace {{3}} dias. " +
      "Tengo piezas que combinan perfecto con eso. Te muestro dos opciones?",
    example: ["Carlos", "Wok de granito 32 cm", "35"],
  },
  {
    name: "eterniu_cuidado",
    body:
      "Hola {{1}}, para que tu {{2}} te dure anos: fuego medio, utensilios suaves y lavado " +
      "sin esponja abrasiva. Han pasado {{3}} dias desde tu compra. Te paso la guia completa?",
    example: ["Carlos", "Wok de granito 32 cm", "15"],
  },
  {
    name: "eterniu_estacional",
    body:
      "Hola {{1}}, soy Vicky de Eter Niu. Preparamos una seleccion especial de temporada " +
      "pensando en tu {{2}}. Hace {{3}} dias fue tu ultima compra. Te la comparto?",
    example: ["Carlos", "Wok de granito 32 cm", "120"],
  },
  {
    name: "eterniu_xsell_cocina",
    body:
      "Hola {{1}}, ademas de tu {{2}} tenemos linea de cocina en granito libre de PFAS. " +
      "Han pasado {{3}} dias desde tu compra. Te muestro lo mas pedido?",
    example: ["Carlos", "Mat de yoga", "60"],
  },
  {
    name: "eterniu_nps",
    body:
      "Hola {{1}}, como te ha ido con tu {{2}}? Han pasado {{3}} dias desde tu compra. " +
      "Del 1 al 10, que tanto nos recomendarias? Tu respuesta nos ayuda muchisimo.",
    example: ["Carlos", "Wok de granito 32 cm", "30"],
  },
  {
    name: "eterniu_referido",
    body:
      "Hola {{1}}, gracias por confiar en Eter Niu con tu {{2}} hace {{3}} dias. " +
      "Si conoces a alguien que quiera cocinar sin toxicos, pasale mi contacto y lo atiendo con gusto.",
    example: ["Carlos", "Wok de granito 32 cm", "60"],
  },
  {
    name: "eterniu_xsell_bienestar",
    body:
      "Hola {{1}}, ya que cuidas lo que cocinas con tu {{2}}, tenemos una linea de bienestar " +
      "que combina muy bien. Hace {{3}} dias fue tu ultima compra. Te comparto lo mas pedido?",
    example: ["Carlos", "Wok de granito 32 cm", "45"],
  },
]

async function graph(path, init) {
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  })
  const json = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = json?.error?.error_user_msg || json?.error?.message || response.status
    throw new Error(String(message))
  }
  return json
}

async function listTemplates() {
  const data = await graph(
    `/${wabaId}/message_templates?fields=name,status,category,language,components&limit=100`,
  )
  return data.data || []
}

function buildComponents(template) {
  const components = [
    {
      type: "BODY",
      text: template.body,
      example: { body_text: [template.example] },
    },
  ]
  if (withVideo) {
    // Header de video: Meta exige un handle de ejemplo. Se sube aparte con
    // Resumable Upload API; aquí se declara el header para que el video de la
    // plantilla del admin pueda enviarse fuera de la ventana de 24h.
    components.unshift({ type: "HEADER", format: "VIDEO" })
  }
  return components
}

async function main() {
  const existing = await listTemplates()
  const byName = new Map(existing.map((t) => [t.name, t]))

  if (command === "list") {
    console.log(`Plantillas en la cuenta (${existing.length}):\n`)
    for (const template of TEMPLATES) {
      const found = byName.get(template.name)
      const icon =
        found?.status === "APPROVED" ? "✅" : found ? "⏳" : "❌"
      console.log(
        `${icon} ${template.name.padEnd(26)} ${found ? found.status : "NO EXISTE"}`,
      )
    }
    const otras = existing.filter((t) => !TEMPLATES.some((x) => x.name === t.name))
    if (otras.length) {
      console.log(`\nOtras plantillas en la cuenta: ${otras.map((t) => `${t.name} (${t.status})`).join(", ")}`)
    }
    return
  }

  if (command !== "create") {
    console.error(`Comando desconocido: ${command}. Usa "list" o "create".`)
    process.exit(1)
  }

  for (const template of TEMPLATES) {
    if (byName.has(template.name)) {
      console.log(`⏭️  ${template.name} ya existe (${byName.get(template.name).status})`)
      continue
    }
    try {
      const result = await graph(`/${wabaId}/message_templates`, {
        method: "POST",
        body: JSON.stringify({
          name: template.name,
          language: "es",
          category: "MARKETING",
          components: buildComponents(template),
        }),
      })
      console.log(`✅ ${template.name} creada (id ${result.id}, estado ${result.status || "PENDING"})`)
    } catch (cause) {
      console.error(`❌ ${template.name}: ${cause.message}`)
    }
  }

  console.log(
    "\nMeta revisa las plantillas nuevas (suele tardar de minutos a 24h).",
    "\nVuelve a correr el comando 'list' para ver cuándo quedan APPROVED.",
  )
}

main().catch((cause) => {
  console.error("Error:", cause.message)
  process.exit(1)
})
