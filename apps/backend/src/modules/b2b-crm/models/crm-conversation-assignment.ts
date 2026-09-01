import { model } from "@medusajs/framework/utils"

const CrmConversationAssignment = model
  .define("CrmConversationAssignment", {
    id: model.id({ prefix: "crmcva" }).primaryKey(),
    conversation_id: model.text().searchable(),
    assigned_user_id: model.text().searchable().nullable(),
    assigned_user_name: model.text().nullable(),
    action: model.text().searchable(),
    actor_user_id: model.text().nullable(),
    actor_user_name: model.text().nullable(),
    at: model.dateTime(),
  })
  .indexes([
    {
      name: "IDX_crm_conversation_assignment_timeline",
      on: ["conversation_id", "at"],
      unique: false,
      where: "deleted_at IS NULL",
    },
  ])

export default CrmConversationAssignment
