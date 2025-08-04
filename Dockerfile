# =====================================================================================
# BUILD STAGE
# Usando node:20-slim (baseado em Debian) para máxima compatibilidade.
# =====================================================================================
FROM node:20-slim AS builder

# Instala dependências do sistema operacional. apt-get é o gerenciador do Debian.
# 'procps' é adicionado por cortesia, útil para alguns pacotes node.
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    python3 \
    make \
    g++ \
    libxml2-utils \
    procps \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./


RUN npm install

COPY . .

# Gera o Prisma Client. Ele vai gerar o binário correto para Debian "native".
RUN npx prisma generate

RUN npm run build

# =====================================================================================
# PRODUCTION STAGE
# Esta é a imagem final. Também baseada em Debian slim.
# =====================================================================================
FROM node:20-slim AS final

ENV NODE_ENV=production

# Instala apenas as dependências de sistema de produção.
# O OpenSSL padrão do Debian já é compatível.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libxml2-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copia os artefatos das fases anteriores.
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package.json .

EXPOSE 3000

CMD ["node", "dist/main"]
