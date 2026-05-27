# Branch Strategy

Este repo sigue la misma filosofia usada en los proyectos B2B desplegados por Coolify.

## Ramas permanentes

| Rama | Uso | Deploy |
| --- | --- | --- |
| `develop` | Desarrollo activo cuando haga falta separar trabajo previo | Sin deploy directo |
| `release` | Rama de trabajo por defecto y staging/preproduccion | Coolify staging cuando se conecte |
| `main` | Produccion | Coolify produccion |

## Flujo autorizado

```text
develop -> release -> PR -> main
```

Para el trabajo diario:

```bash
git checkout release
# cambios
npm run build
npm run tools:test
git status --short --branch
```

Para publicar staging:

```bash
git push origin release
```

Solo hacer esto con autorizacion explicita del usuario.

Para publicar produccion:

1. Validar `release`.
2. Crear PR `release -> main`.
3. Revisar staging.
4. Aprobar y mergear.
5. Coolify despliega `main`.

## Reglas operativas

- `main` es frontera de produccion. No hacer push directo a `main`.
- `release` no debe describirse como produccion.
- GitHub Actions valida; Coolify despliega.
- Si el usuario pregunta "ya esta?", responder separando:
  - rama actual;
  - cambios locales;
  - commit local;
  - paridad con `origin/release`;
  - paridad con `origin/main`;
  - estado Coolify si fue revisado.
