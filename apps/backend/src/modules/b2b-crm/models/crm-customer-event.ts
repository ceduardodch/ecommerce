import { model } from "@medusajs/framework/utils"

const CrmCustomerEvent = model
  .define("CrmCustomerEvent", {
    id: model.id({ prefix: "crmce" }).primaryKey(),
    phone: model.text().searchable(),
    type: model.text().searchable(),
    at: model.dateTime(),
    quote_id: model.text().nullable(),
    order_id: model.text().nullable(),
    medusa_order_id: model.text().nullable(),
    source: model.text().nullable(),
    payload: model.json().nullable(),
  })
  .indexes([
    {
      name: "IDX_crm_customer_event_phone_at",
      on: ["phone", "at"],
      unique: false,
      where: "deleted_at IS NULL",
    },
    {
      name: "IDX_crm_customer_event_type",
      on: ["type"],
      unique: false,
      where: "deleted_at IS NULL",
    },
  ])

export default CrmCustomerEvent
