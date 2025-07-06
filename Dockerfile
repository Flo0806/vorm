# 1. Build Stage: Baut die statischen VitePress-Dateien
FROM node:22-alpine AS builder
RUN npm install -g pnpm

WORKDIR /app

# HIER DIE KORREKTUR: Wir kopieren auch die pnpm-workspace.yaml
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

# Wenn es keine pnpm-workspace.yaml gibt, schlägt der Befehl nicht fehl
# dank des Sternchens (*), aber wenn sie da ist, wird sie kopiert.

RUN pnpm install --frozen-lockfile

# Kopiere den gesamten Quellcode
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