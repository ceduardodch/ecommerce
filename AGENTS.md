# AGENTS.md - Reglas de Gobernanza para Agentes IA

Este archivo define las reglas de trabajo para cualquier agente IA que opere sobre este repositorio.

## Rama de trabajo por defecto

**Siempre trabajar en `release`.**

- No crear ramas nuevas sin aprobacion explicita del usuario.
- No crear ramas temporales como `feat/*`, `fix/*`, `codex/*`, `claude/*` ni similares.
- El flujo autorizado es: `develop` -> `release` -> PR -> `main`.
- Las ramas `develop`, `release` y `main` existen permanentemente. No borrarlas.

## Restricciones absolutas

Estas acciones estan prohibidas sin autorizacion explicita:

| Accion | Estado |
| --- | --- |
| `git push` a cualquier rama | PROHIBIDO salvo instruccion explicita |
| `git push --force` | PROHIBIDO siempre |
| Crear pull request | PROHIBIDO salvo instruccion explicita |
| Hacer merge entre ramas | PROHIBIDO salvo instruccion explicita |
| Borrar ramas | PROHIBIDO siempre |
| Modificar workflows de CI/CD | PROHIBIDO sin revision |
| Cambiar configuracion de Coolify | PROHIBIDO desde este repo |
| Escribir secretos reales en `.env` o docs | PROHIBIDO |

## Politica de CI/CD

- GitHub Actions es solo CI: install, build, tests y validacion de Docker Compose.
- Coolify hace deploy.
- `release` es staging/preproduccion.
- `main` es produccion y esta atado a Coolify.
- No agregar pasos de deploy, SSH, `rsync`, runners self-hosted ni comandos contra el servidor en GitHub Actions.

## Reglas de implementacion

- Validar localmente antes de decir que algo esta listo.
- Separar estado local, commit local, `origin/release`, `origin/main` y estado desplegado en Coolify.
- No decir que algo esta en produccion solo porque compila o porque esta en `release`.
- No tocar `main` sin autorizacion expresa del usuario.
- No cambiar pagos, calculos de montos, CORS, secretos, Docker Compose productivo o variables de PayPhone/Meta sin avisar.
- Mantener OpenClaw, PayPhone y Meta con fronteras claras: vendedor, pago y publicacion no son el mismo estado.

## Referencia de arquitectura

- Commerce core: Medusa v2.
- Storefront: Next.js.
- Tools: `services/ecommerce-tools` para OpenClaw, PayPhone y Meta.
- Deploy: Coolify con Docker Compose.
- Ver `AI_HANDOFF.md`, `docs/CURRENT_STATE.md`, `docs/PROJECT_MAP.md`, `docs/OPENCLAW_HANDOFF.md`, `README.md`, `docs/ARCHITECTURE.md`, `docs/COOLIFY_DEPLOYMENT.md` y `docs/BRANCH_STRATEGY.md`.
