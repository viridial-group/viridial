### Dockerfile for Next.js frontend (web app)
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files from web directory
COPY web/package.json web/pnpm-lock.yaml* ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY web ./

# Build time environment variables
ARG NEXT_PUBLIC_AUTH_API_URL
ENV NEXT_PUBLIC_AUTH_API_URL=${NEXT_PUBLIC_AUTH_API_URL}
ARG NEXT_PUBLIC_PROPERTY_API_URL
ENV NEXT_PUBLIC_PROPERTY_API_URL=${NEXT_PUBLIC_PROPERTY_API_URL}
ARG NEXT_PUBLIC_SEARCH_API_URL
ENV NEXT_PUBLIC_SEARCH_API_URL=${NEXT_PUBLIC_SEARCH_API_URL}

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
