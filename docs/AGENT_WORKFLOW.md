# Flujo de agentes y estrategia de tokens

> Cómo coordinar los agentes del repo para avanzar los sprints gastando lo
> mínimo. Junio 2026.

## 1. Los agentes disponibles (`.claude/agents/`)

| Agente | Rol | Modelo sugerido | Cuándo usarlo |
|---|---|---|---|
| **sprint-executor** | Caballo de batalla: implementa historias YA especificadas en los planes (IDs TPL-x, WFND-x, XS-x, D-x…) | **sonnet** | El 80% del trabajo: las specs están escritas, solo hay que ejecutarlas |
| **frontend-architect** | Especialista React/Next del storefront | sonnet/opus | Historias de UI con criterio fino (WCMP-1, WHOM-1) o cuando sprint-executor se traba en frontend |
| **backend-engineer** | Especialista Medusa/Postgres | sonnet/opus | Historias de CRM con modelo/migración (TPL-1) o endpoints complejos |
| **software-architect** | Decisiones estructurales | opus/fable | SOLO cuando hay que cambiar un plan o tomar una decisión nueva de arquitectura |
| **verificador** | Auditor independiente: re-ejecuta verificaciones y audita afirmaciones con veredictos ✅/❌/⚠️ | sonnet | Después de cada lote ANTES del push; y para auditar cualquier afirmación sobre casos reales (métricas, clientes, producción) |
| **Explore** (built-in) | Búsqueda de solo lectura | haiku/sonnet | Responder "¿dónde está X?" sin gastar el contexto principal |

Skills instalados que los refuerzan: `tailwind-design-system`, `tailwind-v4-shadcn`,
`vercel-react-best-practices`, `awwwards-animations`, `frontend-design-ultimate`.

## 2. El modelo de coordinación (quién hace qué)

```
Tú (dueño) — decides prioridades, apruebas visuales, das inputs (fotos, DNS, leads)
   │
Sesión principal (Fable/Opus) — COORDINADOR: poco código, mucho criterio
   │  · asigna historias por ID, integra resultados, hace push, te reporta
   │
   ├── sprint-executor (sonnet) ── ejecuta lote de historias + tests + commits
   ├── frontend/backend specialist (sonnet) ── historias delicadas de su dominio
   └── Explore (haiku) ── preguntas de código baratas
```

**Reglas de oro del coordinador:**
1. **Delegar por LOTE, no por historia**: un agente que hace TPL-1+TPL-2+TPL-3
   en una sesión cuesta mucho menos que 3 agentes (cada spawn arranca en frío y
   re-lee el plan). Lote ideal = un sprint o una épica.
2. **Prompt de delegación = doc + IDs + nada más**: "Lee docs/CRM_BACKLOG.md y
   ejecuta TPL-1, TPL-2 y TPL-3 según el flujo del agente". Los planes ya son
   autosuficientes — NO repitas las specs en el prompt (eso duplica tokens).
3. **El coordinador no implementa**: si la sesión principal escribe 500 líneas
   de código, ese contexto queda cargado el resto de la sesión. Implementa el
   ejecutor; el coordinador revisa el reporte y el diff.
4. **Continuar > re-lanzar**: si un agente terminó y hay seguimiento, usa
   SendMessage al mismo agente (conserva su contexto) en vez de lanzar uno nuevo.
5. **Revisión barata**: tras cada lote, `/code-review` (effort low/medium) sobre
   el diff en vez de re-leer todo a mano.
6. **Verificar antes de push (REGLA #1 de CLAUDE.md)**: el reporte de un
   ejecutor es una afirmación, no un hecho. Lanzar el agente `verificador` con
   el rango de commits + IDs de historias (sin el razonamiento del ejecutor) y
   hacer push solo con "Apto para push: SÍ". Lo no verificable se reporta al
   dueño como ⚠️ explícito — nunca se presenta como hecho.

## 3. Estrategia de tokens (honesta)

**Lo que de verdad ahorra:**

| Palanca | Ahorro | Cómo |
|---|---|---|
| Planes ejecutables en docs/ | El mayor de todos | Ya está hecho: el ejecutor no explora ni decide, solo implementa. Mantener los planes actualizados ES la estrategia de tokens |
| Modelo por tarea | Alto | Historias mecánicas → sonnet; búsquedas → haiku; coordinación/decisiones → fable/opus. Se elige al lanzar el agente (`model`) |
| Lotes grandes | Alto | 1 agente × 3 historias ≫ 3 agentes × 1 historia |
| Sesiones limpias | Medio | Una sesión de coordinación POR SPRINT. Al cerrar un sprint: resumen al plan + sesión nueva. No mezclar CRM + web + dominio en un mismo hilo largo |
| No re-pegar contexto | Medio | Referenciar archivos por ruta en vez de pegar su contenido en el chat |

**Lo que NO ahorra (mito):** los subagentes no reducen el gasto total — gastan
tokens propios. Su valor real es (a) usar un modelo más barato para el trabajo
mecánico y (b) proteger el contexto del coordinador para que la sesión principal
dure todo el sprint sin degradarse.

**Medición del gasto:**
- `/usage` en Claude Code → estado de los límites del plan (sesión semanal/5h).
- `/cost` → consumo de la sesión actual.
- Hábito: anotar al cierre de cada sprint cuánto se consumió (sección 5) para
  saber cuántas historias salen por "tanque" y planificar lotes.

**Presupuesto sugerido por lote** (regla práctica): si un lote de historias va a
necesitar > ~30 archivos tocados o > 1 build pesado por historia, pártelo en dos
agentes secuenciales en vez de uno gigante — un agente que se queda sin contexto
a mitad de historia desperdicia todo lo anterior.

## 4. Plantillas de delegación (copiar/pegar)

**Lote de sprint al ejecutor:**
> Usa el agente sprint-executor (modelo sonnet): "Lee docs/WEB_REDESIGN_PLAN.md
> y ejecuta el Sprint A completo (WFND-1, WFND-2, WFND-3, WFND-4) siguiendo tu
> flujo de trabajo. Commit por historia, sin push."

**Historia delicada al especialista:**
> Usa el agente frontend-architect: "Ejecuta WCMP-1 de docs/WEB_REDESIGN_PLAN.md
> (rediseño de la landing de campaña). Respeta la sección 'Qué NO se puede tocar'
> y la maqueta descrita en 2.3. Verifica con el build y el script de validación
> de campañas."

**Pregunta barata:**
> Usa el agente Explore (haiku): "¿Qué componentes importan hoy
> floating-whatsapp-cta.tsx en apps/storefront?"

**Auditoría independiente (antes de cada push de lote):**
> Usa el agente verificador (sonnet): "Audita el lote <nombre> — rango de
> commits <base>..<head> — contra los criterios de aceptación de las historias
> <IDs> en docs/<plan>.md. Afirmaciones a auditar: <lista numerada de lo que el
> ejecutor reportó>. Entrega veredictos y la conclusión Apto para push."
> (No le pases el razonamiento del ejecutor — solo las afirmaciones.)

## 5. Registro de consumo por sprint

| Fecha | Sprint/lote | Agente(s) | Consumo | Notas |
|---|---|---|---|---|
| 2026-06-11 | Sprint A rediseño (WFND-1..4) | sprint-executor (sonnet) | ~90K tokens del subagente, 95 tool calls, ~15 min | 4 historias, 5 commits, 17 componentes UI, builds en verde al primer intento del lote. Referencia: ~22K tokens/historia mecánica |
| 2026-06-11 | Auditoría Sprint A | verificador (sonnet) | ~45K tokens, 40 tool calls, ~4 min | Veredicto inicial: NO apto (2 hallazgos reales: fuente muerta en globals.css y 7 estilos inline de color). Corregidos por el coordinador. Referencia: una auditoría de lote ≈ mitad del costo del lote |
