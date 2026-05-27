import { model } from "@medusajs/framework/utils"

const ConversationalOrder = model
  .define("ConversationalOrder", {
    id: model.id({ prefix: "b2bord" }).primaryKey(),
    external_id: model.text().searchable(),
    quote_id: model.text().nullable(),
    phone: model.text().searchable().nullable(),
    status: model.text().searchable(),
    medusa_order_id: model.text().nullable(),
    medusa_draft_order_id: model.text().nullable(),
    payment_link: model.text().nullable(),
    client_transaction_id: model.text().nullable(),
    total_amount: model.number().nullable(),
    currency_code: model.text().default("usd"),
    quote: model.json().nullable(),
    customer: model.json().nullable(),
    events: model.json().nullable(),
    metadata: model.json().nullable(),
  })
  .indexes([
    {
      name: "IDX_conversational_order_external_unique",
      on: ["external_id"],
      unique: true,
      where: "deleted_at IS NULL",
    },
    {
      name: "IDX_conversational_order_client_tx",
      on: ["client_transaction_id"],
      unique: false,
      where: "deleted_at IS NULL",
    },
    {
      name: "IDX_conversational_order_status",
      on: ["status"],
      unique: false,
      where: "deleted_at IS NULL",
    },
  ])

export default ConversationalOrder
