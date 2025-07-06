
# 1. Build Stage
FROM node:22-alpine AS builder
WORKDIR /app
RUN npm version
COPY package.json ./
RUN npm install --legacy-peer-deps
RUN npm run docs:build
COPY . .

# 2. Serve Stage mit NGINX
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/.vitepress/dist ./
EXPOSE 80


