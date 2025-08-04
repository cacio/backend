# Usa imagem oficial do Node com apt-get disponível
FROM node:18

# Instala o xmllint (libxml2-utils)
RUN apt-get update && apt-get install -y libxml2-utils

# Define diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependência e instala
COPY package*.json ./
RUN npm install

# Copia o restante do projeto
COPY . .

# Compila o projeto NestJS
RUN npm run build

# Expõe a porta padrão usada pelo NestJS
EXPOSE 3000

# Inicia o servidor em produção
CMD ["npm", "run", "start:prod"]
