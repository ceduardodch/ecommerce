import {
  defineMiddlewares,
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from "@medusajs/framework/http"

function redirectRootToAdmin(
  _req: MedusaRequest,
  res: MedusaResponse,
  _next: MedusaNextFunction
) {
  res.redirect(302, "/app")
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/",
      middlewares: [redirectRootToAdmin],
    },
  ],
})
