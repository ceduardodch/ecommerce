import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { crmService } from "../../_shared"
import {
  selectDispatchTargets,
  dispatchFollowup,
  loadDispatchConfig,
  renderTemplate,
} from "../../../../../modules/b2b-crm/followup-dispatch"

const broadcastSchema = z.object({
  filter: z.object({
    stage: z.string().optional(),
    tag: z.string().optional(),
    consent: z.boolean().optional(),
    vertical: z.enum(["cocina", "bienestar", "cross-sell-cocina", "cross-sell-bienestar"]).optional(),
  }),
  templateKey: z.string().min(1),
  dryRun: z.boolean().default(false),
})

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const crm = crmService(req)
  const config = loadDispatchConfig()

  // Validar input
  const input = broadcastSchema.parse(req.body)

  // Resolver segmento con searchCustomers
  const { customers } = await crm.searchCustomers({
    ...input.filter,
    limit: 2000, // Máximo 2000 candidatos para broadcasts
  })

  // Obtener eventos para validar opt-outs y cooldown
  const eventsByPhone = new Map<string, any[]>()
  for (const customer of customers) {
    const events = await crm.listCustomerEvents(customer.phone, 50)
    eventsByPhone.set(customer.phone, events)
  }

  // Aplicar guardrails con selectDispatchTargets
  const maxPerDay = Number(process.env.CRM_BROADCAST_MAX_PER_DAY || "50")
  const { targets, skipped } = selectDispatchTargets(customers, eventsByPhone, {
    cooldownDays: config.cooldownDays,
    maxPerRun: maxPerDay,
    now: new Date(),
  })

  // Obtener plantilla
  const template = await crm.getTemplate(input.templateKey)
  if (!template?.body) {
    return res.status(400).json({
      error: "template_not_found",
      message: `No se encontró la plantilla con key "${input.templateKey}"`,
    })
  }

  // Si es dryRun, devolver conteo y muestra
  if (input.dryRun) {
    const sample = targets.slice(0, 3).map((customer: any) => {
      const lastPurchase = customer.last_purchase_at
        ? new Date(customer.last_purchase_at)
        : undefined
      const daysSincePurchase = lastPurchase
        ? Math.floor((new Date().getTime() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24))
        : undefined

      return {
        phone: customer.phone,
        name: customer.name,
        renderedMessage: renderTemplate(template, {
          name: customer.name,
          purchased_products: customer.purchased_products,
          daysSincePurchase,
        }),
      }
    })

    return res.json({
      dryRun: true,
      totalCandidates: customers.length,
      eligibleTargets: targets.length,
      skipped: skipped.length,
      skipReasons: skipped.reduce((acc: Record<string, number>, entry: any) => {
        acc[entry.reason] = (acc[entry.reason] || 0) + 1
        return acc
      }, {}),
      sample,
    })
  }

  // Despachar mensajes
  const now = new Date()
  const results: any[] = []

  for (const customer of targets) {
    // Calcular días desde la última compra
    const lastPurchase = customer.last_purchase_at
      ? new Date(customer.last_purchase_at)
      : undefined
    const daysSincePurchase = lastPurchase
      ? Math.floor((now.getTime() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24))
      : undefined

    // Renderizar mensaje con plantilla
    const message = renderTemplate(template, {
      name: customer.name,
      purchased_products: customer.purchased_products,
      daysSincePurchase,
    })

    // Despachar
    const outcome = await dispatchFollowup(customer, message, config)

    // Registrar evento
    await crm.addCustomerEvent({
      phone: customer.phone,
      type: outcome.status === "sent" ? "broadcast_sent" : "broadcast_queued",
      at: now.toISOString(),
      source: outcome.status === "sent" ? "openclaw-broadcast" : "crm-broadcast",
      payload: {
        suggestedMessage: message,
        templateKey: input.templateKey,
        filter: input.filter,
        mode: config.mode,
        detail: outcome.detail,
      },
    })

    results.push({
      phone: customer.phone,
      status: outcome.status,
      detail: outcome.detail,
    })
  }

  return res.json({
    broadcast: {
      templateKey: input.templateKey,
      filter: input.filter,
    },
    results: {
      totalCandidates: customers.length,
      sent: results.filter((r) => r.status === "sent").length,
      queued: results.filter((r) => r.status === "queued").length,
      skipped: skipped.length,
      details: results,
      skipReasons: skipped.reduce((acc: Record<string, number>, entry: any) => {
        acc[entry.reason] = (acc[entry.reason] || 0) + 1
        return acc
      }, {}),
    },
  })
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const crm = crmService(req)
  const limit = Number(req.query.limit || 50)
  const events = await crm.listRecentBroadcasts(limit)

  return res.json({
    broadcasts: events.map((event: any) => ({
      phone: event.phone,
      type: event.type,
      at: event.at instanceof Date ? event.at.toISOString() : event.at,
      templateKey: event.payload?.templateKey,
      filter: event.payload?.filter,
      mode: event.payload?.mode,
      source: event.source,
    })),
  })
}
