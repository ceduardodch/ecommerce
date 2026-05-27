FROM node:20-bookworm-slim AS deps

WORKDIR /app

ENV NODE_ENV=production
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

COPY package.json package-lock.json turbo.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/storefront/package.json apps/storefront/package.json
COPY services/ecommerce-tools/package.json services/ecommerce-tools/package.json
RUN npm ci --legacy-peer-deps --include=dev

FROM deps AS builder

WORKDIR /app

COPY . .
RUN npm run tools:build

FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

COPY package.json package-lock.json ./
COPY services/ecommerce-tools/package.json services/ecommerce-tools/package.json
RUN npm ci --legacy-peer-deps --omit=dev --workspace @b2b/ecommerce-tools --include-workspace-root=false \
  && npm cache clean --force

COPY --from=builder /app/services/ecommerce-tools/dist services/ecommerce-tools/dist

EXPOSE 8787

CMD ["node", "services/ecommerce-tools/dist/index.js"]
