FROM node:22-bookworm-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build

FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production \
    TZ=Europe/Bucharest \
    DATABASE_URL=file:/app/data/prod.db \
    PORT=3000
COPY --from=build --chown=node:node /app ./
RUN rm -f prisma/dev.db && mkdir -p /app/data && chown node:node /app/data
USER node
EXPOSE 3000
# Sync the schema and seed (idempotent) on every start, then serve.
CMD ["sh", "-c", "npx prisma db push --skip-generate && npx tsx prisma/seed.ts && npx next start"]
