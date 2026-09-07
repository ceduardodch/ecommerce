import { recordRecoveryNotice } from "../recovery-notice"

describe("aviso interno de recuperación", () => {
  it("hace visible el caso sin cambiar el modo ni asignar otro vendedor", async () => {
    const store = {
      listCrmInternalNotes: jest.fn().mockResolvedValue([]),
      updateCrmConversations: jest.fn().mockResolvedValue({}),
      createCrmInternalNotes: jest.fn().mockResolvedValue({}),
    }
    await recordRecoveryNotice(store, { id: "c1", assigned_user_id: "seller", unread_count: 3 }, { messageId: "m1", reason: "reply_failed", text: "Consulta ficticia" })
    expect(store.updateCrmConversations).toHaveBeenCalledWith({ id: "c1", status: "assigned", unread_count: 3 })
    expect(store.createCrmInternalNotes).toHaveBeenCalledWith(expect.objectContaining({ body: expect.stringContaining("Revisa la conversación antes de reenviar") }))
  })

  it("reintentar un aviso no duplica la nota", async () => {
    const store = {
      listCrmInternalNotes: jest.fn().mockResolvedValue([{ body: "[whatsapp-recovery:m1]\nAviso" }]),
      updateCrmConversations: jest.fn(), createCrmInternalNotes: jest.fn(),
    }
    await recordRecoveryNotice(store, { id: "c1" }, { messageId: "m1" })
    expect(store.createCrmInternalNotes).not.toHaveBeenCalled()
    expect(store.updateCrmConversations).not.toHaveBeenCalled()
  })
})
