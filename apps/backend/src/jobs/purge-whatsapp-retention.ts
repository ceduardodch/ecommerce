import type { MedusaContainer } from "@medusajs/framework/types"
import { rm, statfs } from "node:fs/promises"
import path from "node:path"
import { B2B_CRM_MODULE } from "../modules/b2b-crm"
import type B2bCrmModuleService from "../modules/b2b-crm/service"

const RETENTION_MONTHS = 24

function retentionCutoff(now = new Date()) {
  const cutoff = new Date(now)
  cutoff.setMonth(cutoff.getMonth() - RETENTION_MONTHS)
  return cutoff
}

export default async function purgeWhatsappRetentionJob(container: MedusaContainer) {
  const logger = container.resolve("logger")
  const crm = container.resolve(B2B_CRM_MODULE) as B2bCrmModuleService
  const result = await crm.purgeExpiredConversationMessages(retentionCutoff())
  const mediaDir = path.resolve(process.env.WHATSAPP_MEDIA_DIR || "/app/data/whatsapp-media")
  let removedFiles = 0
  for (const filename of result.mediaPaths) {
    const target = path.resolve(mediaDir, path.basename(filename))
    if (!target.startsWith(`${mediaDir}${path.sep}`)) continue
    await rm(target, { force: true }).then(() => { removedFiles += 1 }).catch((cause) => logger.error(`[crm-whatsapp] no se pudo borrar adjunto vencido: ${cause instanceof Error ? cause.message : cause}`))
  }
  try {
    const space = await statfs(mediaDir)
    const available = Number(space.bavail) * Number(space.bsize)
    const minimum = Number(process.env.CRM_WHATSAPP_MEDIA_MIN_FREE_BYTES || 2 * 1024 * 1024 * 1024)
    if (available < minimum) {
      logger.warn(`[crm-whatsapp] alerta de espacio: disponibles=${available} mínimo=${minimum}`)
    }
  } catch (cause) {
    logger.warn(`[crm-whatsapp] no se pudo comprobar espacio del volumen: ${cause instanceof Error ? cause.message : cause}`)
  }
  logger.info(`[crm-whatsapp] retención: mensajes=${result.deleted} adjuntos=${removedFiles}`)
}

export const config = {
  name: "purge-whatsapp-retention",
  // 05:20 UTC = 00:20 America/Guayaquil.
  schedule: process.env.CRM_WHATSAPP_RETENTION_CRON || "20 5 * * *",
}

export { retentionCutoff }
