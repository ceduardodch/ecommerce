import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { runFollowupDispatch } from "../../../../../../modules/b2b-crm/followup-dispatch"

type DispatchBody = {
  dryRun?: boolean
  limit?: number
  phone?: string
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as DispatchBody

  if (!body.dryRun) {
    return res.status(409).json({
      error: "manual_dispatch_disabled",
      message: "Los envíos salen únicamente desde el webhook de WhatsApp.",
    })
  }

  const result = await runFollowupDispatch(req.scope, {
    dryRun: Boolean(body.dryRun),
    limit: body.limit,
    phone: body.phone,
  })

  res.json(result)
}
