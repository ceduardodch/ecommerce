import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { crmService } from "../../../_shared"
import type { CrmCustomerInput } from "../../../../../../modules/b2b-crm/types"

type ImportBody = {
  customers?: CrmCustomerInput[]
  defaults?: {
    journeyStage?: string
    nextFollowupAt?: string
    followupReason?: string
    tags?: string[]
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as ImportBody
  const customers = body.customers || []

  if (!customers.length) {
    return res.status(400).json({ error: "sin_clientes" })
  }

  const defaults = body.defaults || {}
  const withDefaults = customers.map((customer) => ({
    ...customer,
    tags: [...(defaults.tags || []), ...(customer.tags || [])],
    nextFollowupAt: customer.nextFollowupAt || defaults.nextFollowupAt,
    followupReason: customer.followupReason || defaults.followupReason,
    metadata: {
      ...(defaults.journeyStage ? { journeyStage: defaults.journeyStage } : {}),
      source_import: "admin_csv",
      ...(customer.metadata || {}),
    },
  }))

  const result = await crmService(req).importCustomers(withDefaults)
  res.json(result)
}
