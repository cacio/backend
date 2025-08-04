# =====================================================================================
# BUILD STAGE
# Esta fase instala dependências (incluindo as de desenvolvimento),
# compila o TypeScript para JavaScript e gera o schema do Prisma.
# =====================================================================================
FROM node:20-alpine AS builder

# Instala dependências do sistema operacional necessárias para o build.
# - git: necessário para clonar a dependência do GitHub.
# - python3, make, g++: são dependências do node-gyp.
# - libxml2-utils: a dependência que você solicitou.
RUN apk add --no-cache git python3 make g++ libxml2-utils

# Define o diretório de trabalho dentro do contêiner.
WORKDIR /usr/src/app

# Copia os arquivos de manifesto de pacotes.
COPY package*.json ./

# Argumento para passar o token do GitHub de forma segura durante o build.
ARG GITHUB_TOKEN
RUN npm config set -g //github.com/:_authToken ${GITHUB_TOKEN}

# Instala TODAS as dependências (incluindo devDependencies).
RUN npm install

# Copia todo o resto do código-fonte da aplicação.
COPY . .

# Gera o cliente do Prisma.
RUN npx prisma generate

# Compila o projeto NestJS.
RUN npm run build

# =====================================================================================
# PRODUCTION DEPENDENCIES STAGE
# Esta fase instala APENAS as dependências de produção.
# =====================================================================================
FROM node:20-alpine AS prod-deps

# Instala o git, que é necessário para o npm avaliar a dependência do GitHub.
RUN apk add --no-cache git

WORKDIR /usr/src/app

# Copia os arquivos de manifesto de pacotes.
COPY package*.json ./

# Argumento para passar o token do GitHub novamente.
ARG GITHUB_TOKEN
RUN npm config set -g //github.com/:_authToken ${GITHUB_TOKEN}

# Instala apenas as dependências de produção.
# Usamos --omit=dev em vez de 'prune' para ser mais moderno e eficiente.
RUN npm install --omit=dev

# =====================================================================================
# FINAL STAGE
# Esta é a imagem final que será enviada para o Render.
# =====================================================================================
FROM node:20-alpine AS final

# Define a variável de ambiente para indicar que estamos em produção.
ENV NODE_ENV=production

# Instala a dependência de sistema 'libxml2-utils' que é necessária em tempo de execução.
RUN apk add --no-cache libxml2-utils

WORKDIR /usr/src/app

# Copia os artefatos das fases anteriores.
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY package.json .

# Expõe a porta que sua aplicação NestJS usa (o padrão é 3000).
EXPOSE 3000

# O comando para iniciar a aplicação em modo de produção.
CMD ["node", "dist/main"]
