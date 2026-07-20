# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .

# VITE_API_URL and VITE_BASE_PATH are inlined into the JS bundle at build time.
# VITE_API_URL defaults to a same-origin relative /api, proxied by the outer
# Nginx to the backend service. VITE_BASE_PATH mounts the panel under /admin/
# to match the Nginx location block (see UBBFlow's config/nginx.conf) — this
# must stay Docker-only: Vercel serves the panel at its domain root, so
# vite.config.ts and App.tsx both default to root when this var is unset.
ARG VITE_API_URL=/api
ARG VITE_BASE_PATH=/admin/
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_BASE_PATH=${VITE_BASE_PATH}

RUN pnpm run build

# ─── Stage 2: Runner (Nginx) ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config for the admin SPA
COPY nginx-admin.conf /etc/nginx/conf.d/default.conf

# Copy Vite build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/nginx-health || exit 1

CMD ["nginx", "-g", "daemon off;"]
