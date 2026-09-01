import { model } from "@medusajs/framework/utils"

const CrmInternalNote = model
  .define("CrmInternalNote", {
    id: model.id({ prefix: "crmcn" }).primaryKey(),
    conversation_id: model.text().searchable(),
    body: model.text(),
    author_user_id: model.text().nullable(),
    author_user_name: model.text().nullable(),
    at: model.dateTime(),
  })
  .indexes([
    {
      name: "IDX_crm_internal_note_timeline",
      on: ["conversation_id", "at"],
      unique: false,
      where: "deleted_at IS NULL",
    },
  ])

export default CrmInternalNote
