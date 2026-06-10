import type { MedusaContainer } from "@medusajs/framework/types"
import { runFollowupDispatch } from "../modules/b2b-crm/followup-dispatch"

export default async function dispatchDueFollowupsJob(
  container: MedusaContainer,
) {
  const logger = container.resolve("logger")

  try {
    const result = await runFollowupDispatch(container, {
      enforceWindow: true,
    })
    logger.info(
      `[crm-followups] modo=${result.mode} vencidos=${result.due} enviados=${result.sent} en_cola=${result.queued} omitidos=${result.skipped}`,
    )
  } catch (cause) {
    logger.error(
      `[crm-followups] fallo el job de recompra: ${
        cause instanceof Error ? cause.message : cause
      }`,
    )
  }
}

export const config = {
  name: "dispatch-due-followups",
  // 14:00 UTC = 9:00 America/Guayaquil (UTC-5, sin horario de verano)
  schedule: process.env.CRM_FOLLOWUP_CRON || "0 14 * * *",
}
