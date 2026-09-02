# Configuración comercial

Regla: **una variable de entorno es infraestructura o un secreto. Todo lo que el
dueño puede querer cambiar un martes es configuración y vive en el Admin.**

Cambiar el cupón, el IVA o la cuenta bancaria no debe exigir un redeploy, y la
cuenta bancaria no puede quedar escrita en este repo, que es público.

## Dónde se edita

Admin → **CRM WhatsApp → Configuración** (`/app/crm-whatsapp/config`).

Se guarda en la tabla `crm_setting` del módulo `b2b-crm`. Los valores base viven
en `apps/backend/src/modules/b2b-crm/default-commerce-settings.ts`: si el dueño
nunca tocó un ajuste, se usa ese valor.

## Qué hay ahí

| Ajuste | Clave | Público |
| --- | --- | --- |
| Cobrar por transferencia | `pago_transferencia_activa` | sí |
| Banco | `pago_banco_nombre` | sí |
| Titular de la cuenta | `pago_banco_titular` | sí |
| RUC o cédula del titular | `pago_banco_ruc` | sí |
| Tipo de cuenta | `pago_banco_tipo_cuenta` | sí |
| **Número de cuenta** | `pago_banco_numero` | **no** |
| Nombre comercial en Datafast | `pago_datafast_nombre_comercial` | no |
| Instagram de la marca | `marca_instagram_url` | sí |
| Número de venta (WhatsApp) | `marca_whatsapp_venta` | sí |
| IVA aplicado | `comercial_iva` | sí |
| Cupón vigente cocina / bienestar | `comercial_cupon_cocina`, `comercial_cupon_bienestar` | sí |
| Marca del catálogo Meta | `comercial_meta_marca` | sí |

"Público" es lo que puede salir por `GET /tools/commerce-settings`, que es lo que
lee la web. **El número de cuenta nunca sale por ahí**: solo lo entrega Vicky por
WhatsApp, a través de `GET /tools/payment-methods` (canal autenticado).

## Cómo llega a cada lado

```text
Admin (crm_setting)
   └─ GET /admin/b2b/crm/commerce-settings
        └─ ecommerce-tools  ── refresco cada 5 min y antes de hablar de pagos
             ├─ Vicky (agente de WhatsApp dentro del servicio)
             ├─ catálogo servido al storefront (cupón por línea)
             └─ GET /tools/commerce-settings (subconjunto público)
                  └─ storefront (/pagos, footer, envíos)
```

Si el backend no responde, `ecommerce-tools` conserva la última configuración
buena y, en el peor caso, los valores de arranque de `config.ts`: el bot nunca
se queda sin IVA, sin cupón ni sin número de venta.

## Qué sigue siendo variable de entorno

Credenciales e infraestructura: `DATABASE_URL`, `JWT_SECRET`, `COOKIE_SECRET`,
`TOOLS_API_TOKEN`, `MEDUSA_ADMIN_API_KEY`, `DATAFAST_ENTITY_ID`,
`DATAFAST_ACCESS_TOKEN`, `META_ACCESS_TOKEN`, `WHATSAPP_ACCESS_TOKEN`,
`OPENAI_API_KEY`, dominios públicos, puertos y CORS.

Dos excepciones deliberadas:

- `ECOMMERCE_TAX_RATE` y `WHATSAPP_SELLER_NUMBER` se siguen leyendo como
  respaldo de arranque. Un despliegue que hoy los tenga puestos no debe cambiar
  de IVA ni de número de venta en silencio. El ajuste del Admin pisa a ambos en
  cuanto el backend responde.
- El storefront mantiene el número de venta en `apps/storefront/lib/whatsapp.ts`
  para los CTA de campañas activas, que se arman en componentes de cliente. Es
  el mismo número que `marca_whatsapp_venta`; si se cambia uno, hay que cambiar
  el otro. Está pendiente unificarlo.

## Verificación

```bash
curl -fsS "$ECOMMERCE_TOOLS_BASE_URL/tools/commerce-settings" \
  -H "Authorization: Bearer $ECOMMERCE_TOOLS_TOKEN"
```

Debe traer cupones, IVA, número de venta, Instagram y banco — y **no** el número
de cuenta. Para lo que ve Vicky, incluida la cuenta:

```bash
curl -fsS "$ECOMMERCE_TOOLS_BASE_URL/tools/payment-methods" \
  -H "Authorization: Bearer $ECOMMERCE_TOOLS_TOKEN"
```
