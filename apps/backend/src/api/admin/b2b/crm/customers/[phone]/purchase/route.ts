import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { crmService, serializeCustomer } from "../../../../_shared"

type PurchaseBody = {
  products?: Array<{
    productId?: string
    sku?: string
    title: string
    quantity?: number
    reorderAfterDays?: number
  }>
  notes?: string
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { phone } = req.params as { phone: string }
  const body = req.body as PurchaseBody
  const products = (body.products || []).filter((product) => product.title)

  if (!products.length) {
    return res.status(400).json({ error: "sin_productos" })
  }

  const decodedPhone = decodeURIComponent(phone)
  const service = crmService(req)

  await service.recordManualPurchase({
    phone: decodedPhone,
    products: products.map((product) => ({
      productId: product.productId || "manual",
      sku: product.sku || "MANUAL",
      title: product.title,
      quantity: product.quantity || 1,
      reorderAfterDays: product.reorderAfterDays,
    })),
    payload: body.notes ? { notes: body.notes } : undefined,
  })

  const customer = await service.getCustomer(decodedPhone)
  res.json({ customer: serializeCustomer(customer) })
}
