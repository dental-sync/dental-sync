FROM node:20-alpine AS build

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código-fonte
COPY . .

# Construir a aplicação
RUN npm run build

# Imagem de produção
FROM nginx:alpine

# Copiar arquivos de build para o servidor nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuração personalizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor a porta 80
EXPOSE 80

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"] 