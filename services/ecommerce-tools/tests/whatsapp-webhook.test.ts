/**
 * Tests unitarios del parser del webhook de Meta WhatsApp Cloud API (W2).
 * Lógica pura: sin red ni I/O.
 */

import { describe, expect, it } from "vitest"
import { createHmac } from "node:crypto"
import {
  validateHubSignature,
  extractInboundMessages,
  isOptOutText,
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
})
