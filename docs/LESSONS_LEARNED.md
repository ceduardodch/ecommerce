# Lecciones aprendidas del proyecto (junio 2026)

> Lo que este proyecto nos enseñó construyendo el CRM, el rediseño web, la
> migración de dominio y el flujo de agentes. Para humanos y agentes futuros.

## 0. LA REGLA (por encima de todo)

**Si algo no está verificado, dilo explícitamente.**

- Toda afirmación sobre **casos reales** — ventas, clientes, métricas, eventos
  de producción, resultados de campañas — se audita contra la fuente primaria
  (DB, logs, dashboard, Events Manager) antes de afirmarse. Un chat, un reporte
  o un documento que lo diga NO es evidencia.
- Todo trabajo se cierra con su verificación **ejecutada** y el output real.
  "Debería funcionar" no existe.
- Los reportes de agentes son afirmaciones, no hechos: se auditan con el agente
  `verificador` (independiente: re-ejecuta todo, veredictos ✅/❌/⚠️, nunca
  convierte un "no pude verificar" en un "probablemente sí").
- En todo reporte/documento separar: **Verificado** (con cómo) vs **Asumido/
  Pendiente** (con qué falta).

Está anclada en `CLAUDE.md` (toda sesión la carga) y operacionalizada en
`.claude/agents/verificador.md`.

## 1. Proceso: los planes ejecutables son la palanca maestra

- Un plan autosuficiente en `docs/` (contexto en frío + decisiones CERRADAS +
  maquetas descritas en texto + pasos con criterios de aceptación) permitió que
  un agente Sonnet ejecutara el Sprint A completo con un prompt de UNA línea.
  La inversión en escribir el plan se recupera en el primer lote delegado.
- Las decisiones se cierran POR ESCRITO con la frase "no re-preguntar" — sin
  eso, cada agente nuevo re-litiga lo decidido y quema tokens.
- Registro de decisiones tomadas durante la ejecución dentro del mismo plan
  (sección 7 del plan web): el ejecutor anota, el coordinador revisa.
- Maquetas visuales ANTES de codificar (widgets en el chat) ahorraron una
  iteración completa de UI: el dueño aprobó paleta/tipografía/layout viéndolos.

## 2. Delegación y tokens (datos reales del proyecto)

- **Medido (Sprint A)**: 4 historias mecánicas = ~90K tokens de Sonnet, 95 tool
  calls, ~15 min, builds en verde. Regla práctica: **~22K tokens por historia
  mecánica bien especificada**.
- Delegar por LOTE (sprint/épica), no por historia: cada spawn arranca en frío.
- Modelo según tarea: Sonnet ejecuta, Haiku busca, Opus/Fable coordina y decide.
- Los subagentes NO reducen el gasto total — su valor es modelo barato para lo
  mecánico + proteger el contexto del coordinador.
- Los agentes definidos en `.claude/agents/` se cargan al INICIO de sesión: un
  agente recién creado no es invocable en la sesión que lo creó (fallback:
  general-purpose + "lee .claude/agents/<x>.md y síguelo").

## 3. Errores cometidos (y su antídoto)

| Error | Qué pasó | Antídoto adoptado |
|---|---|---|
| Inventar una línea de negocio | "tengo los juguetes" se interpretó como nueva línea de juguetes y se planificó una épica entera; el negocio solo tiene cocina y bienestar | Ante términos ambiguos del dueño: preguntar ANTES de planificar. Quedó en memoria del agente y en CLAUDE.md |
| Afirmar sin mirar | Instagram por WebFetch dio casi nada; con el navegador real del dueño salió todo (isotipo, estética, prueba social) | Mirar la fuente real antes de describirla; si no se pudo mirar, decirlo |
| Asumir que el tooling funciona | `npm run test:unit` del backend NUNCA había corrido (faltaba `integration-tests/setup.js`) | Correr la verificación completa al menos una vez antes de confiar en ella |

## 4. El sistema de permisos del harness (cómo trabajar con él)

- **Push directo a `main`**: bloqueado (la vía es PR o push manual del dueño).
  `release` sí está autorizado por el flujo del proyecto.
- **Instalar paquetes/skills de fuentes elegidas por el agente**: bloqueado —
  el dueño debe nombrar la fuente o correr el comando él mismo (así se
  instalaron `tailwind-design-system` y `tailwind-v4-shadcn`).
- **Tarballs de CDNs externos**: bloqueados; usar el registro npm (así se
  resolvió `xlsx`).
- Patrón general: ante un bloqueo, NO buscar rodeos — explicar al dueño qué se
  intentó y darle el comando exacto para que decida.

## 5. Decisiones de producto/marca cerradas (no re-abrir)

- Dos líneas únicas: **cocina** (acento terracota `--clay`) y **bienestar**
  (acento musgo `--moss`). El verde del logo es familia de marca: musgo es su
  versión profunda; el menta solo como detalle decorativo, nunca CTA/precio.
- **El checkout es WhatsApp**: toda página de producto/campaña lleva barra
  inferior sticky con precio + botón verde; toda CTA de WhatsApp pasa por
  `TrackedWhatsAppLink`/`TrackedEventLink` (tracking innegociable).
- Dominio: `www.eter-niu.com` = portal de marca; nichos en subdominios
  (`cocina.` / `bienestar.eter-niu.com`); los dominios b2b.com.ec viven ≥ 12
  meses detrás de 301 (campañas Meta activas).
- Firma fotográfica de bienestar: producto en el páramo andino (diferencial
  que ningún referente tiene).

## 6. Patrones técnicos que funcionaron (replicar)

- **Carril seguro por defecto**: el envío automático de recompra nació en modo
  `draft` (encola, humano revisa) y se promueve a `openclaw` por env. Mismo
  patrón en la migración de dominio (`DOMAIN_MIGRATION_REDIRECTS=false` hasta
  que el DNS esté listo). Toda automatización riesgosa nace apagada.
- **Lógica pura separada y testeable** (`followup-dispatch.ts`,
  `ec-phone.ts`): tests unit sin DB, jest los corre en segundos.
- **Todo por variables de entorno**: la arquitectura env-driven del storefront
  hizo que sumar un dominio nuevo fuera ~30 líneas; el flip de producción es
  un cambio de env en Coolify, no un deploy de código.
- **Verificación multi-host con curl + header `Host:`** antes de afirmar que el
  routing funciona (documentado en DOMAIN_PLAN D2).
- **Guardrails de mensajería**: consentimiento + opt-out + cooldown + tope por
  corrida + ventana horaria + audit trail de eventos. El opt-out rate (≤2%) es
  el KPI guardián: si sube, se baja volumen.

## 7. Cómo usar el verificador independiente

1. Un ejecutor termina un lote y entrega su reporte (afirmaciones).
2. El coordinador lanza el agente `verificador` (Sonnet) con SOLO: el rango de
   commits, la lista de afirmaciones/IDs de historias y el plan de referencia.
   **Nunca** se le pasa el razonamiento del ejecutor — esa es su independencia.
3. El verificador re-ejecuta todo, audita los archivos protegidos con git diff,
   y entrega veredictos ✅/❌/⚠️ con evidencia + "Apto para push: SÍ/NO".
4. Solo con veredicto apto se hace push. Los ⚠️ van al reporte del dueño como
   "no verificado" — jamás se silencian.
