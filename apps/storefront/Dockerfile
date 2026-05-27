FROM node:20-bookworm-slim AS deps

WORKDIR /app

ENV NODE_ENV=production
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

ARG NEXT_PUBLIC_TOOLS_API_URL
ARG NEXT_PUBLIC_STORE_URL
ENV NEXT_PUBLIC_TOOLS_API_URL=$NEXT_PUBLIC_TOOLS_API_URL
ENV NEXT_PUBLIC_STORE_URL=$NEXT_PUBLIC_STORE_URL

COPY package.json package-lock.json turbo.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/storefront/package.json apps/storefront/package.json
COPY services/ecommerce-tools/package.json services/ecommerce-tools/package.json
RUN npm ci --legacy-peer-deps --include=dev

FROM deps AS builder

WORKDIR /app

ARG NEXT_PUBLIC_TOOLS_API_URL
ARG NEXT_PUBLIC_STORE_URL
ENV NEXT_PUBLIC_TOOLS_API_URL=$NEXT_PUBLIC_TOOLS_API_URL
ENV NEXT_PUBLIC_STORE_URL=$NEXT_PUBLIC_STORE_URL

COPY . .
RUN npm run storefront:build

FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/apps/storefront/.next/standalone ./
COPY --from=builder /app/apps/storefront/.next/static ./apps/storefront/.next/static

EXPOSE 3000

CMD ["node", "apps/storefront/server.js"]
