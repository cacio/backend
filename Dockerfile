# ========================
# BUILD STAGE
# ========================
FROM node:20-slim AS builder

# Instala dependências necessárias para build e Prisma (como openssl)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    python3 \
    make \
    g++ \
    libxml2-utils \
    openssl \
    procps \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copia arquivos de dependência e instala módulos
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Gera client do Prisma
RUN npx prisma generate

# Compila o NestJS
RUN npm run build


# ========================
# PRODUCTION STAGE
# ========================
FROM node:20-slim AS final

ENV NODE_ENV=production

# Instala apenas libs mínimas necessárias para rodar
RUN apt-get update && apt-get install -y --no-install-recommends \
    libxml2-utils \
    openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copia o necessário do builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package.json .

# Expõe a porta padrão do Nest
EXPOSE 3000

# Inicia o app
CMD ["node", "dist/main"]
