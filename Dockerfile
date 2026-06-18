# ── Build stage ──
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Runtime stage (nginx, static) ──
FROM nginx:1.27-alpine AS runtime

# v2는 8082 포트로 서비스 (v1과 동일 호스트 동시 운영)
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8082

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:8082/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
