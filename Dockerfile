# 1. Build Stage: Baut die statischen VitePress-Dateien

# Verwende ein Node-Image und installiere pnpm
FROM node:22-alpine AS builder
RUN npm install -g pnpm

WORKDIR /app

# Kopiere die Abhängigkeits-Definitionen aus dem Root-Verzeichnis
COPY package.json pnpm-lock.yaml ./

# Installiere ALLE Abhängigkeiten für das gesamte Monorepo
# Dies nutzt den Docker-Cache optimal aus
RUN pnpm install --frozen-lockfile --prod

# Kopiere den gesamten Quellcode des Monorepos
COPY . .

# Baue ausschließlich das 'docs'-Projekt
RUN pnpm --filter docs run docs:build


# 2. Serve Stage: Serviert die fertigen Dateien mit NGINX

FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# Lösche den Standard-Content von Nginx
RUN rm -rf ./*

# Kopiere nur die gebauten Dateien aus dem 'docs'-Projekt
COPY --from=builder /app/packages/docs/.vitepress/dist .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]