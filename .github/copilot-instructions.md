# Copilot Instructions

- Work on `release` by default.
- Treat `main` as production because Coolify deploys from it.
- Do not add deployment steps to GitHub Actions.
- Do not write real secrets to the repo.
- Validate with `npm run build`, `npm run tools:test`, and `docker compose config` before reporting readiness.
- Separate local, pushed, and deployed state in status answers.
