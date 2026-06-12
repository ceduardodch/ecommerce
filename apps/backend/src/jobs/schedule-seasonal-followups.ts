import type { MedusaContainer } from "@medusajs/framework/types"
import { B2B_CRM_MODULE } from "../modules/b2b-crm/index"
import type B2bCrmModuleService from "../modules/b2b-crm/service"

/**
 * Fechas de campañas estacionales en Ecuador
 * Formato: mes (1-12), día (1-31)
 */
type SeasonalCampaign = {
  name: string
  month: number
  day: number
  followupReason: string
  templateKey: string
  description: string
}

const SEASONAL_CAMPAIGNS: SeasonalCampaign[] = [
  {
    name: "navidad",
    month: 11, // Noviembre
    day: 15, // 15 de nov (anticipado para Black Friday + Navidad)
    followupReason: "estacional_navidad",
    templateKey: "estacional",
    description: "Campaña de Navidad/Black Friday",
  },
  {
    name: "dia_madre",
    month: 4, // Abril
    day: 24, // Fin de abril (aprox una semana antes del Día de la Madre, que es el segundo domingo de mayo en Ecuador)
    followupReason: "estacional_dia_madre",
    templateKey: "estacional",
    description: "Campaña Día de la Madre",
  },
]

/**
 * Calcula la próxima fecha de campaña estacional
 * @param now - Fecha actual (por defecto usa la fecha del sistema)
 * @returns La próxima campaña o null si ya pasaron todas este año
 */
export function getNextSeasonalCampaign(now: Date = new Date()): SeasonalCampaign | null {
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-12
  const currentDay = now.getDate()

  // Buscar la próxima campaña este año
  const nextThisYear = SEASONAL_CAMPAIGNS.find(
    (campaign) =>
      campaign.month > currentMonth ||
      (campaign.month === currentMonth && campaign.day >= currentDay)
  )

  if (nextThisYear) {
    return nextThisYear
  }

  // Si todas pasaron este año, retornar la primera del próximo año
  return SEASONAL_CAMPAIGNS[0] || null
}

/**
 * Calcula la fecha exacta de una campaña estacional
 * @param campaign - Campaña estacional
 * @param year - Año (por defecto el actual)
 * @returns Fecha de la campaña a las 9:00 AM America/Guayaquil (UTC-5)
 */
export function getCampaignDate(
  campaign: SeasonalCampaign,
  year: number = new Date().getFullYear()
): Date {
  // Crear fecha a las 9:00 AM local (que es 14:00 UTC en Ecuador, UTC-5 sin horario de verano)
  const date = new Date(Date.UTC(year, campaign.month - 1, campaign.day, 14, 0, 0))
  return date
}

/**
 * Verifica si es momento de programar followups estacionales
 * @param now - Fecha actual
 * @param campaign - Campaña a verificar
 * @param daysBefore - Días de anticipación (por defecto 7 días antes)
 * @returns true si estamos dentro de la ventana de programación
 */
export function shouldScheduleSeasonalFollowups(
  now: Date = new Date(),
  campaign: SeasonalCampaign | null = null,
  daysBefore: number = 7
): boolean {
  if (!campaign) {
    campaign = getNextSeasonalCampaign(now)
  }

  if (!campaign) {
    return false
  }

  const campaignDate = getCampaignDate(campaign, now.getFullYear())
  const windowStart = new Date(campaignDate)
  windowStart.setDate(windowStart.getDate() - daysBefore)

  return now >= windowStart && now <= campaignDate
}

/**
 * Lógica pura para decidir si un cliente debe recibir followup estacional
 * @param customer - Cliente con next_followup_at y followup_reason
 * @param campaignFollowupAt - Fecha del followup estacional a programar
 * @returns true si no hay followup más próximo
 */
export function shouldScheduleCustomerForSeasonal(
  customer: { next_followup_at?: Date | string | null; followup_reason?: string | null },
  campaignFollowupAt: Date
): boolean {
  if (!customer.next_followup_at) {
    return true // Sin followup programado, podemos programar
  }

  const nextFollowup = customer.next_followup_at instanceof Date
    ? customer.next_followup_at
    : new Date(customer.next_followup_at)
  const campaignDate = new Date(campaignFollowupAt)

  // Solo programar si el followup estacional es anterior o igual al próximo followup
  // Esto respeta los followups existentes más urgentes
  return campaignDate <= nextFollowup
}

/**
 * Calcula los días hasta la próxima campaña estacional
 * @param now - Fecha actual
 * @returns Número de días o null si no hay próxima campaña
 */
export function daysUntilNextCampaign(now: Date = new Date()): number | null {
  const campaign = getNextSeasonalCampaign(now)
  if (!campaign) {
    return null
  }

  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-12
  const currentDay = now.getDate()

  // Determinar el año de la campaña
  // Si la campaña es posterior a la fecha actual, usar el año actual
  // Si la campaña es anterior o igual (ya pasó este año), usar el siguiente año
  let campaignYear = currentYear
  if (
    campaign.month < currentMonth ||
    (campaign.month === currentMonth && campaign.day < currentDay)
  ) {
    campaignYear = currentYear + 1
  }

  const campaignDate = getCampaignDate(campaign, campaignYear)
  const diffMs = campaignDate.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  return diffDays
}

export default async function scheduleSeasonalFollowupsJob(
  container: MedusaContainer,
) {
  const logger = container.resolve("logger")
  const crm = container.resolve(B2B_CRM_MODULE) as B2bCrmModuleService

  try {
    const now = new Date()
    const campaign = getNextSeasonalCampaign(now)

    if (!campaign) {
      logger.info("[crm-seasonal] No hay campañas estacionales pendientes este año")
      return
    }

    if (!shouldScheduleSeasonalFollowups(now, campaign, 7)) {
      const daysUntil = daysUntilNextCampaign(now)
      logger.info(
        `[crm-seasonal] Fuera de ventana para ${campaign.name}. Próxima campaña en ${daysUntil} días`
      )
      return
    }

    const campaignDate = getCampaignDate(campaign, now.getFullYear())
    logger.info(
      `[crm-seasonal] Programando followups para ${campaign.description} (${campaignDate.toISOString()})`
    )

    // Buscar clientes con consentimiento que no tengan followup más próximo
    const customers = await crm.listAndCountCrmCustomerProfiles(
      { whatsapp_consent: true },
      { take: 10000 } // Límite razonable para un batch
    )

    let scheduled = 0
    let skipped = 0

    for (const customer of customers[0]) {
      if (shouldScheduleCustomerForSeasonal(customer, campaignDate)) {
        await crm.updateCrmCustomerProfiles({
          id: customer.id,
          next_followup_at: campaignDate,
          followup_reason: campaign.followupReason,
        })
        scheduled++
      } else {
        skipped++
      }
    }

    logger.info(
      `[crm-seasonal] ${campaign.name}: programados=${scheduled} omitidos=${skipped} total=${customers[0].length}`
    )
  } catch (cause) {
    logger.error(
      `[crm-seasonal] fallo el job de followups estacionales: ${
        cause instanceof Error ? cause.message : cause
      }`
    )
  }
}

export const config = {
  name: "schedule-seasonal-followups",
  // Ejecutar diariamente a las 10:00 AM Ecuador (15:00 UTC)
  schedule: process.env.CRM_SEASONAL_CRON || "0 15 * * *",
}
