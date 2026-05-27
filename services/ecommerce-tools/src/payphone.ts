import type { AppConfig } from "./config.js"
import type { OrderRecord } from "./types.js"

export function buildClientTransactionId(orderId: string) {
  return orderId.replace(/[^A-Za-z0-9]/g, "").slice(-15)
}

export async function createPayPhoneLink(config: AppConfig, order: OrderRecord) {
  const clientTransactionId = buildClientTransactionId(order.id)
  const amountInCents = Math.round(order.quote.total.amount * 100)
  const payload = {
    amount: amountInCents,
    amountWithTax: amountInCents,
    amountWithoutTax: 0,
    tax: 0,
    service: 0,
    tip: 0,
    currency: "USD",
    reference: order.id,
    clientTransactionId,
    storeId: config.payphoneStoreId,
    oneTime: true,
  }

  if (config.payphoneDryRun || !config.payphoneToken) {
    return {
      url: `${config.storePublicUrl.replace(
        /\/$/,
        ""
      )}/payphone/sandbox/${clientTransactionId}`,
      clientTransactionId,
      provider: "payphone-dry-run",
      payload,
    }
  }

  const response = await fetch(config.payphoneApiLinkUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.payphoneToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const text = await response.text()
  if (!response.ok) {
    throw new Error(`PayPhone link failed: ${response.status} ${text}`)
  }

  return {
    url: text.replace(/^"|"$/g, ""),
    clientTransactionId,
    provider: "payphone",
    payload,
  }
}
