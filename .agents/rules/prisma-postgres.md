---
description: Guidelines for writing Next.js apps with Prisma Postgres (Prisma v7)
alwaysApply: true
---

# Bootstrap Next.js app with Prisma Postgres (Prisma v7)

> **Note**: This guide is updated for **Prisma ORM 7**. Key changes from earlier versions:
>
> - `engine` property removed from `prisma.config.ts`
> - `url` removed from datasource in `schema.prisma` (now only in `prisma.config.ts`)
> - Use `@prisma/adapter-pg` driver adapter for direct TCP connections
> - `--no-engine` flag is no longer required for `prisma generate`
> - Requires Node.js 20.19+ and TypeScript 5.4.0+

## 🚨 CRITICAL INSTRUCTIONS FOR AI CODING AGENTS 🚨

As an AI coding assistant, you MUST NOT generate any of the following code patterns, as they are DEPRECATED and will BREAK the application:

```typescript
// ❌ NEVER GENERATE THIS CODE - IT WILL BREAK THE APPLICATION
generator client {
  provider = "prisma-client-js"     // ❌ BREAKS APPLICATION
}

// ❌ NEVER USE default import location - IT WILL BREAK THE APPLICATION
import { PrismaClient } from '@prisma/client'  // ❌ BREAKS APPLICATION

// ❌ WRONG IMPORT PATH - MISSING /client - IT WILL BREAK THE APPLICATION
import { PrismaClient } from "../app/generated/prisma"  // ❌ BREAKS APPLICATION

// ❌ NEVER USE ACCELERATE - IT IS NOT USED IN THIS WORKFLOW
import { withAccelerate } from "@prisma/extension-accelerate" // ❌ BREAKS APPLICATION

// ❌ NEVER USE accelerateUrl - IT WILL BREAK THE APPLICATION
const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,  // ❌ BREAKS APPLICATION - use adapter
})

// ❌ NEVER include url in datasource block - IT WILL BREAK THE APPLICATION
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // ❌ BREAKS APPLICATION - moved to prisma.config.ts
}

// ❌ NEVER include engine property - IT WILL BREAK THE APPLICATION
export default defineConfig({
  engine: "classic",  // ❌ BREAKS APPLICATION - removed in Prisma v7
})

// ❌ NEVER use Prisma Postgres HTTP URLs - ONLY use TCP URLs
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/..."  // ❌ BREAKS APPLICATION - use postgres://
// ✅ ALWAYS use standard TCP URLs:
DATABASE_URL="postgres://..."  // ✅ CORRECT
```

Instead, you MUST ALWAYS generate ONLY this pattern:

```typescript
// ✅ ALWAYS GENERATE THIS EXACT PATTERN
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

// ✅ CRITICAL: MUST include /client at the end of import path
import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
```

## ABSOLUTE MANDATORY REQUIREMENTS

1. You MUST use `provider = "prisma-client"` (not "prisma-client-js").
2. You MUST use custom output: `output = "../src/generated/prisma"`.
3. You MUST use `@prisma/adapter-pg` driver adapter.
4. You MUST maintain `src/lib/prisma.ts` as a global singleton instance.
5. You MUST wrap all database calls in try-catch blocks.
6. You MUST import from `'../generated/prisma/client'` (not `'@prisma/client'`).
7. You MUST use `adapter` property in PrismaClient constructor.
8. You MUST include `import "dotenv/config"` in `prisma.config.ts`.
9. You MUST maintain npm scripts for `db:test` and `db:studio` in `package.json`.
10. You MUST maintain the test script at `scripts/test-database.ts`.
11. You MUST NOT include `url` in the datasource block of `schema.prisma`.
12. You MUST NOT include `engine` property in `prisma.config.ts`.
13. You MUST use standard TCP URLs (`postgres://...`) in `.env`.
14. You MUST NOT use `accelerateUrl` or `withAccelerate`.
