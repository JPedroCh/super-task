# ---- Build stage ----
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines every VITE_* variable into the bundle at build time, so the
# API base URL has to be a build ARG here — passing it as a container
# runtime env var (docker run -e ...) would have no effect on the already-
# built static files. See README.md.
ARG VITE_API_BASE_URL=https://develop.api.athyna.com
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ---- Runtime stage ----
FROM nginx:alpine AS runtime
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
