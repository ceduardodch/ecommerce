import { model } from "@medusajs/framework/utils"

const CrmMessageTemplate = model
  .define("CrmMessageTemplate", {
    id: model.id({ prefix: "crmtpl" }).primaryKey(),
    key: model.text().searchable(),
    body: model.text(),
    active: model.boolean().default(true),
  })
  .indexes([
    {
      name: "IDX_crm_message_template_key_unique",
      on: ["key"],
      unique: true,
      where: "deleted_at IS NULL",
    },
  ])

export default CrmMessageTemplate
