# Deployment Guide

This application is ready to be deployed to any modern Next.js-compatible hosting environment.

## Vercel Deployment (Recommended)

Next.js is built by Vercel, making it the most seamless deployment target.
1. Connect your repository to Vercel.
2. Ensure the Framework Preset is set to "Next.js".
3. Configure your Environment Variables.
4. Deploy.

## Docker Deployment

To deploy using Docker, create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.mjs ./
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
- [ ] Run `npm run build` locally to verify there are no type or lint errors.
- [ ] Verify environment variables are set in the production environment.
- [ ] Test the production build using Lighthouse to ensure performance metrics are met.
