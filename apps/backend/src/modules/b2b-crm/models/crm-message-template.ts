import { model } from "@medusajs/framework/utils"

const CrmMessageTemplate = model
  .define("CrmMessageTemplate", {
    id: model.id({ prefix: "crmtpl" }).primaryKey(),
    key: model.text().searchable(),
    /** Nombre legible para el admin (ej. "Recompra 90 días"). */
    label: model.text().nullable(),
    body: model.text(),
    /** URL pública del adjunto opcional (video / imagen). */
    media_url: model.text().nullable(),
    /** Tipo del adjunto: video | image | document. */
    media_type: model.text().nullable(),
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
