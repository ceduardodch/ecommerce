import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  crmService,
  serializeCustomer,
  serializeEvent,
  serializeOrder,
} from "../../_shared"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const asOf = String(req.query.asOf || new Date().toISOString())
  const dashboard = await crmService(req).dashboard(asOf)

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
    campaignDraftQueue: dashboard.dueFollowups.map((customer: any) =>
      serializeCustomer(customer),
    ),
  })
}
