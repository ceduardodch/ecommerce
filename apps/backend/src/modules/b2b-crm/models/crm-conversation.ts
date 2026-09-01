import { model } from "@medusajs/framework/utils"

const CrmConversation = model
  .define("CrmConversation", {
    id: model.id({ prefix: "crmcv" }).primaryKey(),
    phone: model.text().searchable(),
    channel: model.text().default("whatsapp"),
    status: model.text().default("new").searchable(),
    mode: model.text().default("ai").searchable(),
    assigned_user_id: model.text().searchable().nullable(),
    assigned_user_name: model.text().nullable(),
    unread_count: model.number().default(0),
    last_message_at: model.dateTime().nullable(),
    last_inbound_at: model.dateTime().nullable(),
    closed_at: model.dateTime().nullable(),
    metadata: model.json().nullable(),
  })
  .indexes([
    {
      name: "IDX_crm_conversation_phone_channel_unique",
      on: ["phone", "channel"],
      unique: true,
      where: "deleted_at IS NULL",
    },
    {
      name: "IDX_crm_conversation_queue",
      on: ["status", "last_message_at"],
      unique: false,
      where: "deleted_at IS NULL",
    },
  ])

export default CrmConversation
