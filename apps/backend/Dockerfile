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
RUN node -e "const fs=require('fs'); const p='apps/backend/package.json'; const pkg=JSON.parse(fs.readFileSync(p,'utf8')); for (const k of ['seed','seed:kitchen','seed:wellness']) pkg.scripts[k]=pkg.scripts[k].replace(/\\.ts/g,'.js'); fs.writeFileSync(p, JSON.stringify(pkg,null,2)+'\\n')"

EXPOSE 9000

CMD ["sh", "-c", "cd apps/backend && if [ \"${MEDUSA_RUN_MIGRATIONS_ON_START:-false}\" = \"true\" ]; then /app/node_modules/.bin/medusa db:migrate --skip-links; fi && npm run start"]
