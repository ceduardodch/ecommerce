import { model } from "@medusajs/framework/utils"

const CrmConversationMessage = model
  .define("CrmConversationMessage", {
    id: model.id({ prefix: "crmcm" }).primaryKey(),
    conversation_id: model.text().searchable(),
    meta_message_id: model.text().searchable().nullable(),
    direction: model.text().searchable(),
    sender_type: model.text().default("customer"),
    sender_user_id: model.text().nullable(),
    text: model.text().nullable(),
    media_type: model.text().nullable(),
    media_path: model.text().nullable(),
    media_name: model.text().nullable(),
    media_mime_type: model.text().nullable(),
    media_size: model.number().nullable(),
    status: model.text().default("received").searchable(),
    failed_reason: model.text().nullable(),
    meta_timestamp: model.dateTime().nullable(),
    payload: model.json().nullable(),
  })
  .indexes([
    {
      name: "IDX_crm_conversation_message_meta_unique",
      on: ["meta_message_id"],
      unique: true,
      where: "meta_message_id IS NOT NULL AND deleted_at IS NULL",
    },
    {
      name: "IDX_crm_conversation_message_timeline",
      on: ["conversation_id", "meta_timestamp"],
      unique: false,
      where: "deleted_at IS NULL",
    },
  ])

export default CrmConversationMessage
