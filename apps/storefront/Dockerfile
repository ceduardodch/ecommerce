FROM node:24-bookworm-slim AS app

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
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run storefront:build

EXPOSE 3000

CMD ["npm", "run", "storefront:start"]
