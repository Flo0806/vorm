# Stage 1: Build the static assets
FROM node:24.3.0-bookworm-slim AS builder

RUN apt-get update && apt-get upgrade -y

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run docs:build

# --- DEBUG STEP ADDED ---
# Show the contents of the build folder to verify if files were created.
# The "R" in -laR enables recursive listing.
RUN ls -laR /app/.vitepress/


# Stage 2: Serve the built assets with Nginx
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
# This path must match what the ls command above shows
COPY --from=builder /app/.vitepress/dist .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]