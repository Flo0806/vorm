# Stage 1: Build the static assets
FROM node:22.5.0-bookworm-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run docs:build

# --- DEBUG-SCHRITT HINZUGEFÜGT ---
# Zeige uns den Inhalt des Build-Ordners, um zu sehen, ob Dateien erstellt wurden.
# Das "R" bei -laR sorgt für eine rekursive Auflistung.
RUN ls -laR /app/.vitepress/


# Stage 2: Serve the built assets with Nginx
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
# Dieser Pfad muss mit dem übereinstimmen, was der ls-Befehl anzeigt
COPY --from=builder /app/.vitepress/dist .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]