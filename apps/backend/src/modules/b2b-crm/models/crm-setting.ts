import { model } from "@medusajs/framework/utils"

/**
 * Configuración comercial editable desde el Admin.
 *
 * Vive aquí y no en variables de entorno porque son decisiones de negocio del
 * dueño (cuenta bancaria, cupón, IVA, número de venta), no infraestructura:
 * cambiarlas no debería exigir un redeploy, y la cuenta bancaria no puede
 * quedar escrita en un repo público.
 *
 * Las claves son estables porque `ecommerce-tools` y el storefront las
 * consumen. Los valores por defecto viven en `default-commerce-settings.ts`.
 */
const CrmSetting = model
  .define("CrmSetting", {
    id: model.id({ prefix: "crmset" }).primaryKey(),
    key: model.text().searchable(),
    value: model.text(),
  })
  .indexes([
    {
      name: "IDX_crm_setting_key_unique",
      on: ["key"],
      unique: true,
      where: "deleted_at IS NULL",
    },
  ])

export default CrmSetting
