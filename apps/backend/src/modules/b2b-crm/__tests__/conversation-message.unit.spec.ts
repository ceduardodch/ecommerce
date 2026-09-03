import { conversationMessageFromEvent } from "../conversation-message"

describe("conversationMessageFromEvent", () => {
  it("registra un mensaje entrante del cliente", () => {
    expect(
      conversationMessageFromEvent("message_in", {
        text: "Hola",
        messageId: "wamid.in1",
      }),
    ).toEqual({
      direction: "in",
      senderType: "customer",
      text: "Hola",
      metaMessageId: "wamid.in1",
      status: undefined,
    })
  })

  it("registra un mensaje saliente conservando quién lo escribió", () => {
    expect(
      conversationMessageFromEvent("message_out", {
        text: "Claro que sí",
        senderType: "human",
        messageId: "wamid.out1",
      }),
    ).toMatchObject({
      direction: "out",
      senderType: "human",
      text: "Claro que sí",
      metaMessageId: "wamid.out1",
    })
  })

  // El caso que dejaba a las campañas sin telemetría: 20 envíos, 0 acuses,
  // porque el wamid nunca llegaba a la tabla de mensajes.
  it("registra una campaña enviada con su wamid, para que el acuse encuentre la fila", () => {
    expect(
      conversationMessageFromEvent("broadcast_sent", {
        suggestedMessage: "Hola Ana 👋 JUEGO NEGRO...",
        templateKey: "promo_coleccion_exotica",
        messageId: "wamid.bc1",
      }),
    ).toMatchObject({
      direction: "out",
      senderType: "system",
      text: "Hola Ana 👋 JUEGO NEGRO...",
      metaMessageId: "wamid.bc1",
    })
  })

  it("registra un followup enviado igual que una campaña", () => {
    expect(
      conversationMessageFromEvent("followup_sent", {
        suggestedMessage: "¿Cómo te fue con el wok?",
        messageId: "wamid.fu1",
      }),
    ).toMatchObject({
      direction: "out",
      senderType: "system",
      metaMessageId: "wamid.fu1",
    })
  })

  // Encolado significa que no se envió nada: no hay wamid ni mensaje que
  // mostrar, y crear la fila mentiría sobre lo que recibió el cliente.
  it("NO registra despachos encolados", () => {
    expect(conversationMessageFromEvent("broadcast_queued", {})).toBeUndefined()
    expect(conversationMessageFromEvent("followup_queued", {})).toBeUndefined()
  })

  it("NO registra eventos que no son mensajes", () => {
    for (const type of ["opt_out", "paid", "delivered", "message_status", "nps"]) {
      expect(conversationMessageFromEvent(type, {})).toBeUndefined()
    }
  })

  it("tolera un despacho sin wamid sin inventarse uno", () => {
    expect(
      conversationMessageFromEvent("broadcast_sent", { suggestedMessage: "hola" }),
    ).toMatchObject({ metaMessageId: undefined })
  })
})
