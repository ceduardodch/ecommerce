import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/** Usuarios administradores disponibles para asignar una conversación. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "user",
    fields: ["id", "first_name", "last_name", "email"],
    pagination: { take: 200 },
  })
  res.json({
    users: (data || []).map((user: any) => ({
      id: user.id,
      name: [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email || user.id,
      email: user.email,
    })),
  })
}
