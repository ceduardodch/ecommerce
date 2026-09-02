import type { AppConfig } from "./config.js"

/**
 * Formas de pago de Eter Niu — fuente de verdad para Vicky y para la web.
 *
 * Son DOS y solo dos: transferencia/depósito bancario y tarjeta por Datafast.
 * No hay pago contra entrega: el pedido se despacha después de confirmar el
 * pago (previo pago).
 *
 * Los datos de la cuenta bancaria viven en variables de entorno, nunca en el
 * repo (es público). Si faltan, `transferencia.configured` es `false` y el bot
 * debe escalar a un humano en vez de dictar una cuenta inventada.
 */

export type PaymentMethodId = "transferencia" | "tarjeta"

export type PaymentMethod = {
  id: PaymentMethodId
  label: string
  available: boolean
  configured: boolean
  /** Guion listo para pegar en WhatsApp. Una línea por mensaje. */
  script: string[]
  /** Datos estructurados de la cuenta (solo para `transferencia`). */
  bankAccount?: {
    bank: string
    accountHolder: string
    taxId: string
    accountType: string
    accountNumber: string
  }
  notes?: string[]
}

export type PaymentMethodsInfo = {
  policy: {
    mode: "prepago"
    summary: string
    steps: string[]
  }
  methods: PaymentMethod[]
  trust: {
    instagramUrl: string
    script: string[]
  }
  links: {
    paymentsPageCocina: string
    paymentsPageBienestar: string
    cardCheckout: string
  }
  guardrails: string[]
}

const PREPAY_SUMMARY =
  "Tenemos dos formas de pago: transferencia o depósito bancario, y tarjeta de crédito/débito con Datafast. Trabajamos con previo pago: confirmamos el pago y despachamos."

const PREPAY_STEPS = [
  "1. Confirmamos contigo producto, precio y dirección de entrega.",
  "2. Pagas por transferencia o con tarjeta (Datafast).",
  "3. Verificamos el pago (transferencia: revisamos el comprobante; tarjeta: la confirmación llega automática).",
  "4. Despachamos por Servientrega, con envío gratis a todo el Ecuador.",
  "5. Te enviamos la guía de seguimiento por WhatsApp para que rastrees tu paquete.",
]

export function paymentMethodsInfo(config: AppConfig): PaymentMethodsInfo {
  const cocina = config.kitchenPublicUrl.replace(/\/$/, "")
  const bienestar = config.wellnessPublicUrl.replace(/\/$/, "")

  const bankConfigured = Boolean(
    config.bankAccountHolder &&
      config.bankAccountNumber &&
      config.bankAccountTaxId,
  )

  const transferencia: PaymentMethod = {
    id: "transferencia",
    label: "Transferencia o depósito bancario",
    available: config.bankTransferEnabled,
    configured: bankConfigured,
    script: bankConfigured
      ? [
          `Te paso los datos para la transferencia o depósito:`,
          `${config.bankName} · Cuenta de ${config.bankAccountType.toLowerCase()}`,
          `N.º ${config.bankAccountNumber}`,
          `A nombre de: ${config.bankAccountHolder}`,
          `RUC/C.I.: ${config.bankAccountTaxId}`,
          `Cuando hagas la transferencia me envías la captura por aquí, confirmo el pago y despacho tu pedido.`,
        ]
      : [
          "Los datos bancarios no están configurados en el sistema. No inventes una cuenta: escala a un humano para que entregue los datos correctos.",
        ],
    bankAccount: bankConfigured
      ? {
          bank: config.bankName,
          accountHolder: config.bankAccountHolder as string,
          taxId: config.bankAccountTaxId as string,
          accountType: config.bankAccountType,
          accountNumber: config.bankAccountNumber as string,
        }
      : undefined,
    notes: [
      "Pide siempre la captura del comprobante y regístrala con `payment_proof_received`.",
      "El pago no está confirmado hasta que un humano lo verifica: no marques la orden como pagada ni dispares Purchase.",
    ],
  }

  const tarjeta: PaymentMethod = {
    id: "tarjeta",
    label: "Tarjeta de crédito o débito (Datafast)",
    available: true,
    configured: true,
    script: [
      "También puedes pagar con tarjeta de crédito o débito.",
      "Te envío el enlace de tu carrito y pagas en la página; el cobro lo procesa Datafast.",
      "Los datos de tu tarjeta se ingresan directo en el entorno seguro de Datafast: nosotros nunca los vemos ni los guardamos.",
    ],
    notes: [
      "Arma el carrito con `create_whatsapp_cart` y envía ese enlace; el cliente termina en /checkout/pago.",
      "Nunca pidas número de tarjeta, código de seguridad ni claves por WhatsApp.",
      `Modo actual de Datafast: ${config.datafastDryRun ? "dry-run (sin cobro real)" : config.datafastEnv}.`,
    ],
  }

  return {
    policy: {
      mode: "prepago",
      summary: PREPAY_SUMMARY,
      steps: PREPAY_STEPS,
    },
    methods: [transferencia, tarjeta],
    trust: {
      instagramUrl: config.brandInstagramUrl,
      script: [
        `Somos una tienda real: en nuestras redes (${config.brandInstagramUrl}) publicamos los videos de los despachos del día, para que veas cómo salen los pedidos.`,
        "Apenas despachamos te envío la guía de Servientrega por WhatsApp y con ese número rastreas tu paquete hasta tu puerta.",
        "En la página web tienes las reseñas y testimonios de clientes que ya compraron.",
        "Si algo llega dañado o equivocado, te lo cambiamos o te devolvemos tu dinero.",
      ],
    },
    links: {
      paymentsPageCocina: `${cocina}/pagos`,
      paymentsPageBienestar: `${bienestar}/pagos`,
      cardCheckout: `${cocina}/checkout/pago`,
    },
    guardrails: [
      "Solo existen dos formas de pago: transferencia y tarjeta con Datafast. No ofrezcas contra entrega, deuna! ni PayPhone.",
      "Nunca prometas 'pagas al recibir': el despacho va después del pago confirmado.",
      "Nunca pidas ni recibas datos de tarjeta, claves, tokens ni fotos de documentos por WhatsApp.",
      "Si el cliente dice que ya pagó y no hay comprobante ni confirmación, deja la orden en revisión y escala a un humano.",
    ],
  }
}
