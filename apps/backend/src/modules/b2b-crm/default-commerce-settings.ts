/**
 * Configuración comercial de Eter Niu.
 *
 * Antes vivía en variables de entorno de Coolify: cambiar el cupón o el IVA
 * exigía redeploy, y la cuenta bancaria habría quedado en un repo público.
 * Ahora el dueño la edita en Admin → CRM WhatsApp → Configuración, y tanto
 * `ecommerce-tools` (Vicky) como el storefront la leen desde aquí.
 *
 * Las claves son estables porque las consumen otros servicios. Los valores de
 * esta lista son solo el arranque: lo guardado en `crm_setting` manda.
 */

export type CommerceSettingKind = "text" | "number" | "phone" | "url" | "boolean"

export type CommerceSettingSeed = {
  key: string
  label: string
  help: string
  group: "pago" | "marca" | "comercial"
  kind: CommerceSettingKind
  value: string
  /**
   * `true` = puede salir por el endpoint público que lee el storefront.
   * El número de cuenta es `false`: solo viaja al bot por el canal autenticado.
   */
  publico: boolean
}

export const DEFAULT_COMMERCE_SETTINGS: CommerceSettingSeed[] = [
  {
    key: "pago_transferencia_activa",
    label: "Cobrar por transferencia",
    help: "Si lo apagas, Vicky deja de ofrecer transferencia y solo cierra con tarjeta.",
    group: "pago",
    kind: "boolean",
    value: "true",
    publico: true,
  },
  {
    key: "pago_banco_nombre",
    label: "Banco",
    help: "Banco de la cuenta que recibe las transferencias.",
    group: "pago",
    kind: "text",
    value: "Banco Pichincha",
    publico: true,
  },
  {
    key: "pago_banco_titular",
    label: "Titular de la cuenta",
    help: "Debe coincidir con la razón social que ve el cliente en la web.",
    group: "pago",
    kind: "text",
    value: "Viky Johanna Saavedra Puebla — INFINITY IMPORTS",
    publico: true,
  },
  {
    key: "pago_banco_ruc",
    label: "RUC o cédula del titular",
    help: "Lo piden algunos bancos para completar la transferencia.",
    group: "pago",
    kind: "text",
    value: "1715523021001",
    publico: true,
  },
  {
    key: "pago_banco_tipo_cuenta",
    label: "Tipo de cuenta",
    help: "Ahorros o Corriente.",
    group: "pago",
    kind: "text",
    value: "Ahorros",
    publico: true,
  },
  {
    key: "pago_banco_numero",
    label: "Número de cuenta",
    help: "Solo se lo entrega Vicky al cliente por WhatsApp. Nunca se publica en la web.",
    group: "pago",
    kind: "text",
    value: "",
    publico: false,
  },
  {
    key: "pago_datafast_nombre_comercial",
    label: "Nombre comercial en Datafast",
    help: "Es el nombre que el cliente ve en el formulario de la tarjeta.",
    group: "pago",
    kind: "text",
    value: "ETERNIU",
    publico: false,
  },
  {
    key: "marca_instagram_url",
    label: "Instagram de la marca",
    help: "Vicky lo usa como prueba de confianza: ahí se publican los videos de despacho.",
    group: "marca",
    kind: "url",
    value: "https://instagram.com/eter.niu",
    publico: true,
  },
  {
    key: "marca_whatsapp_venta",
    label: "Número de venta (WhatsApp)",
    help: "Formato internacional sin +. Es el número al que llegan los CTA de la web y las campañas.",
    group: "marca",
    kind: "phone",
    value: "593987135207",
    publico: true,
  },
  {
    key: "comercial_iva",
    label: "IVA aplicado",
    help: "Fracción, no porcentaje: 0.15 = 15%. Entra en la cotización y en el desglose que exige Datafast.",
    group: "comercial",
    kind: "number",
    value: "0.15",
    publico: true,
  },
  {
    key: "comercial_cupon_cocina",
    label: "Cupón vigente — cocina",
    help: "Se muestra en las fichas de cocina y en los mensajes de WhatsApp.",
    group: "comercial",
    kind: "text",
    value: "GRANITOHOY",
    publico: true,
  },
  {
    key: "comercial_cupon_bienestar",
    label: "Cupón vigente — bienestar",
    help: "Se muestra en las fichas de bienestar y en los mensajes de WhatsApp.",
    group: "comercial",
    kind: "text",
    value: "BIENESTARHOY",
    publico: true,
  },
  {
    key: "comercial_meta_marca",
    label: "Marca del catálogo Meta",
    help: "Aparece como brand en el feed que consume Facebook/Instagram.",
    group: "comercial",
    kind: "text",
    value: "Eter Niu Cocina",
    publico: true,
  },
]

const BY_KEY = new Map(DEFAULT_COMMERCE_SETTINGS.map((item) => [item.key, item]))

export function commerceSettingSeed(key: string) {
  return BY_KEY.get(key)
}

export function isCommerceSettingKey(key: string) {
  return BY_KEY.has(key)
}

/**
 * Valida un valor contra el tipo declarado. Devuelve el valor normalizado o un
 * mensaje de error legible para el Admin.
 */
export function validateCommerceSetting(
  key: string,
  raw: string,
): { value: string } | { error: string } {
  const seed = BY_KEY.get(key)
  if (!seed) return { error: `Ajuste desconocido: ${key}` }

  const value = raw.trim()

  if (seed.kind === "boolean") {
    if (!["true", "false"].includes(value)) {
      return { error: `${seed.label}: usa true o false.` }
    }
    return { value }
  }

  if (seed.kind === "number") {
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
      return { error: `${seed.label}: usa una fracción entre 0 y 1 (0.15 = 15%).` }
    }
    return { value }
  }

  if (seed.kind === "phone") {
    const digits = value.replace(/\D/g, "")
    if (digits.length < 9 || digits.length > 15) {
      return { error: `${seed.label}: revisa el número, debe ir en formato internacional sin +.` }
    }
    return { value: digits }
  }

  if (seed.kind === "url") {
    if (value && !/^https?:\/\//i.test(value)) {
      return { error: `${seed.label}: debe empezar con http:// o https://.` }
    }
    return { value }
  }

  // El número de cuenta puede quedar vacío: significa "todavía no configurado"
  // y el bot escala a un humano en vez de dictar una cuenta inventada.
  return { value }
}
