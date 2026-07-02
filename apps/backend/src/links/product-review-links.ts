import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import { B2B_CRM_MODULE } from "../modules/b2b-crm"

export default defineLink(
  ProductModule.linkable.product,
  B2B_CRM_MODULE.linkable.ProductReview
)
