# =====================================================================================
# BUILD STAGE
# Esta fase instala todas as dependências, gera os binários do Prisma e compila o projeto.
# =====================================================================================
FROM node:20-alpine AS builder

# Instala dependências do sistema operacional.
RUN apk add --no-cache git python3 make g++ libxml2-utils

WORKDIR /usr/src/app

# Copia os arquivos de manifesto de pacotes.
COPY package*.json ./

# Argumento para passar o token do GitHub de forma segura.
ARG GITHUB_TOKEN
RUN npm config set -g //github.com/:_authToken ${GITHUB_TOKEN}

# Instala TODAS as dependências.
RUN npm install

# Copia o resto do código-fonte, incluindo o schema.prisma modificado.
COPY . .

# Gera o Prisma Client e os BINÁRIOS (incluindo o para linux-musl).
RUN npx prisma generate

# Compila o projeto NestJS.
RUN npm run build

# =====================================================================================
# PRODUCTION DEPENDENCIES STAGE
# Esta fase cria uma instalação limpa apenas com as dependências de produção.
# =====================================================================================
FROM node:20-alpine AS prod-deps

# Instala o git, necessário para a dependência do GitHub.
RUN apk add --no-cache git

WORKDIR /usr/src/app

# Copia os arquivos de manifesto de pacotes.
COPY package*.json ./

# Argumento para passar o token do GitHub novamente.
ARG GITHUB_TOKEN
RUN npm config set -g //github.com/:_authToken ${GITHUB_TOKEN}

# Instala apenas as dependências de produção.
RUN npm install --omit=dev

# =====================================================================================
# FINAL STAGE
# Esta é a imagem final e otimizada para produção.
# =====================================================================================
FROM node:20-alpine AS final

ENV NODE_ENV=production

# Instala apenas as dependências de sistema estritamente necessárias em tempo de execução.
# Não precisamos mais de pacotes de compatibilidade do OpenSSL!
RUN apk add --no-cache libxml2-utils

WORKDIR /usr/src/app

# Copia os artefatos das fases anteriores.
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY package.json .

# Copia o Prisma Client gerado (que agora contém TODOS os binários necessários).
COPY --from=builder /usr/src/app/node_modules/.prisma/client ./node_modules/.prisma/client

# Expõe a porta da aplicação.
EXPOSE 3000

# Comando para iniciar a aplicação.
CMD ["node", "dist/main"]
