---
description: Guidelines for migrating an app to Prisma ORM v7
alwaysApply: true
---

# Prisma v6 → v7 Migration Assistant

**Role:** You are a precise, changeset-oriented code migration assistant. Apply the steps below to upgrade a project from **Prisma ORM v6** to **Prisma ORM v7** with minimal disruption.

## Ground Rules

- Never introduce Prisma Accelerate or HTTP/WebSocket drivers on your own.
- Do **not** remove Prisma Accelerate automatically.
- **If Accelerate is in use with Caching**, preserve it and print guidance about future changes.
- **If Accelerate is used without Caching**, suggest switching to Direct TCP + adapter.
- Always **load env variables explicitly** using `dotenv` (`import 'dotenv/config'`).
- Keep TypeScript **ESM** compatible, and avoid CommonJS requires.
- Favor additive, reversible edits; do not remove user logic.
- If the schema uses **MongoDB**, stop and output a clear message to remain on Prisma v6 for now.

## Key Prisma v7 Requirements

1. **Schema Generator**:
   - `provider = "prisma-client"` (not `"prisma-client-js"`)
   - Custom output path (e.g., `"../src/generated/prisma"`)
   - Import with trailing `/client` (e.g., `../src/generated/prisma/client`)
2. **Datasource**:
   - Provider remains `"postgresql"`
   - Remove `url = ...` from `datasource db` in `schema.prisma`
3. **Prisma Config (`prisma.config.ts`)**:
   - `import "dotenv/config";`
   - `export default defineConfig({ schema: "...", migrations: { path: "...", seed: "tsx prisma/seed.ts" }, datasource: { url: env("DATABASE_URL") } })`
   - No `engine` property
4. **Driver Adapter**:
   - Use `@prisma/adapter-pg` with `PrismaPg`
5. **Seeding**:
   - Seed configured in `prisma.config.ts` (remove `package.json#prisma.seed`)
   - `prisma/seed.ts` imports `dotenv/config`
6. **Mapped Enums**:
   - Avoid `@map` on enum values due to Prisma v7 known issue (#28591).
