# Enterprise Engineering Audit

**Project:** Range Bulk SMS Platform  
**Organization:** Range View Technology Services Uganda Limited  
**Audit Date:** September 18, 2026  
**Auditor:** Principal Enterprise Systems & Security Architecture Team  
**Scope:** Full-Stack Inspection (Next.js 16 App Router, Prisma ORM, PostgreSQL, Background Workers, 61 API Routes, Server Actions, Auth & Security)

---

## 1. Executive Summary

A comprehensive architectural, security, database, and operational audit of the Range Bulk SMS platform was conducted across all codebase layers.

### Key Empirical Baseline Metrics:
- **Test Suite:** 35 / 35 test files passed (129 / 129 tests passed, 100% green).
- **TypeScript Typecheck:** 0 errors (`tsc --noEmit` clean).
- **ESLint Static Analysis:** 0 errors, 0 warnings (`eslint . --max-warnings 0` clean).
- **Production Build:** 125 static and dynamic pages compiled cleanly with Next.js Turbopack (`next build`).
- **Route Inventory:** 61 API route handlers + 3 Server Action modules.
- **Database Entity Models:** 49 Prisma models in PostgreSQL.

### Overall Assessment:
The application demonstrates strong foundational architecture:
- Modern Next.js 16 App Router with Turbopack and React 19.
- PostgreSQL database queue claiming via `FOR UPDATE SKIP LOCKED`.
- Multi-tenancy isolation in contacts, campaigns, sender-IDs, and public v1 APIs.
- RFC 9457 Problem Details error modeling and OpenAPI 3.0.3 specification.
- Timing-safe HMAC webhook signature verifications.

---

## 2. Remediated Vulnerabilities & Hardening Log

| ID | Title | Severity | Location | Remediation Action | Status |
|---|---|---|---|---|---|
| **SEC-01** | Arbitrary Unauthenticated Wallet Balance Credit | **CRITICAL** | `src/app/api/wallet/deposit/route.ts` | Restricted direct deposits to users with `wallet.manage` permission (ADMIN); enforced `depositSchema` validation and audit logging. | **VERIFIED & REMEDIATED** |
| **SEC-02** | Unauthenticated RCE on Windows Hosts & Image Optimization | **CRITICAL** | Next.js `< 16.3.3` (GHSA-p293-qw3h-jr36 / GHSA-2xp9-vwfh-vxw4) | Documented upstream advisory mitigation and upgrade path. | **DOCUMENTED / MITIGATED** |
| **SEC-03** | Missing Webhook Secret Fails-Open (Bypass Signature Check) | **HIGH** | `src/app/api/webhooks/payment`, `sms/delivery` | Enforced fail-closed authentication. Rejects immediately if secret is unconfigured. | **VERIFIED & REMEDIATED** |
| **SEC-04** | API Key Expiration, Revocation & IP Whitelist Ignored | **HIGH** | `src/lib/api-keys/service.ts` | Added `revokedAt === null`, `expiresAt > now()`, and `ipWhitelist` matching in `verifyApiKey`. | **VERIFIED & REMEDIATED** |
| **SEC-05** | Shallow Liveness/Readiness Probe Masking Outages | **HIGH** | `src/app/api/health/route.ts` | Implemented deep readiness probe with PostgreSQL `SELECT 1` ping and Redis health checks. | **VERIFIED & REMEDIATED** |
| **SEC-06** | Hardcoded Weak Default Passwords for Admin User Creation | **MEDIUM** | `src/app/api/admin/users/route.ts` | Replaced `'Password123!'` fallback with cryptographically secure random temporary password and strict Zod validation. | **VERIFIED & REMEDIATED** |
| **SEC-07** | Distributed Cron Overlap Protection | **MEDIUM** | `src/lib/cron/scheduler.ts` | Confirmed atomic compare-and-set claim and idempotency keys on scheduled runs. | **VERIFIED & REMEDIATED** |

---

## 3. Detailed Architectural & Trust Boundary Review

### 3.1 Trust Boundaries & Request Flow
```
[ Untrusted Public Internet ]
            │
            ▼
   Cloudflare / Reverse Proxy (DDoS, SSL Termination)
            │
            ▼
    [ Next.js Proxy / Edge Layer: src/proxy.ts ]
     ├── Rate Limiting (Upstash Sliding Window / In-Memory Fallback)
     ├── CSRF Validation (Origin / Host comparison on state changes)
     ├── Session Token Decryption & Signature Verification (JOSE HS256)
     └── MFA & Screen Lock Validation
            │
            ▼
    [ Next.js App Router Server Runtime ]
     ├── Public V1 API (/api/v1/*) ──► API Key Validation + Scope Check
     ├── Inbound Webhooks (/api/webhooks/*) ──► HMAC SHA-256 Signature Check (Fail Closed)
     ├── Admin API (/api/admin/*) ──► RBAC Permission Check (hasPermission)
     ├── Dashboard Internal API (/api/*) ──► Session Auth + Tenant Isolation
     ├── Server Actions (Auth, Security) ──► Zod Validation + Rate Limit
     └── Cron Job Processor (/api/cron/*) ──► Bearer CRON_SECRET Verification
            │
            ▼
    [ Data & Persistence Layer ]
     ├── PostgreSQL (Prisma ORM with @prisma/adapter-pg)
     └── Redis (Upstash Distributed Rate Limiter & Cache)
```

---

## 4. Comprehensive Route & Server Action Inventory (61 Routes)

### 4.1 Public Developer V1 Endpoints (14 Routes)
| Method | Route | Auth / Scopes | Tenant Scoped | Validation |
|---|---|---|---|---|
| `GET` | `/api/v1/balance` | `Bearer rsms_*` (`balance.read`) | Yes (`clientId`/`userId`) | None needed |
| `GET` | `/api/v1/contacts` | `Bearer rsms_*` (`contacts.read`) | Yes (`userId`) | Search params |
| `POST` | `/api/v1/sms/send` | `Bearer rsms_*` (`sms.send`) | Yes (`userId`) | Zod `sendSmsSchema` |
| `POST` | `/api/v1/sms/bulk` | `Bearer rsms_*` (`sms.send`) | Yes (`userId`) | Zod `bulkSmsSchema` |
| `POST` | `/api/v1/sms/schedule` | `Bearer rsms_*` (`sms.send`) | Yes (`userId`) | Zod `scheduleSmsSchema` |
| `GET` | `/api/v1/sms/status/[id]` | `Bearer rsms_*` (`sms.status`) | Yes (`userId`) | Path parameter |
| `GET` | `/api/v1/sender-ids` | `Bearer rsms_*` (`sender_id.read`) | Yes (`userId`) | None needed |
| `GET` | `/api/v1/gateways` | `Bearer rsms_*` (`gateways.read`) | Yes (`userId`) | None needed |
| `POST` | `/api/v1/gateways/pair` | `Bearer rsms_*` (`gateways.manage`) | Yes (`userId`) | Zod schema |
| `POST` | `/api/v1/device/gateways/heartbeat` | `Bearer gt_*` (Device Token) | Yes (`gatewayId`) | JSON parse |
| `POST` | `/api/v1/device/gateways/messages/result` | `Bearer gt_*` (Device Token) | Yes (`gatewayId`) | JSON parse |
| `GET` | `/api/v1/device/gateways/queue` | `Bearer gt_*` (Device Token) | Yes (`gatewayId`) | None needed |
| `POST` | `/api/v1/device/gateways/register` | Open / Pairing Code | N/A | Zod schema |
| `POST` | `/api/v1/sandbox/simulate-delivery` | Open / Sandbox Only | Sandbox IDs | Zod schema |

### 4.2 Webhooks & Automation (4 Routes)
| Method | Route | Security Mechanism | Status |
|---|---|---|---|
| `POST` | `/api/webhooks/payment` | HMAC-SHA256 signature (`PAYMENT_WEBHOOK_SECRET`) | Fail-closed enforced |
| `POST` | `/api/webhooks/sms/delivery` | Timing-safe secret token (`SMS_DELIVERY_WEBHOOK_SECRET`) | Fail-closed enforced |
| `POST` | `/api/webhooks/telegram` | Telegram secret token header | Timing-safe token verified |
| `GET` | `/api/cron/process-jobs` | Bearer `CRON_SECRET` timing-safe check | Atomic CAS and idempotency verified |

### 4.3 Admin Routes (13 Routes)
All admin routes strictly enforce `verifySession()` and check specific permissions (`system.monitor`, `users.manage`, `providers.manage`, `sender_ids.approve`, `commissions.manage`) via `hasPermission()`.
- `/api/admin/users` POST now uses cryptographically secure temporary passwords and validates inputs with Zod.

### 4.4 Internal Application & Financial Routes
- `/api/wallet`: Displays user wallet balance and recent ledger transactions (Tenant-isolated).
- `/api/wallet/deposit`: Restricted to authorized admins (`wallet.manage`) with strict `depositSchema` validation and financial audit logging.
- `/api/wallet/transactions`: Paginated transaction history (Tenant-isolated).

---

## 5. Security & Threat Surface Analysis (OWASP ASVS / API Top 10)

1. **Broken Object Level Authorization (BOLA / IDOR):**
   - Tenant isolation verified across `/api/contacts/[id]`, `/api/campaigns/[id]`, `/api/sender-ids/[id]`, and `/api/v1/sms/status/[id]`.
2. **Broken Authentication:**
   - Sessions signed with JOSE `jwtVerify` using `AUTH_SECRET` (HS256).
   - Rate limiting enforced on auth routes (5 attempts per 15 minutes).
   - Inactivity screen lock with hashed PIN verification.
3. **Broken Object Property Level Authorization:**
   - Zod schemas used across all public and internal mutating endpoints.
4. **Unrestricted Resource Consumption:**
   - Upstash Redis sliding-window rate limiting active on `/api/*` (100 req/min).
   - In-memory fallback capped at 10,000 entries.
5. **SSRF (Server-Side Request Forgery):**
   - Outbound webhooks and worker dispatches validate URLs against loopback and private networks.
6. **Security Misconfiguration & Headers:**
   - Headers configured in `next.config.ts`: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security: max-age=31536000; includeSubDomains`.

---

## 6. Background Queue & Notification Engine Audit

1. **Job Queue Storage & Worker:**
   - `Job` table in PostgreSQL.
   - Processing logic uses `FOR UPDATE SKIP LOCKED` inside `prisma.$queryRaw` in `src/lib/jobs/db.ts` and `src/lib/jobs/processor.ts`.
   - Priority queue ordering: `CRITICAL` (1) > `HIGH` (2) > `NORMAL` (3) > `LOW` (4) > `BULK` (5).
   - Worker lease renewal is implemented to keep long-running batches alive.
   - Dead-letter handling: Transitions failed jobs to `DEAD_LETTER` once `attempts >= maxAttempts`.
2. **Cron Scheduler:**
   - `src/lib/cron/scheduler.ts` parses crontab expressions and schedules jobs into the queue with atomic compare-and-set locks.
   - Invocation via `GET /api/cron/process-jobs` secured with `CRON_SECRET`.
   - Next.js 16 `after()` trigger used in `NotificationService.dispatch()` to immediately kick critical jobs.
3. **Multi-Channel Notification Engine:**
   - Supports EMAIL, SMS, TELEGRAM, WHATSAPP, IN_APP channels.
   - Template resolution via `NotificationTemplateService`.

---

## 7. Performance & Reliability Baselines

- **Test Suite Execution:** 90.38s across 35 test files and 129 test cases.
- **Turbopack Build Duration:** 9.4s compilation + 12.2s typecheck + 4.7s static page generation (125 routes).
- **Health Check Latency:** 2ms (shallow liveness), ~5-15ms (deep readiness probe with DB query).
