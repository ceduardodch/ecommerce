# Bitácora del sprint autónomo

> Un bloque por lote. Formato fijo para que el dueño lea de un vistazo qué pasó
> mientras no estaba. Plan: [SPRINT_AUTONOMO.md](./SPRINT_AUTONOMO.md).
>
> Cada entrada separa **Verificado** (con el output real) de
> **Pendiente/Asumido** (con qué falta), según la REGLA #1 de `CLAUDE.md`.

---

## 2026-08-31 · Lote 0 (sesión con el dueño)

**Ítems cerrados**: bloque 1 (SEO + tracking + número), CI, bloque 2 (cobros
huérfanos + caché), y el 500 de plantillas en producción.

**Commits en `main`**: `cb76f92` `3191f7e` `f0ffe93` `25719f4` `a6e8b62`
`885b26f` `33f4a4a` `a3b787a`

**Verificado**:
- `turbo typecheck` 3/3 · `turbo build` 3/3 · tools 88 tests · backend 85 tests
- CI en `main` verde, ya con los pasos `Typecheck` y `Test backend`
- Canónicas: `/products/…` ahora apunta a sí misma (antes, a la portada)
- `/api/events`: `Purchase` desde el navegador → 403; flood → 429
- Catálogo: 5 visitas a una ficha = 1 petición upstream (antes 10)
- `medusa db:migrate` sobre base vacía: exit 0, 21 + 49 productos sembrados
- La consulta de plantillas que daba 500 devuelve datos con
  `label`/`media_url`/`media_type`

**Pendiente**:
- Confirmar en producción que el 500 de `/admin/b2b/crm/templates` quedó
  resuelto tras el deploy (ver nota abajo).
- Tareas del dueño: EPIC O completo en el plan.

**Nota sobre el 500 de plantillas**: la causa raíz verificada es que la cadena
de migraciones se rompía en `Migration20260702000000` (`relation
"product_review" does not exist`), y como MikroORM las aplica en transacción,
`Migration20260724000000` —la que añade `label`, `media_url` y `media_type` a
`crm_message_template`— nunca llegaba a aplicarse. El `serialize()` del endpoint
lee esas columnas, de ahí el 500. Reproducido en Postgres 16 local y corregido.
**No verificado**: el estado exacto del esquema en producción. Si tras el deploy
el 500 persiste, correr:

```bash
psql "$DATABASE_URL" -c "\d crm_message_template"
```

Si faltan `label`, `media_url` o `media_type`, ejecutar `npx medusa db:migrate`
en el contenedor de Medusa: con los dos fixes de esta tanda la cadena ya
completa.
