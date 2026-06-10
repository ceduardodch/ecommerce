import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { runFollowupDispatch } from "../../../../../../modules/b2b-crm/followup-dispatch"

type DispatchBody = {
  dryRun?: boolean
  limit?: number
  phone?: string
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as DispatchBody

  const result = await runFollowupDispatch(req.scope, {
    dryRun: Boolean(body.dryRun),
    limit: body.limit,
    phone: body.phone,
  })

  res.json(result)
}
