# Go-Live Eter Niu

## Objetivo

Publicar `eter-niu.com` en producción con tienda, carrito, WhatsApp real, CRM en
Medusa, ledger persistente de Datafast y widget Datafast en ambiente de pruebas
para certificación. El cobro real con tarjeta queda bloqueado hasta tener
credenciales productivas de Datafast.

## Checklist de código

- Ejecutar en `release`: `npm run tools:test`, `npm run storefront:build` y
  `docker compose config`.
- Verificar que `/checkout/pago` muestra `Segundo nombre` y exige nombre,
  apellido, cédula, teléfono, email y dirección.
- Verificar que `/checkout/resultado` reenvía `id` y `resourcePath` a
  `ecommerce-tools`.
- Confirmar que `datafast-checkouts.json` queda en `TOOLS_DATA_DIR=/data` y que
  el volumen `tools-data` está persistente en Coolify.
- Usar `npm run datafast:probe` contra el servicio desplegado para crear un
  checkout de certificación sin exponer secretos de Datafast.

## Variables Coolify mínimas

```text
CRM_BACKEND=medusa
ALLOW_DEMO_CATALOG=false
TOOLS_DATA_DIR=/data
STORE_PUBLIC_URL=https://eter-niu.com
COCINA_PUBLIC_URL=https://cocina.eter-niu.com
BIENESTAR_PUBLIC_URL=https://bienestar.eter-niu.com
NEXT_PUBLIC_STORE_URL=https://eter-niu.com
NEXT_PUBLIC_COCINA_URL=https://cocina.eter-niu.com
NEXT_PUBLIC_BIENESTAR_URL=https://bienestar.eter-niu.com
NEXT_PUBLIC_TOOLS_API_URL=https://eter-niu.com
NEXT_PUBLIC_BRAND_URL=https://www.eter-niu.com
DATAFAST_ENV=test
DATAFAST_DRY_RUN=false
DATAFAST_CUSTOMER_NAME=ETERNIU
MEDUSA_INTERNAL_URL=http://medusa-api:9000
```

Además configurar en Coolify, no en Git: `POSTGRES_PASSWORD`, `JWT_SECRET`,
`COOKIE_SECRET`, `TOOLS_API_TOKEN`, `MEDUSA_PUBLISHABLE_KEY`,
`MEDUSA_ADMIN_API_KEY`, `DATAFAST_ENTITY_ID`, `DATAFAST_ACCESS_TOKEN`,
`DATAFAST_MID`, `DATAFAST_TID` y `REVIEWS_API_TOKEN` si se habilitan reseñas.

## Validación pública

- `https://eter-niu.com`, `https://www.eter-niu.com`,
  `https://cocina.eter-niu.com` y `https://bienestar.eter-niu.com` cargan con
  TLS válido.
- Cloudflare debe tener Minimum TLS Version `1.2`.
- `/feeds/meta/catalog.csv`, `/terminos`, `/privacidad`,
  `/envios-devoluciones`, `/cart` y CTAs de WhatsApp funcionan.
- Health interno de tools muestra `crmBackend=medusa`,
  `allowDemoCatalog=false`, `datafastMode=test` y `datafastConfigured=true`.
- Datafast sandbox: aprobado menor a USD 50 llega a `¡Pago confirmado!`;
  rechazo por monto de prueba conserva carrito y no registra venta.

## Corte a tarjeta real

Cambiar a `DATAFAST_ENV=live` solo después de que Datafast entregue credenciales
productivas y apruebe certificación. El primer smoke test real debe ser de monto
bajo y se debe validar en Datafast, CRM y ledger antes de abrir campañas.
