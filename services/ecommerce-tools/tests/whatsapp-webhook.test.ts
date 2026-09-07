/**
 * Tests unitarios del parser del webhook de Meta WhatsApp Cloud API (W2).
 * Lógica pura: sin red ni I/O.
 */

import { describe, expect, it } from "vitest"
import { createHmac } from "node:crypto"
import {
  validateHubSignature,
  extractInboundMessages,
  extractInboundMediaMessages,
  extractMessageStatuses,
  isOptOutText,
  isOptOutRequest,
  parseNpsScore,
  npsDecision,
  type MetaWebhookBody,
} from "../src/whatsapp-webhook.js"

// ---------------------------------------------------------------------------
// validateHubSignature
// ---------------------------------------------------------------------------

describe("validateHubSignature", () => {
  const secret = "test_app_secret_123"

  function makeSignature(body: string | Buffer) {
    const buf = typeof body === "string" ? Buffer.from(body) : body
    const hex = createHmac("sha256", secret).update(buf).digest("hex")
    return `sha256=${hex}`
  }

  it("valida firma correcta (string body)", () => {
    const body = JSON.stringify({ object: "whatsapp_business_account" })
    expect(validateHubSignature(body, makeSignature(body), secret)).toBe(true)
  })

  it("valida firma correcta (Buffer body)", () => {
    const body = Buffer.from(JSON.stringify({ object: "whatsapp_business_account" }))
    expect(validateHubSignature(body, makeSignature(body), secret)).toBe(true)
  })

  it("rechaza firma incorrecta", () => {
    const body = JSON.stringify({ object: "whatsapp_business_account" })
    expect(validateHubSignature(body, "sha256=deadbeef", secret)).toBe(false)
  })

  it("rechaza si no hay header de firma", () => {
    const body = JSON.stringify({ object: "test" })
    expect(validateHubSignature(body, undefined, secret)).toBe(false)
  })

  it("rechaza header con longitud diferente", () => {
    const body = JSON.stringify({ object: "test" })
    expect(validateHubSignature(body, "sha256=abc", secret)).toBe(false)
  })

  it("rechaza body manipulado", () => {
    const original = JSON.stringify({ object: "test" })
    const tampered = JSON.stringify({ object: "hacked" })
    const sig = makeSignature(original)
    expect(validateHubSignature(tampered, sig, secret)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// extractInboundMessages
// ---------------------------------------------------------------------------

const sampleBody: MetaWebhookBody = {
  object: "whatsapp_business_account",
  entry: [
    {
      id: "WABA_ID",
      changes: [
        {
          field: "messages",
          value: {
            messaging_product: "whatsapp",
            metadata: {
              phone_number_id: "PHONE_NUMBER_ID",
              display_phone_number: "+5930000000001",
            },
            contacts: [{ profile: { name: "Maria Cliente" }, wa_id: "593979854915" }],
            messages: [
              {
                id: "wamid.test001",
                from: "593979854915",
                timestamp: "1749600000",
                type: "text",
                text: { body: "Hola, me interesa la olla de granito" },
              },
            ],
          },
        },
      ],
    },
  ],
}

describe("extractInboundMessages", () => {
  it("extrae un mensaje de texto simple", () => {
    const msgs = extractInboundMessages(sampleBody)
    expect(msgs).toHaveLength(1)
    expect(msgs[0]).toEqual({
      waId: "593979854915",
      text: "Hola, me interesa la olla de granito",
      timestamp: 1749600000,
      messageId: "wamid.test001",
    })
  })

  it("ignora mensajes que no son de tipo text", () => {
    const body: MetaWebhookBody = {
      entry: [
        {
          id: "E1",
          changes: [
            {
              field: "messages",
              value: {
                messages: [
                  { id: "m1", from: "593979854915", timestamp: "1749600001", type: "image" },
                  { id: "m2", from: "593979854915", timestamp: "1749600002", type: "audio" },
                  { id: "m3", from: "593979854915", timestamp: "1749600003", type: "text", text: { body: "texto" } },
                ],
              },
            },
          ],
        },
      ],
    }
    const msgs = extractInboundMessages(body)
    expect(msgs).toHaveLength(1)
    expect(msgs[0].messageId).toBe("m3")
  })

  it("extrae mensajes de múltiples entries y changes", () => {
    const body: MetaWebhookBody = {
      entry: [
        {
          id: "E1",
          changes: [
            {
              field: "messages",
              value: {
                messages: [
                  { id: "m1", from: "5931", timestamp: "111", type: "text", text: { body: "hola" } },
                ],
              },
            },
            {
              field: "messages",
              value: {
                messages: [
                  { id: "m2", from: "5932", timestamp: "222", type: "text", text: { body: "oye" } },
                ],
              },
            },
          ],
        },
        {
          id: "E2",
          changes: [
            {
              field: "messages",
              value: {
                messages: [
                  { id: "m3", from: "5933", timestamp: "333", type: "text", text: { body: "hey" } },
                ],
              },
            },
          ],
        },
      ],
    }
    const msgs = extractInboundMessages(body)
    expect(msgs).toHaveLength(3)
    expect(msgs.map((m) => m.waId)).toEqual(["5931", "5932", "5933"])
  })

  it("devuelve array vacío para body sin entry", () => {
    expect(extractInboundMessages({})).toEqual([])
    expect(extractInboundMessages({ object: "whatsapp_business_account" })).toEqual([])
  })

  it("ignora status deliveries (sin messages)", () => {
    const body: MetaWebhookBody = {
      entry: [
        {
          id: "E1",
          changes: [
            {
              field: "messages",
              value: {
                statuses: [{ id: "s1", status: "delivered" }],
              },
            },
          ],
        },
      ],
    }
    expect(extractInboundMessages(body)).toEqual([])
  })
})

describe("archivos y estados de Meta", () => {
  it("extrae imagen, PDF, audio y video con su ID único", () => {
    const body: MetaWebhookBody = {
      entry: [{ id: "E1", changes: [{ field: "messages", value: { messages: [
        { id: "i1", from: "5931", timestamp: "1", type: "image", image: { id: "media-image", caption: "foto" } },
        { id: "d1", from: "5931", timestamp: "2", type: "document", document: { id: "media-pdf", filename: "catalogo.pdf" } },
        { id: "a1", from: "5931", timestamp: "3", type: "audio", audio: { id: "media-audio" } },
        { id: "v1", from: "5931", timestamp: "4", type: "video", video: { id: "media-video" } },
      ] } }] }],
    }
    expect(extractInboundMediaMessages(body).map((message) => [message.messageId, message.mediaType, message.media.id])).toEqual([
      ["i1", "image", "media-image"], ["d1", "document", "media-pdf"], ["a1", "audio", "media-audio"], ["v1", "video", "media-video"],
    ])
  })

  it("extrae estados de mensajes sin confundirlos con mensajes entrantes", () => {
    const body: MetaWebhookBody = { entry: [{ id: "E1", changes: [{ field: "messages", value: { statuses: [
      { id: "wamid.out", status: "delivered", timestamp: "100" }, { id: "wamid.read", status: "read", timestamp: "101" },
    ] } }] }] }
    expect(extractMessageStatuses(body).map((status) => status.status)).toEqual(["delivered", "read"])
    expect(extractInboundMessages(body)).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// isOptOutText
// ---------------------------------------------------------------------------

describe("isOptOutText", () => {
  it("detecta 'BAJA' exacto (mayúsculas)", () => {
    expect(isOptOutText("BAJA")).toBe(true)
  })

  it("detecta 'baja' minúsculas", () => {
    expect(isOptOutText("baja")).toBe(true)
  })

  it("detecta 'Baja' mixto", () => {
    expect(isOptOutText("Baja")).toBe(true)
  })

  it("detecta 'BAJA ' con espacios al inicio/fin", () => {
    expect(isOptOutText("  BAJA  ")).toBe(true)
  })

  it("detecta 'BAJA por favor' (inicia con BAJA + espacio)", () => {
    expect(isOptOutText("BAJA por favor")).toBe(true)
  })

  it("NO detecta mensajes que solo contienen BAJA en medio", () => {
    expect(isOptOutText("quiero BAJA de lista")).toBe(false)
  })

  it("NO detecta mensajes normales", () => {
    expect(isOptOutText("Hola, me interesa la olla")).toBe(false)
    expect(isOptOutText("BAJO precio")).toBe(false)
    expect(isOptOutText("BAJADO el precio")).toBe(false)
  })

  // La plantilla promocional anuncia SALIR, no BAJA. Antes se ignoraba, así que
  // quien seguía la instrucción del propio mensaje seguía recibiendo campañas.
  it("detecta 'SALIR', la palabra que anuncian las plantillas", () => {
    expect(isOptOutText("SALIR")).toBe(true)
    expect(isOptOutText("salir")).toBe(true)
    expect(isOptOutText("  Salir  ")).toBe(true)
    expect(isOptOutText("SALIR por favor")).toBe(true)
  })

  it("detecta 'STOP', convención común de otros remitentes", () => {
    expect(isOptOutText("STOP")).toBe(true)
    expect(isOptOutText("stop")).toBe(true)
  })

  it("tolera signos y acentos alrededor de la palabra", () => {
    expect(isOptOutText("¡SALIR!")).toBe(true)
    expect(isOptOutText("salir.")).toBe(true)
    expect(isOptOutText("BAJA,")).toBe(true)
  })

  it("NO confunde palabras que empiezan igual", () => {
    expect(isOptOutText("salirme del grupo no")).toBe(false)
    expect(isOptOutText("SALIRSE")).toBe(false)
    expect(isOptOutText("stopper")).toBe(false)
  })

  // Un desinterés no es una baja: la clienta puede seguir interesada en otra
  // línea. Se atiende en la conversación, no dándola de baja en silencio.
  it("NO trata un desinterés suelto como opt-out", () => {
    expect(isOptOutText("No estoy interesada eso producto")).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// isOptOutRequest — bajas pedidas en lenguaje natural
// ---------------------------------------------------------------------------

describe("isOptOutRequest", () => {
  it("sigue reconociendo las palabras clave", () => {
    expect(isOptOutRequest("SALIR")).toBe(true)
    expect(isOptOutRequest("baja")).toBe(true)
    expect(isOptOutRequest("STOP")).toBe(true)
  })

  // El mensaje exacto que una clienta envió el 2026-09-03: Vicky respondió que
  // tramitaba la eliminación y no se registró nada.
  it("reconoce el caso real que se perdió en producción", () => {
    expect(isOptOutRequest("Eliminar mi contacto de sus listas")).toBe(true)
  })

  it("reconoce otras formas de pedir la baja", () => {
    expect(isOptOutRequest("Borren mis datos por favor")).toBe(true)
    expect(isOptOutRequest("quitenme de la lista")).toBe(true)
    expect(isOptOutRequest("sacame de sus listas")).toBe(true)
    expect(isOptOutRequest("No me escriban más")).toBe(true)
    expect(isOptOutRequest("no me contacten")).toBe(true)
    expect(isOptOutRequest("no quiero recibir promociones")).toBe(true)
    expect(isOptOutRequest("quiero darme de baja")).toBe(true)
  })

  // Un falso positivo da de baja a quien quería comprar: cuesta una venta y es
  // silencioso. Estos son los casos que más se parecen a una baja sin serlo.
  it("NO confunde frases de venta con una baja", () => {
    expect(isOptOutRequest("quiero eliminar un producto de mi pedido")).toBe(false)
    expect(isOptOutRequest("no quiero recibir el azul, prefiero el negro")).toBe(false)
    expect(isOptOutRequest("me puedes quitar el wok del combo?")).toBe(false)
    expect(isOptOutRequest("No estoy interesada eso producto")).toBe(false)
    expect(isOptOutRequest("borra ese item de la cotizacion")).toBe(false)
    expect(isOptOutRequest("no me llego el pedido")).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// parseNpsScore
// ---------------------------------------------------------------------------

describe("parseNpsScore", () => {
  it("retorna número para '1' (límite inferior)", () => {
    expect(parseNpsScore("1")).toBe(1)
  })

  it("retorna número para '10' (límite superior)", () => {
    expect(parseNpsScore("10")).toBe(10)
  })

  it("retorna número para '9'", () => {
    expect(parseNpsScore("9")).toBe(9)
  })

  it("retorna número con espacios alrededor '  7  '", () => {
    expect(parseNpsScore("  7  ")).toBe(7)
  })

  it("retorna null para '0' (fuera de rango)", () => {
    expect(parseNpsScore("0")).toBeNull()
  })

  it("retorna null para '11' (fuera de rango)", () => {
    expect(parseNpsScore("11")).toBeNull()
  })

  it("retorna null para texto no numérico", () => {
    expect(parseNpsScore("ocho")).toBeNull()
    expect(parseNpsScore("Hola, me interesa la olla")).toBeNull()
  })

  it("retorna null para texto con número más palabras", () => {
    expect(parseNpsScore("9 puntos")).toBeNull()
    expect(parseNpsScore("8 estrellas")).toBeNull()
  })

  it("retorna null para string vacío", () => {
    expect(parseNpsScore("")).toBeNull()
  })

  it("retorna null para número decimal", () => {
    expect(parseNpsScore("7.5")).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// npsDecision
// ---------------------------------------------------------------------------

describe("npsDecision", () => {
  it("score >= 9 con contexto NPS → registra score Y agenda referido", () => {
    expect(npsDecision(9, "nps_postentrega")).toEqual({
      recordNpsScore: true,
      scheduleReferido: true,
    })
    expect(npsDecision(10, "nps_postentrega")).toEqual({
      recordNpsScore: true,
      scheduleReferido: true,
    })
  })

  it("score < 9 con contexto NPS → registra score pero NO agenda referido", () => {
    expect(npsDecision(8, "nps_postentrega")).toEqual({
      recordNpsScore: true,
      scheduleReferido: false,
    })
    expect(npsDecision(1, "nps_postentrega")).toEqual({
      recordNpsScore: true,
      scheduleReferido: false,
    })
  })

  it("score >= 9 SIN contexto NPS → no registra nada", () => {
    expect(npsDecision(10, "recompra")).toEqual({
      recordNpsScore: false,
      scheduleReferido: false,
    })
    expect(npsDecision(9, null)).toEqual({
      recordNpsScore: false,
      scheduleReferido: false,
    })
    expect(npsDecision(9, undefined)).toEqual({
      recordNpsScore: false,
      scheduleReferido: false,
    })
  })

  it("score >= 9 con followup_reason que empieza con 'nps' (variante) → agenda referido", () => {
    expect(npsDecision(9, "nps_otro")).toEqual({
      recordNpsScore: true,
      scheduleReferido: true,
    })
  })

  it("score con followup_reason 'NPS_postentrega' (mayúsculas) → case-insensitive", () => {
    expect(npsDecision(9, "NPS_postentrega")).toEqual({
      recordNpsScore: true,
      scheduleReferido: true,
    })
  })
})
