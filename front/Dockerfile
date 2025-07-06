# Stage 1: Build da aplicação React
FROM node:18-alpine as build

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Construir a aplicação
RUN npm run build

# Stage 2: Servir com nginx
FROM nginx:alpine

# Copiar arquivos build para nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Comando para executar nginx
CMD ["nginx", "-g", "daemon off;"] 