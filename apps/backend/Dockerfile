FROM node:20-bookworm AS deps

WORKDIR /app

ENV NODE_ENV=production
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_AUDIT=false
ENV NPM_CONFIG_FUND=false

COPY package.json package-lock.json turbo.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/storefront/package.json apps/storefront/package.json
COPY services/ecommerce-tools/package.json services/ecommerce-tools/package.json
RUN npm ci --legacy-peer-deps --include=dev

FROM deps AS builder

WORKDIR /app

COPY . .
RUN npm run backend:build

FROM node:20-bookworm AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_AUDIT=false
ENV NPM_CONFIG_FUND=false

COPY package.json package-lock.json ./
COPY --from=builder /app/apps/backend/.medusa/server/package.json apps/backend/package.json
RUN npm ci --legacy-peer-deps --omit=dev --workspace @b2b/medusa-backend --include-workspace-root=false \
  && npm cache clean --force

COPY --from=builder /app/apps/backend/.medusa/server apps/backend
COPY --from=builder /app/apps/backend/src/migration-scripts apps/backend/src/migration-scripts

EXPOSE 9000

CMD ["sh", "-c", "cd apps/backend && if [ \"${MEDUSA_RUN_MIGRATIONS_ON_START:-false}\" = \"true\" ]; then /app/node_modules/.bin/medusa db:migrate --skip-links; fi && npm run start"]
