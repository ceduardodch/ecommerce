FROM node:20-bookworm-slim AS app

WORKDIR /app

ENV NODE_ENV=production
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

COPY package.json package-lock.json turbo.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/storefront/package.json apps/storefront/package.json
COPY services/ecommerce-tools/package.json services/ecommerce-tools/package.json
RUN npm ci --legacy-peer-deps --include=dev

COPY . .
RUN npm run tools:build

EXPOSE 8787

CMD ["sh", "-c", "cd services/ecommerce-tools && npm run start"]
