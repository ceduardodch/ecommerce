import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  crmService,
  serializeCustomer,
  serializeEvent,
  serializeOrder,
} from "../../_shared"
import { loadDispatchConfig } from "../../../../../modules/b2b-crm/followup-dispatch"

const WINDOW_MS = 24 * 60 * 60 * 1000

/** Predice el modo de envío que usará el dispatcher para este cliente. */
function predictedMode(
  customer: any,
  configMode: string,
  now: Date,
): "meta_freeform" | "meta_template" | "openclaw" | "draft" {
  if (configMode !== "meta") return configMode as "openclaw" | "draft"

  const lastInboundRaw = customer.metadata?.lastInboundAt as string | undefined
  if (!lastInboundRaw) return "meta_template"
  const ts = new Date(lastInboundRaw).getTime()
  if (!Number.isFinite(ts)) return "meta_template"
  return now.getTime() - ts < WINDOW_MS ? "meta_freeform" : "meta_template"
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const asOf = String(req.query.asOf || new Date().toISOString())
  const dashboard = await crmService(req).dashboard(asOf)
  const config = loadDispatchConfig()
  const now = new Date()

  res.json({
    ...dashboard,
    customers: dashboard.customers.map(serializeCustomer),
    pendingOrders: dashboard.pendingOrders.map(serializeOrder),
    paidOrders: dashboard.paidOrders.map(serializeOrder),
    dueFollowups: dashboard.dueFollowups.map(serializeCustomer),
    hotLeads: dashboard.hotLeads.map(serializeCustomer),
    careFollowups: dashboard.careFollowups.map(serializeCustomer),
    complementFollowups: dashboard.complementFollowups.map(serializeCustomer),
    reorderFollowups: dashboard.reorderFollowups.map(serializeCustomer),
    optOuts: dashboard.optOuts.map(serializeCustomer),
    recentEvents: dashboard.recentEvents.map(serializeEvent),
    campaignDraftQueue: dashboard.dueFollowups.map((customer: any) => ({
      ...serializeCustomer(customer),
      mode: predictedMode(customer, config.mode, now),
    })),
  })
}
