import { Module } from "@medusajs/framework/utils"
import B2bCrmModuleService from "./service"

export const B2B_CRM_MODULE = "b2bCrm"

export default Module(B2B_CRM_MODULE, {
  service: B2bCrmModuleService,
})
