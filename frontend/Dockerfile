# ---------------- BUILD STAGE ----------------
# Builds the Vite app into static assets.
FROM node:24-alpine AS build

WORKDIR /app

# Copy package manifests first to keep npm install cacheable.
COPY package*.json ./
RUN npm ci

COPY . .

# Vite embeds this value at build time. Defaulting to relative path /api/v1 allows Nginx
# to reverse-proxy requests internally to the backend service.
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ---------------- RUNTIME STAGE ----------------
# Nginx serves the compiled static files; no Node runtime is needed.
FROM nginx:1.27-alpine AS runtime

# Custom config enables SPA fallback routing and long-lived asset caching.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
