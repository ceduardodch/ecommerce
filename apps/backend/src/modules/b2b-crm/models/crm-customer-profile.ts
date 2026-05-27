import { model } from "@medusajs/framework/utils"

const CrmCustomerProfile = model
  .define("CrmCustomerProfile", {
    id: model.id({ prefix: "crmcp" }).primaryKey(),
    phone: model.text().searchable(),
    name: model.text().searchable().nullable(),
    email: model.text().searchable().nullable(),
    medusa_customer_id: model.text().nullable(),
    whatsapp_consent: model.boolean().default(false),
    tags: model.array().default([]),
    last_purchase_at: model.dateTime().nullable(),
    purchased_products: model.json().nullable(),
    suggested_frequency_days: model.number().nullable(),
    next_followup_at: model.dateTime().nullable(),
    followup_reason: model.text().nullable(),
    metadata: model.json().nullable(),
  })
  .indexes([
    {
      name: "IDX_crm_customer_profile_phone_unique",
      on: ["phone"],
      unique: true,
      where: "deleted_at IS NULL",
    },
    {
      name: "IDX_crm_customer_profile_next_followup",
      on: ["next_followup_at"],
      unique: false,
      where: "deleted_at IS NULL",
    },
  ])

export default CrmCustomerProfile
