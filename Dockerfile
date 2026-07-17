# syntax=docker/dockerfile:1

# Multi-stage production image for the Pulung demo.
# Next.js is configured with `output: "standalone"` (next.config.ts), so the
# final stage runs the self-contained server.js bundle produced by the build.
#
# Build:  docker build -t pulung .
# Run:    docker run -p 3000:3000 -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=... \
#                -e CLERK_SECRET_KEY=... pulung

# ---------------------------------------------------------------------------
# Stage 1 — install all dependencies (cached on lockfile changes)
# ---------------------------------------------------------------------------
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat \
 && corepack enable \
 && corepack prepare pnpm@11.13.1 --activate
WORKDIR /app
# pnpm-workspace.yaml carries the sharp `allowBuilds` + release-age gating the
# lockfile depends on, so it must be present for --frozen-lockfile to resolve.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
# Stage 2 — build the production bundle (standalone output)
# ---------------------------------------------------------------------------
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat \
 && corepack enable \
 && corepack prepare pnpm@11.13.1 --activate
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Placeholder Clerk keys let the build inline NEXT_PUBLIC_* and read the secret
# without real credentials. The build never validates them; real keys are
# injected at runtime via environment.
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_replace_me \
    CLERK_SECRET_KEY=sk_test_replace_me
RUN pnpm build

# ---------------------------------------------------------------------------
# Stage 3 — minimal non-root runtime image
# ---------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# Non-root user (node:alpine ships `node`; we mirror the official Next pattern
# with a dedicated unprivileged user).
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
# Standalone server + its static + public siblings (not bundled by standalone).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
