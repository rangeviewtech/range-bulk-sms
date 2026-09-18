# Enterprise Threat Model

**Project:** Range Bulk SMS Platform  
**Organization:** Range View Technology Services Uganda Limited  
**Methodology:** STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) + DREAD Risk Scoring  
**Status:** Post-Remediation Active Baseline  

---

## 1. System Decomposition & Architecture Diagram

```
                              [ Public Clients / Browsers ]
                                            │
                                            ▼ (HTTPS / TLS 1.3)
                             [ Edge Proxy / Next.js Proxy ]
                                    (src/proxy.ts)
                                  ├── Rate Limiting
                                  ├── CSRF Defense
                                  └── Session Validation
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               ▼                            ▼                            ▼
      [ Public V1 API ]            [ Internal Webhooks ]       [ Dashboard & Actions ]
    - Bearer rsms_* Auth         - HMAC SHA-256 Auth         - Signed Session Cookie
    - Scope Verification         - Fail-Closed Checking      - RBAC (hasPermission)
    - IP Whitelist Matching      - Replay Prevention         - Turnstile & MFA
               │                            │                            │
               └────────────────────────────┼────────────────────────────┘
                                            ▼
                               [ Background Queue & Sched ]
                                 - FOR UPDATE SKIP LOCKED
                                 - Atomic CAS Claiming
                                 - Outbox Pattern
                                            │
                                            ▼
                            [ Data Layer: PostgreSQL / Redis ]
```

---

## 2. STRIDE Threat Analysis Matrix

| Threat Category | Target Component | Threat Scenario | Impact | Applied Controls & Mitigations | Risk Status |
|---|---|---|---|---|---|
| **Spoofing (S)** | Public API (`/api/v1/*`) | Attacker creates fake API requests using brute-forced API keys | High | 32-char high-entropy cryptographic keys, SHA-256 hash storage, constant-time comparison (`timingSafeEqual`), IP whitelisting. | **MITIGATED** |
| **Spoofing (S)** | Inbound Payment Webhook (`/api/webhooks/payment`) | Malicious actor sends fake payment notifications to credit account balance | Critical | Enforced fail-closed HMAC-SHA256 signature verification. Missing/invalid secret rejects with 401/500 immediately. | **MITIGATED** |
| **Tampering (T)** | Wallet Deposit Endpoint (`/api/wallet/deposit`) | Authenticated client submits direct balance credit JSON payload | Critical | Restricted direct deposit to users with `wallet.manage` permission (ADMIN); enforced Zod validation schema and financial audit logging. | **MITIGATED** |
| **Tampering (T)** | Campaign & Contact APIs | User alters contact/campaign IDs in path to mutate other tenant's data | Critical | Multi-tenancy isolation strictly enforces `userId: session.userId` across all queries and group relations. | **MITIGATED** |
| **Repudiation (R)** | Administrative Actions & Balance Changes | User or admin denies performing configuration change, refund, or credit | Medium | Centralized `AuditLog` records actor ID, action type, IP address, timestamp, resource type, and before/after metadata. | **MITIGATED** |
| **Information Disclosure (I)** | API Error Responses | Stack traces or SQL errors leak internal database structure | Medium | RFC 9457 Problem Details standardizes error serialization; stack traces omitted in non-development environments. | **MITIGATED** |
| **Information Disclosure (I)** | Session Cookies | Session tokens intercepted via network sniffing or XSS | High | Cookies use `httpOnly: true`, `secure: true`, `sameSite: strict`. Screen lock PIN re-authenticates inactive sessions. | **MITIGATED** |
| **Denial of Service (D)** | Public & Auth APIs | Distributed botnet exhausts application CPU or database connections | High | Upstash Redis sliding-window limiter (5 req/15m auth, 100 req/min API) with local fallback window and Cloudflare Turnstile bot challenges. | **MITIGATED** |
| **Elevation of Privilege (E)** | RBAC & Admin Endpoints | Regular user accesses `/api/admin/*` management tools | High | `verifySession()` combined with `hasPermission(session.userId, permission)` verifies specific permission grants in database. | **MITIGATED** |

---

## 3. DREAD Risk Scoring (Key Threat Scenarios)

DREAD evaluates: **D**amage Potential (1-10), **R**eproducibility (1-10), **E**xploitability (1-10), **A**ffected Users (1-10), **D**iscoverability (1-10).

| Threat ID | Threat Description | D | R | E | A | D | DREAD Score | Post-Fix Risk |
|---|---|---|---|---|---|---|---|---|
| **THR-01** | Arbitrary balance credit via deposit endpoint | 10 | 10 | 9 | 10 | 8 | **9.4 (Critical)** | **Low (0.8)** |
| **THR-02** | Webhook signature bypass when secret unset | 10 | 8 | 8 | 10 | 6 | **8.4 (High)** | **Low (0.4)** |
| **THR-03** | Expired/Revoked API key replay attack | 7 | 8 | 7 | 6 | 6 | **6.8 (Medium)** | **Low (0.2)** |
| **THR-04** | Outbound Webhook SSRF targeting cloud metadata | 9 | 6 | 5 | 8 | 7 | **7.0 (High)** | **Low (1.0)** |
| **THR-05** | Credential brute-force against dashboard login | 8 | 8 | 6 | 5 | 8 | **7.0 (High)** | **Low (1.2)** |

---

## 4. Residual Risks & Recommended Future Hardening

1. **Egress SSRF Filtering**:
   - Ensure any user-configured outbound webhooks validate destination IPs with an explicit blocklist (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.169.254`).
2. **Upstream Next.js Version Upgrade**:
   - Next.js 16.3.2 contains GHSA-p293-qw3h-jr36 and GHSA-2xp9-vwfh-vxw4. Upgrade to Next.js 16.3.5+ as soon as verified in deployment pipeline.
