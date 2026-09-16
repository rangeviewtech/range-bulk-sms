# Deployment Guide

This application uses Next.js 16 and Prisma 7. Use Node.js 22.12 or newer within the Node 22 release line, or Node.js 24. Validate the environment and database schema before deploying.

## Vercel Deployment (Recommended)

Next.js is built by Vercel, making it the most seamless deployment target.
1. Connect your repository to Vercel.
2. Ensure the Framework Preset is set to "Next.js".
3. Configure your Environment Variables.
4. Deploy.

## Docker Deployment

The following Docker example requires `output: "standalone"` in `next.config.ts` (it is not enabled by default). Generate Prisma Client before building. Adapt the example to your secret injection and migration process; this image has not been built in this audit.

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

## Traditional Node.js Hosting

1. Run `npm run build`.
2. Run `npm run start` on the server using a process manager like PM2.

## Performance Checklist

Before deploying:
- [ ] Run `npm run build` locally to verify production compilation; run `npm run lint` and `npm run typecheck` separately.
- [ ] Verify environment variables are set in the production environment.
- [ ] Test the production build using Lighthouse to ensure performance metrics are met.

## Required runtime configuration

- Set a unique server-only `AUTH_SECRET` of at least 32 characters and a working PostgreSQL `DATABASE_URL`.
- Production rate limits require both `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Missing configuration or a Redis failure denies rate-limited operations. Local in-memory limits are only for development/tests.
- Set real `TURNSTILE_SECRET_KEY` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` values for your production domain; the example keys are testing keys.
- Set `APP_URL` and `NEXT_PUBLIC_APP_URL` to the deployment HTTPS origin.
- Configure SMTP and every enabled delivery channel. Missing provider configuration fails delivery; it does not simulate success. SMTP accepts `SMTP_USER`/`SMTP_PASS`/`SMTP_FROM` and the example's legacy aliases. Pandora accepts both `PANDORA_*` and `PANDORA_SMS_*` names.
- Configure a unique `CRON_SECRET`, schedule authenticated calls to `/api/cron/process-jobs`, and ensure hosting execution limits support the batch duration. Monitor retries and dead letters.
- Telegram requires `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, and the bot username used for linking. Register the webhook with the same secret.
- Verify a migration path for the current Prisma schema against a staging database before deploying. Do not use schema reset on production.
- Social sign-in is intentionally unavailable until a real OAuth implementation is configured. Review/revoke previously issued demonstration-account sessions if that earlier implementation was deployed.

See [the audit report](docs/development/PROJECT_AUDIT.md) for verified checks and remaining validation gaps.

For isolated browser tests in PowerShell, set `$env:PLAYWRIGHT_PORT="3107"` before running Playwright. Ensure the server on that port belongs to this checkout.
