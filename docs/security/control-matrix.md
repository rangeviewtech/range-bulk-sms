# Security Control Matrix

**Project:** Range Bulk SMS Platform  
**Organization:** Range View Technology Services Uganda Limited  
**Frameworks:** OWASP ASVS 5.0.0 (Application Security Verification Standard) & OWASP API Security Top 10 (2023)  
**Verification Method:** Empirical Inspection & Automated Test Suite  

---

## 1. OWASP API Security Top 10 Control Mapping

| Risk ID | Category | Requirement & Applied Control | Code Implementation | Verification Status |
|---|---|---|---|---|
| **API1:2023** | Broken Object Level Authorization (BOLA) | Every object access must verify ownership (`userId` match) regardless of submitted ID parameters. | `src/app/api/contacts/[id]/route.ts`<br>`src/app/api/campaigns/[id]/route.ts`<br>`src/app/api/v1/sms/status/[id]/route.ts` | **VERIFIED** |
| **API2:2023** | Broken Authentication | Protect API keys and sessions. Tokens must use constant-time comparisons and enforce expiration/revocation. | `src/lib/api-keys/service.ts`<br>`src/lib/auth/session.ts`<br>`src/proxy.ts` | **VERIFIED** |
| **API3:2023** | Broken Object Property Level Authorization | Prevent mass-assignment and unauthorized field tampering using strict Zod schemas. | `src/lib/validations/sms.ts`<br>`src/lib/validations/contacts.ts`<br>`src/lib/validations/wallet.ts` | **VERIFIED** |
| **API4:2023** | Unrestricted Resource Consumption | Enforce rate limits, pagination caps, and query limits to prevent resource starvation. | `src/proxy.ts`<br>`src/lib/security/rate-limit.ts`<br>`@upstash/ratelimit` | **VERIFIED** |
| **API5:2023** | Broken Function Level Authorization | Restrict administrative operations to verified roles (`ADMIN`, `hasPermission`). | `src/lib/auth/authorization.ts`<br>`src/app/api/admin/*`<br>`src/app/api/wallet/deposit` | **VERIFIED** |
| **API6:2023** | Unrestricted Access to Sensitive Business Flows | Prevent automated abuse of balance consumption, OTP sending, and user registration. | Cloudflare Turnstile (`src/lib/auth/turnstile.ts`) + per-IP/user sliding window rate limiting. | **VERIFIED** |
| **API7:2023** | Server Side Request Forgery (SSRF) | Validate all URLs provided for webhook dispatches against private/internal IP ranges. | Webhook URL validation schema rejecting loopback and link-local ranges. | **VERIFIED** |
| **API8:2023** | Security Misconfiguration | Secure HTTP headers, fail-closed webhooks, error message sanitization. | `next.config.ts`<br>`src/app/api/webhooks/*` (fail-closed verified) | **VERIFIED** |
| **API9:2023** | Improper Inventory Management | Comprehensive, up-to-date OpenAPI 3.0 documentation of all versions and endpoints. | `src/lib/swagger.ts`<br>`src/app/api/docs/page.tsx` | **VERIFIED** |
| **API10:2023** | Unsafe Consumption of APIs | Validate third-party API responses, enforce timeouts, and use exponential backoff retries. | `AbortSignal.timeout(10_000)` in `src/lib/communications/service.ts` and `src/lib/providers/*`. | **VERIFIED** |

---

## 2. OWASP ASVS 5.0.0 Verification Matrix

| ASVS Chapter | Level | Verification Requirement | Status | Evidence |
|---|---|---|---|---|
| **V1: Architecture** | L2 | Secure architecture and trust boundaries defined | **VERIFIED** | `docs/engineering-audit.md` & `docs/security/threat-model.md` |
| **V2: Authentication** | L2 | Secure session tokens, argon2 password hashing, TOTP MFA, screen lock PIN | **VERIFIED** | `src/lib/auth/password.ts`, `src/lib/auth/mfa.ts`, `src/lib/auth/session.ts` |
| **V3: Session Mgmt** | L2 | HttpOnly, Secure, SameSite cookies; server-side session termination | **VERIFIED** | `src/lib/auth/session.ts`, `src/proxy.ts` |
| **V4: Access Control** | L2 | Least privilege RBAC enforcement on all routes and actions | **VERIFIED** | `src/lib/auth/authorization.ts`, `tests/unit/security/tenant-isolation.test.ts` |
| **V5: Validation** | L2 | Server-side input validation on all parameters via Zod schemas | **VERIFIED** | `src/lib/validations/*` |
| **V6: Cryptography** | L2 | SHA-256 key hashing, HMAC-SHA256 signatures, constant-time verification | **VERIFIED** | `src/lib/api-keys/service.ts`, `src/app/api/webhooks/payment/route.ts` |
| **V7: Error Handling** | L2 | RFC 9457 Problem Details, no sensitive stack traces exposed | **VERIFIED** | `src/lib/errors.ts`, `src/lib/swagger.ts` |
| **V8: Data Protection** | L2 | Multi-tenant database queries strictly filtered by tenant `userId` | **VERIFIED** | Prisma query verification across all services |
| **V13: API & Web Services** | L2 | API authentication tokens, OpenAPI contract, JSON schema verification | **VERIFIED** | `tests/integration/api/openapi-contract.test.ts` |
| **V14: Configuration** | L2 | Strict CSP, HSTS, X-Content-Type-Options, nosniff, frame-ancestors DENY | **VERIFIED** | `next.config.ts` |

---

## 3. Compliance Summary

- **Total ASVS Controls Evaluated:** 10 / 10 Target Domains
- **Verified Controls:** 10
- **Failed Controls:** 0
- **Not Applicable / Excluded:** 0
- **Overall Post-Remediation Compliance:** 100% of assessed enterprise baseline controls satisfied.
