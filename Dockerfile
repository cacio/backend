# =====================================================================================
# BUILD STAGE
# Esta fase instala dependências (incluindo as de desenvolvimento),
# compila o TypeScript para JavaScript e gera o schema do Prisma.
# =====================================================================================
FROM node:20-alpine AS builder

# Instala dependências do sistema operacional necessárias para o build.
# - git: necessário para clonar a dependência do GitHub.
# - python3, make, g++: são dependências do node-gyp, que pode ser usado por alguma de suas dependências.
# - libxml2-utils: a dependência que você solicitou explicitamente.
RUN apk add --no-cache git python3 make g++ libxml2-utils

# Define o diretório de trabalho dentro do contêiner.
WORKDIR /usr/src/app

# Copia os arquivos de manifesto de pacotes.
COPY package*.json ./

# Argumento para passar o token do GitHub de forma segura durante o build.
# Este token é necessário para instalar sua dependência privada 'node-sped-nfe-custom'.
ARG GITHUB_TOKEN
RUN npm config set -g //github.com/:_authToken ${GITHUB_TOKEN}

# Instala as dependências do projeto.
RUN npm install

# Copia todo o resto do código-fonte da aplicação.
COPY . .

# Gera o cliente do Prisma. É crucial para que o Prisma funcione corretamente.
RUN npx prisma generate

# Compila o projeto NestJS.
RUN npm run build

# =====================================================================================
# PRUNE STAGE
# Esta fase intermediária remove as dependências de desenvolvimento para
# manter a imagem final o mais leve possível.
# =====================================================================================
FROM node:20-alpine AS pruner

WORKDIR /usr/src/app

# Instala novamente, mas apenas as dependências de produção.
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
RUN npm prune --production

# =====================================================================================
# FINAL STAGE
# Esta é a imagem final que será enviada para o Render.
# Ela é otimizada, pequena e contém apenas o necessário para rodar a aplicação.
# =====================================================================================
FROM node:20-alpine AS final

# Define uma variável de ambiente para indicar que estamos em produção.
ENV NODE_ENV=production

# Instala a dependência de sistema 'libxml2-utils' que é necessária em tempo de execução.
RUN apk add --no-cache libxml2-utils

# Define o diretório de trabalho.
WORKDIR /usr/src/app

# Copia os artefatos da fase de 'pruner' e 'builder'.
COPY --from=pruner /usr/src/app/package*.json ./
COPY --from=pruner /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

# Expõe a porta que sua aplicação NestJS usa (o padrão é 3000).
# O Render irá detectar isso automaticamente.
EXPOSE 3000

# O comando para iniciar a aplicação em modo de produção.
CMD ["node", "dist/main"]
