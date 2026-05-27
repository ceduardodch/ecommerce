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
    recentEvents: dashboard.recentEvents.map(serializeEvent),
    campaignDraftQueue: dashboard.dueFollowups.map((customer: any) =>
      serializeCustomer(customer),
    ),
  })
}
