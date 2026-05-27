FROM node:20-bookworm-slim AS app

WORKDIR /app

ENV NODE_ENV=production
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json turbo.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/storefront/package.json apps/storefront/package.json
COPY services/ecommerce-tools/package.json services/ecommerce-tools/package.json
RUN npm ci --legacy-peer-deps --include=dev

COPY . .
RUN npm run backend:build

EXPOSE 9000

CMD ["sh", "-c", "cd apps/backend && npx medusa db:migrate && cd .medusa/server && npm run start"]
