# CI y Proteccion de Ramas

Configurar en GitHub Settings -> Branches cuando exista el remoto.

## Checks requeridos

Para `release` y `main`:

- `ci`

## Reglas recomendadas

- Require a pull request before merging.
- Require at least 1 approval.
- Require status checks to pass before merging.
- Require branches to be up to date before merging.
- Require linear history.
- Restrict direct pushes a `main`.
- No permitir force push.
- No permitir borrar `main`, `release` ni `develop`.

## Deploy

GitHub Actions queda limitado a validacion. El deploy sigue siendo responsabilidad de Coolify:

- `release` -> staging/preproduccion.
- `main` -> produccion.
