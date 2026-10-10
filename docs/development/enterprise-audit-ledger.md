# Enterprise application audit ledger

Updated: 2026-10-08

This is the working evidence ledger for the current repository review. Findings
are tied to source evidence; an empty cell means the audit step is pending, not
that the control passed. Generated and vendor output is inventoried separately
from maintained source.

## Repository baseline

| Area | Current evidence |
| --- | --- |
| Repository | Single Git repository; branch `feat/unified-ui-responsive-design-system`; initial worktree clean. |
| Package manager | npm; `package-lock.json`; no workspace/monorepo declaration in `package.json`. |
| Runtime | Node.js v24.18.1 in the audit environment. |
| Framework baseline (rechecked 2026-10-08) | Next.js 16.3.8 App Router; React/React DOM 19.2.8; TypeScript 5.9.3; Prisma CLI/client 7.10.0; Tailwind 4.3.3 installed. The earlier note below about the incomplete Next 16.3.5 install is historical and superseded. |
| Database | PostgreSQL through Prisma ORM 7.10.0 and `@prisma/adapter-pg`; schema at `prisma/schema.prisma`; generated client under `src/generated/prisma`. |
| UI | React, Tailwind CSS 4, Radix primitives, local design-system and shared UI modules. |
| Validation | Zod 3, React Hook Form and `@hookform/resolvers`. |
| Tests | Vitest 4, Testing Library, Playwright 1.62, axe-core. Both `src/__tests__` and `tests/` are present. |
| Integrations visible in manifests/source inventory | Upstash Redis/ratelimit, Nodemailer, Google GenAI, Turnstile, Telegram, WhatsApp, SMS providers, payment and device gateway webhooks. Full credential-free inventory pending. |
| Browser verification | Chrome DevTools MCP tools are not exposed. Playwright E2E was retried against a manually started Next dev server after its default webServer startup timed out; result is recorded in the 2026-10-08 revalidation section. The login screen was inspected in the Codex in-app browser. |
| Generated/vendor output | `node_modules`, `.next`, `src/generated/prisma`, `tsconfig.tsbuildinfo`, and `playwright-report` are generated/vendor or report output; excluded from manual source review. |

## File and module inventory

The repository root contains application source, Prisma schema and seed, public
assets, docs, scripts, tests, CI, Docker Compose, and tool configuration. The
maintained `src/` module map is:

| Module | Observed responsibility |
| --- | --- |
| `src/app` | Next App Router pages, layouts, loading/error boundaries, API Route Handlers and server actions. |
| `src/components` | Shared application, navigation, form, table, SMS, contacts, PWA and UI components. |
| `src/config`, `src/constants`, `src/types`, `src/schemas` | Configuration, shared constants, TypeScript contracts and validation schemas. |
| `src/design-system`, `src/styles` | Design-system components/tokens and global or integration CSS. |
| `src/features`, `src/hooks`, `src/providers` | Feature modules, client hooks and React context providers. |
| `src/lib` | Auth, Prisma, billing/wallet, communications, gateways, validation and domain utilities. |
| `src/services`, `src/utils` | Service abstractions and general helpers. |
| `src/workers` | Queue processing entry point(s). |
| `src/generated` | Generated Prisma Client output; excluded from hand review. |
| `prisma` | Database schema and seed; migration inventory to verify. |
| `public` | Static logos, icons, PWA assets, sample contact files and other static resources; binary sizes/usage to verify. |
| `docs` | Architecture, security, UI, responsive, engineering and operational documents; reconcile claims with current source. |
| `tests`, `src/__tests__` | Unit, integration, component, API/security and browser tests; inventory/count and coverage to verify. |
| `.github`, root config files | CI and GitHub templates, Next, TypeScript, ESLint, Playwright, Vitest, Prisma, Tailwind/PostCSS and formatting configuration. |
| `node_modules`, `.next`, `playwright-report` | Vendor, build output and generated test report; classified, not line-reviewed. |

Current Git index inventory: **1,296 tracked paths** in the web repository,
64 in mobile, 70 in the Android gateway, and 30 in firmware. These counts
include documentation, configuration, scripts, tests, and generated client
files; vendor/build output remains separately classified and was not reviewed
line by line. Per-path classification and full source review remain pending.

## Routes, APIs, and actions

The application uses the App Router. Product route families observed under
`src/app` include public/legal and design-system pages, auth and MFA flows,
dashboard, SMS campaigns/send/schedule/drafts/templates/reports, contacts and
imports/groups/segments, wallet/billing/reports, sender IDs, gateways, settings,
developer/API-key/webhook pages, support, agent views, and admin user/provider/
pricing/communications/audit pages. Dynamic segments include contact IDs,
campaign IDs, API keys, webhooks, and nested device/gateway resources.

API Route Handler families observed include `/api/auth`, `/api/v1`, `/api/sms`,
`/api/contacts`, `/api/campaigns`, `/api/admin`, `/api/agent`, `/api/developer`,
`/api/reports`, `/api/support`, `/api/cron`, `/api/webhooks`, `/api/health`,
`/api/geo`, `/api/variables`, and `/api/ai`. The previous generated manifest in
`docs/development/audit-inventory/` recorded 84 page files and 110 API Route
Handler files. A fresh source count found 84 page files and 119 API Route
Handler files; regenerate the manifest and review every handler's guard,
validation, ownership, rate-limit, and business-rule behavior. Existing guard
and validation columns are lexical screening only.

Server-action files found by source search:

- `src/app/(auth)/actions.ts`
- `src/app/(dashboard)/settings/security/actions.ts`
- `src/app/(dashboard)/settings/notifications/page.tsx`
- `src/app/actions/wallet.ts`

Every entry point must be checked for runtime validation, authentication,
authorization, ownership/tenant checks, safe error behavior, and cache
invalidation. Detailed route/action review is pending.

## Data, identity, and security architecture

- Prisma schema contains identity/session/role tables (`User`, `Session`,
  `UserDevice`, `Authenticator`, `VerificationToken`, `Role`, `Permission`,
  `UserRole`, `RolePermission`), audit/operations (`AuditLog`, `Job`,
  `CommunicationLog`, `ProviderHealth`, `OtpRecord`,
  `TelegramLinkingToken`, notification preference/template/record,
  `ScheduledJob`, `CronExecution`), customer/contact/campaign data
  (`Organization`, `Client`, `Agent`, `Contact`, contact group/member/tag/
  assignment/segment/import, `SenderId`, `SmsTemplate`, `Campaign`,
  `CampaignGroup`, `Message`, `MessageRecipient`), telecom/billing/developer
  data (`SmsProvider`, `ProviderRoute`, `Wallet`, `Transaction`, `SmsPricing`,
  `Commission`, `CommissionRule`, `ApiKey`, `ApiRequest`, `Webhook`,
  `WebhookDelivery`, support ticket/message, `ScheduledMessage`), gateway data
  (`Gateway`, `GatewayDevice`, `GatewayToken`, `GatewayLog`, `MessageAttempt`),
  consent (`ConsentLog`, `SmsDraft`), and numbering/coverage data (`Region`,
  `CallingCodeAssignment`, `NumberingMetadataVersion`, `Operator`,
  `Allocation`, `ProviderObservation`, `CoverageAudit`, `CustomVariable`).
  The schema also defines explicit lifecycle/status enums for users, jobs,
  organizations/clients/agents, sender IDs, campaigns/messages, transactions/
  commissions, API keys/webhooks/support, gateways/message attempts and consent.
  Referential and index-by-index audit remains open.
- Seeded database roles are `ADMIN`, `USER`, `CLIENT`, and `AGENT`; the admin
  user API also accepts `MANAGER` and `VIEWER`, which are not created by the
  seed. The API now fails closed when such a requested role is absent. The
  separate `src/config/permissions.ts` map uses lowercase `admin`, `manager`,
  `user`, `viewer` and has no observed runtime consumer; DB-backed checks are
  used by Route Handlers.
- Auth-related modules include session, edge-session, preauth and device
  authentication, WebAuthn endpoints, OTP, 2FA/MFA, password recovery, and
  session heartbeat/logout APIs. Exact state transitions/cookie policy pending.
- The mobile client calls `/api/v1/auth/login` with email/password. It now
  evaluates `getEffectiveMfaRequirement` before creating a session. Required MFA
  creates a short-lived, one-use database-backed challenge; the full 30-day
  `mfaVerified: true` session is issued only after OTP or TOTP success. Mobile
  supports APP/TOTP and configured email, SMS, WhatsApp, or Telegram OTP. A
  passkey-only account fails closed with a clear message because the mobile app
  does not implement WebAuthn yet. User approved requiring MFA for MFA-enabled
  accounts and privileged roles on mobile.
- Device gateways use registration, queue, message-result/incoming,
  heartbeat, and firmware-check endpoints; authenticate those separately from
  end-user sessions.
- Proxy CSRF exemptions cover webhooks and cron. Versioned `/api/v1/*` routes
  include session-authenticated wallet and gateway handlers as well as API-key
  endpoints; the blanket v1 exemption was removed so browser-origin requests
  receive the same origin check. Server-to-server requests without `Origin` or
  `Referer` remain allowed. Regression coverage was added but is pending because
  another package installation is active.
- External communication paths include SMS, Telegram, WhatsApp, email, and
  payment webhooks. Signature, replay, timeout, retry and idempotency checks
  pending.
- CSP and browser security headers are configured in `next.config.ts`; policy
  compatibility with runtime assets and production deployment remains pending.
- `.env.example` names `NODE_ENV`, `APP_URL`, `NEXT_PUBLIC_APP_URL`,
  `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_SHORT_NAME`,
  `NEXT_PUBLIC_APP_DESCRIPTION`, `DATABASE_URL`, `POSTGRES_USER`,
  `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`, `AUTH_SECRET`,
  `PAYLOAD_ENCRYPTION_KEY`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`,
  `EMAIL_PROVIDER`, `EMAIL_FROM`, `CRON_SECRET`, `SMTP_HOST`, `SMTP_PORT`,
  `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`,
  `PANDORA_SMS_USERNAME`, `PANDORA_SMS_PASSWORD`, `PANDORA_SMS_SENDER_ID`,
  `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `WHATSAPP_ACCESS_TOKEN`,
  `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_TEMPLATE_LANGUAGE`, `OTP_LENGTH`,
  `OTP_TTL_SECONDS`, `OTP_MAX_ATTEMPTS`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`,
  `TURNSTILE_SECRET_KEY`, `UPSTASH_REDIS_REST_URL`,
  `UPSTASH_REDIS_REST_TOKEN`, and `TELEGRAM_BOT_USERNAME`. Values
  are intentionally excluded. `src/config/env.ts` validates only a subset and
  has no observed runtime import, so validation is not currently a reliable
  startup boundary. A static reference manifest lists 86 direct
  `process.env.NAME` references from `src`, `prisma`, and `next.config.ts`, with
  source file/line, public vs server classification, and `.env.example`
  presence. 52 referenced names are absent from `.env.example`; 7 documented
  names have no direct property reference in that scan. Computed property reads,
  provider-specific defaults, and deployment secrets still need review.

## UI, accessibility, and assets

Existing inventories are in `docs/ui-audit/`, `docs/design-system/`, and
`docs/RESPONSIVE_UI_AUDIT.md`; reconcile with current component imports and
pages. Shared tables/forms/dialogs, responsive states, theme coverage, reduced
motion, keyboard use, semantic labels and axe/browser results are pending.
`public/` contains brand assets, SVG/PNG/JPEG images, favicons/PWA icons, app
store badges, QR code, sample CSV/XLSX, web manifest and service worker. Exact
file sizes, consumers, cache policy and unused assets are pending.

## Baseline verification ledger

Captured before source changes (initial state was clean):

| Check | Result |
| --- | --- |
| `npm run typecheck` | Baseline attempt exceeded 10 minutes without a result and was interrupted; not verified. |
| `npm run lint` | Baseline attempt exceeded 10 minutes without a result and was interrupted; not verified. |
| `npm run test:run` | 41 files and 388 tests passed, but Vitest reported 7 unhandled worker startup timeouts and a native config-loader warning; suite result is incomplete. |
| `npm audit --audit-level=high` | Failed: 9 vulnerabilities (1 critical, 6 high, 2 moderate); includes Next.js, Nodemailer, `braces`, and `fast-uri`. Full output recorded in session; remediation and version compatibility pending. |
| `npm run build` | Not started yet. |
| Browser/runtime | Chrome DevTools MCP unavailable. The existing server was not healthy at inspection: Next 16.3.5 overlay reports unresolved `../route-cache-key`; browser console also contains build errors. |

## Verification after changes

| Check | Result |
| --- | --- |
| Targeted Vitest | Privacy/session/admin hardening: 3 files / 13 tests passed. The 9 files that failed in the full run were rerun together after corrections: 8 files / 73 tests passed; the remaining security suite passed separately (17/17). |
| Full Vitest | 102 files discovered; 93 passed, 9 failed; 652/670 tests passed before correcting stale expectations, one import path and test timeouts. The affected files passed targeted reruns after those corrections. The entire suite has not been rerun after the corrections. |
| ESLint | Explicitly changed API/auth/privacy/test files passed targeted ESLint with `--max-warnings 0` before the incomplete install state. A later wider changed-file lint attempt failed to load `next/dist/compiled/babel-packages` from the inconsistent `node_modules`. Package-wide lint remains unverified. |
| TypeScript | Post-change `npm run typecheck` produced no diagnostics for over two minutes and was interrupted; baseline also exceeded ten minutes. Not verified. |
| Dependency audit | Updated lockfile audit reports five high findings, all through `braces → micromatch → fast-glob → @next/eslint-plugin-next → eslint-config-next`; `braces` has no patched release listed. The earlier critical Next, Nodemailer and `fast-uri` findings were removed from the lockfile audit. Install verification remains blocked. |
| Dependency install | `npm install --ignore-scripts` first failed with `EBUSY` on the Next SWC native binary. The affected port-3000 dev-server process tree was stopped to release its file handles after browser inspection showed it was already failing; a subsequent install attempt stalled. Other `npm install` processes were then found running concurrently (including a generic install and an install for existing packages), so the audit's install was canceled to avoid racing them. `node_modules/.bin/next` is absent and the installed Next 16.3.5 package is incomplete; wait for the other installs to finish before repairing. |
| Mobile TypeScript | `npx tsc --noEmit` completed with exit code 0 after the MFA client changes. |
| Mobile lint | `npx expo lint` could not load ESLint because installed `node_modules/array-includes` requires missing `es-abstract/2025/ToIntegerOrInfinity`; dependency tree repair is needed before interpreting this as a source lint result. |
| Playwright | E2E startup failed because `next` was not recognized from the configured `npm run dev` command. No Playwright browser assertions were completed. |
| Browser inspection | Codex in-app browser opened `/login`; it showed the runtime build error and console stack for missing Next internal module `route-cache-key`. This is direct runtime evidence, not a healthy application verification. |
| `git diff --check` | Passed; only line-ending normalization warnings were reported. |

## Findings ledger

| ID | Severity | Area | Evidence / impact | Status |
| --- | --- | --- | --- | --- |
| F-001 | Critical | Supply chain | Installed Next.js `16.3.5` was in multiple advisory ranges. Manifest and lockfile now request `16.3.8`, which includes fixes for the relevant RCE, SSRF, cache and information disclosure advisories. The installed package remains `16.3.5`; dependency installation did not complete and the browser shows the installed package is incomplete. | Partially addressed; installation and production verification blocked |
| F-002 | High | Supply chain | Nodemailer manifest/lockfile updated from v9 to v10.0.16 to address reported advisories. Install and integration verification remain pending. `braces` remains affected in the ESLint dependency chain and has no patched release listed. | Partially addressed |
| F-003 | Moderate | Supply chain | `fast-uri` override updated from 3.1.7 to 3.1.8; post-lock audit no longer reports this finding. | Addressed in lockfile; installation pending |
| F-004 | Medium | TypeScript | `tsconfig.json` sets `strict: true` while disabling `strictNullChecks` and `noImplicitAny`; the effective type safety is materially weaker than the `strict` label suggests. Typecheck baseline and migration impact pending. | Open |
| F-005 | Medium | Testing/config | CI and default scripts selected `vitest.config.ts`, running only `src/__tests__` with unrestricted worker count. Scripts now select `.mts`, which includes both test roots with workers capped at 2; duplicate `.ts` config removed. First full run exposed 18 failures in 9 files; all affected files passed targeted reruns after correcting stale tests/import paths, but the complete suite was not rerun. | Partially verified |
| F-006 | Medium | API | Source has roughly 100 Route Handlers across many domains; endpoint-by-endpoint guard, validation, ownership and rate-limit inventory pending. | Open |
| F-007 | High | Session authorization | 27 APIs that directly called `verifySession()` now use `verifyAuthenticatedSession()`, which rejects pre-MFA and screen-locked sessions. `verifySession()` now trusts the database MFA state, not the cookie claim. Targeted session/admin tests passed; full post-change suite not rerun. | Implemented; targeted tests pass |
| F-008 | High | Privacy consent | Per user direction, privacy requests require a complete signed-in session and any submitted email must match that account. Consent revocation targets only that user's contacts and records the audit entry and update in one transaction. Regression tests passed. | Implemented; targeted tests pass |
| F-009 | Medium | API error handling | Admin user API now returns generic errors and logs only the error type instead of returning raw exception messages. Targeted admin-user tests and ESLint passed. | Implemented; targeted checks pass |
| F-010 | Medium | TypeScript/config | `src/config/permissions.ts` has a separate static role map (`admin`, `manager`, `user`, `viewer`) from the persisted roles used by API guards; confirm consumers and role mapping before attempting consolidation. | Open |
| F-011 | Medium | User administration | Seed creates only `ADMIN`, `USER`, `CLIENT`, `AGENT`, but admin user creation accepted `MANAGER` and `VIEWER` and silently created a roleless account if the database did not contain them. The API now fails closed; the regression test passed. | Implemented; targeted tests pass |
| F-012 | Medium | Environment configuration | `src/config/env.ts` validates a limited variable subset but has no observed runtime imports; the `.env.example` defines many integration secrets and settings outside that schema. | Open |
| F-013 | Medium | Role-aware navigation | The role destination helper contradicted its own documented route hierarchy and tests, routing ADMIN to `/admin`, AGENT to `/agent`, and other roles to `/client`. Updated destinations to `/admin/system`, `/agent/dashboard`, and `/dashboard`; unit and guest-guard suites pass. | Implemented; targeted tests pass |
| F-014 | Low | Test drift | The expanded suite exposed stale UI class and date-format assertions, an obsolete wallet API import, and default-timeout assumptions. Updated the tests to match current implementation/API paths and added time for slow setup. Affected files passed targeted reruns. | Implemented; targeted tests pass |
| F-015 | High | CSRF | `src/proxy.ts` exempted every `/api/v1/*` request from Origin/Referer checks, including endpoints authenticated by the browser session cookie (`/api/v1/wallet`, gateway routes, and `/api/v1/wallet/deposit`). Removed this blanket exemption; webhook and cron exemptions remain. Added cross-origin rejection and no-Origin server-to-server regression cases. | Implemented; test pending |
| F-016 | Medium | Environment configuration | Static scan found 86 directly referenced environment variable names, of which 52 are absent from `.env.example`; 7 example entries have no direct property access. This includes public branding/assets, database pool controls, provider credentials, webhook secrets, worker tuning and logging. `src/config/env.ts` does not validate most names and is not imported. | Inventory recorded; required/optional semantics and deployment reconciliation pending |
| F-017 | High | Mobile authentication/MFA | Password-only mobile login previously issued a full 30-day session with `mfaVerified: true`, bypassing the app's effective MFA policy. The web login endpoint now issues a five-minute challenge for required MFA and creates a full session only after OTP/TOTP verification. The sibling Expo client now stores the challenge in SecureStore, verifies it through API endpoints, and routes to an MFA screen. It does not support WebAuthn; passkey-only access is denied rather than downgraded. The old fabricated ADMIN demo login fallback was removed. | Implemented; mobile typecheck passed; web checks pending due incomplete dependencies; mobile lint blocked by damaged installed dependency tree |
| F-018 | Medium | Login abuse / information exposure | Mobile login rate limiting keys on client-supplied forwarded IP and the endpoint returns distinct 403 for inactive accounts while invalid credentials return 401. Proxy trust and whether account-status disclosure is acceptable require deployment/product context. | Open |

## Change ledger

| Change | Files / scope | Reason | Verification |
| --- | --- | --- | --- |
| Added full-auth session verifier and applied to 27 sensitive APIs; database MFA state is authoritative. | `src/lib/auth/session.ts`, affected `/api/admin`, `/api/agent`, `/api/reports`, `/api/support`, `/api/v1/wallet`, `/api/v1/gateways` handlers. | Prevent API access during MFA challenge or screen lock. | Targeted session/admin tests passed. |
| Restricted privacy requests and made consent revocation transactional and account scoped. | `src/app/api/user/privacy/route.ts`, `src/__tests__/privacy-api.test.ts`. | Enforce the selected identity policy and avoid cross-account consent changes / partial audit writes. | Targeted regression tests passed. |
| Replaced raw admin user failure messages with generic client errors and rejected unavailable roles. | `src/app/api/admin/users/route.ts`, `tests/integration/api/admin-users-hardening.test.ts`. | Avoid internal exception detail leakage and roleless accounts. | Targeted tests and ESLint passed. |
| Updated vulnerable dependency declarations and aligned test scripts to the broader, worker-limited config. | `package.json`, `package-lock.json`; removed `vitest.config.ts`. | Patch reported advisories and make CI run the configured suite with bounded workers. | Lockfile audit improved; install is incomplete, so runtime verification is blocked. |
| Corrected role landing routes and stale test expectations/timeouts. | `src/lib/auth/destination.ts`, affected unit/integration tests. | Align actual routing with the helper's stated role hierarchy and keep tests consistent with implemented UI/API contracts. | All affected test files passed targeted runs. |
| Applied Origin/Referer checks to versioned API endpoints that can use session cookies. | `src/proxy.ts`, `tests/integration/auth/guest-guard.test.ts`. | Close blanket CSRF bypass for session-authenticated v1 operations while preserving requests without browser origin headers. | Regression test added; execution pending while dependency installation is active. |
| Required MFA for mobile sign-ins under the central policy, added one-use server-side challenge verification/resend endpoints and a mobile code-entry screen, and removed the fake privileged demo fallback. | Web `src/lib/auth/mobile-mfa.ts`, `/api/v1/auth/login`, `/api/v1/auth/mfa/*`; mobile `lib/api.ts`, `app/(auth)/login.tsx`, `app/(auth)/mfa.tsx`. | Prevent password-only session issuance for MFA-enabled and privileged accounts while giving the mobile app a supported OTP/TOTP flow. | Mobile TypeScript passed; web typecheck pending; Expo lint blocked by missing installed transitive module; no end-to-end/browser run yet. |
| Created audit ledger and route, page, and environment-name manifests. | `docs/development/enterprise-audit-ledger.md`, `docs/development/audit-inventory/*`. | Preserve findings and scope. | Inventory generation complete; line-by-line review remains incomplete. |

## Pending audit work

1. Complete release verification for the sibling Expo app and production
   deployment. Web TypeScript, package-wide lint, production build, and the
   complete web suite passed on 2026-10-08; the mobile package's release build
   and deployed journeys still need verification.
2. Complete Git-index classification and reconcile page/API/action manifests;
   current route inventory is generated, but guard markers are lexical only.
3. Trace every API/action and high-risk financial, SMS, webhook, import, and
   gateway flow; audit Prisma indexes, migrations, ownership and tenant rules.
4. Reconcile auth/RBAC, external integrations, remaining env validation, asset
   usage, responsive behavior, accessibility, and non-Redis deployment docs
   against the current source. These areas are not yet exhaustively reviewed.
5. Web full-suite verification passed 103 files and 676 tests on 2026-10-08;
   that run preceded the final health-path proxy exclusion. The post-exclusion
   guard suite passed 17 tests; rerun the full suite before release.
6. Exercise the complete mobile MFA journey (password -> OTP/TOTP -> session),
   OTP resend and attempt limits, expired/replayed challenges, MFA-disabled
   login, and passkey-only denial against a running web service and test database.

## Continuation update (2026-10-08)

- Web TypeScript completed after the dynamic route parameter, mobile MFA narrowing,
  and lint-cleanup typing fixes. Final result: `npx tsc --noEmit` passed.
- A package-wide ESLint pass did not complete within the available session and
  was stopped. The prior machine-readable lint report had 44 errors and 17
  warnings. Follow-up edits address unused variables, unsafe `any`, JSX escaping,
  render-time random values/ref mutation, and a live-looking example API key;
  final targeted lint is still running and no zero-warning result is confirmed.
- Mobile dependency installation first identified a React/React DOM lockfile
  mismatch. `expo install react-dom` aligned both to 19.2.3, then `npm ci` was
  started to repair a missing `es-abstract/2025/ToIntegerOrInfinity` file. It
  has not completed yet. `npm ci` previously reported 36 mobile dependency
  vulnerabilities (14 moderate, 22 high); a clean post-install audit is pending.
- Mobile TypeScript passed after the MFA client additions. Mobile lint still
  failed before the dependency reinstall because the installed transitive module
  was missing. After a clean install, `npx tsc --noEmit` and `npm run lint` both
  pass. `expo lint` itself targets a nonexistent `components` directory in this
  repo, so the mobile package lint script now invokes ESLint over the repository.
- The full web suite now passes after all latest edits: 102 files and 675 tests
  (`npm run test:run`, 292.96 seconds). This includes the MFA, privacy, CSRF,
  generator, UI image, and gateway response-helper changes. A production build
  is still unverified.
- The initial mobile dependency audit reported 36 findings (14 moderate, 22 high), rooted
  in `braces`, `node-forge`, `decode-uri-component`, `postcss-selector-parser`,
  and `uuid` through Expo/Metro/Tailwind dependency chains. `npm audit fix
  --dry-run` showed that the forced fix would downgrade Expo/Tailwind to major
  incompatible versions. A non-forcing `npm audit fix` updated 23 Expo/Metro
  patch-level dependencies and reduced the report to 35 findings (14 moderate,
  21 high). Remaining findings are unresolved in the current framework chain;
  mobile typecheck and lint both pass after those safe patch updates.
- Agent-browser remained unresponsive (Windows connection timeout), and Chrome
  DevTools MCP was not available in this session. No healthy route, auth, mobile
  MFA, accessibility, or responsive browser verification is confirmed.
- The official Codex Security deep scan cannot start in this session because its
  read-only worker requires a managed filesystem permission profile. The
  current session reports unrestricted filesystem access. The scan must not be
  retried from this task; a supported managed-permission session is required.
- Targeted ESLint over the changed web routes, homepage, webhook and affected UI
  components passed with `--max-warnings 0` after the cleanup.
- The final package-wide web lint now passes with `--max-warnings 0` after fixing
  the remaining generator-script imports and responsive image components. A final
  `npx tsc --noEmit` also passes after those edits.
- Web `npm audit --audit-level=high` remains blocked by five high findings from
  the `braces → micromatch → fast-glob → @next/eslint-plugin-next → eslint-config-next`
  dependency chain. The reported forced fix would downgrade `eslint-config-next`
  to v14, so it was not applied.
- Additional lint cleanup modified shared decorative UI components and changed
  the homepage's sample Authorization value to `YOUR_API_KEY`; web typecheck and
  full package lint now pass.

## Redis coverage audit and update (2026-10-08)

### Redis architecture and coverage

- The application uses `@upstash/redis` over Upstash REST. `REDIS_URL` was listed
  as an optional setting but was never consumed; a plain `redis://` TCP URL from
  the optional Docker Compose Redis service is not a supported application
  connection. The unused variable was removed from the example and validation
  schema, and Compose now labels its Redis container as standalone tooling.
- Shared Redis rate limiting covers the Next.js API proxy, auth/server actions,
  mobile password/MFA endpoints, and the API-key-specific `/api/v1/messages`
  quota. SMS message/queue idempotency and worker coordination use atomic
  Redis locks; the durable queue and billing idempotency records remain in
  PostgreSQL. Read caching is limited to public pricing, the authenticated
  user's SMS report (keyed by user and timezone), and that user's delivery
  metrics. User-owned report cache keys include the user ID.
- The reports and pricing cache-aside paths retain bounded process-local
  fallback for reads if Redis fails. Security rate limits and distributed locks
  no longer claim that local memory is shared: production requests fail closed
  and production locks are denied when Redis is absent or unavailable. Readiness
  reports Redis as unhealthy in production. Local fallback remains for
  development and tests.
- Wildcard invalidation now uses incremental Redis `SCAN`, never `KEYS`. Admin
  pricing create/update/delete invalidates public pricing cache entries. Redis
  operations log the error class without emitting potentially sensitive error
  contents. Client retries are bounded to one retry.

### Remaining Redis setup and audit items

- Set both `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in every
  production web and worker environment. Do not put either in `NEXT_PUBLIC_*`,
  source control, or client configuration. Leave both unset together for local
  development if using process-local fallback. A partial pair fails at startup.
- Local Upstash smoke checks confirmed `PING`, app cache set/get/delete,
  distributed lock acquisition/exclusion/release, the shared rate limiter,
  SCAN-based cleanup, and provider circuit open/recovery/status operations.
  A local production server returned HTTP 200 from `/api/health/ready` with
  database and Redis healthy. Two independent Redis clients confirmed lock
  exclusion/release and shared provider circuit visibility. Repeat those checks
  against the deployed production environment; full multi-process app/worker
  verification remains open.
- Provider circuit-breaker state and the global emergency halt now use shared
  Redis keys guarded by distributed locks. Routing, workers and outcome writes
  await this state; production denies routing when shared circuit state cannot
  be read. The one-process Redis smoke check does not prove two-node visibility.
- The database-backed fraud velocity checks, queue job claims, wallet/payment
  idempotency, and permission lookup source are already shared through
  PostgreSQL; ordinary UI toast deduplication and immutable static-data maps
  are intentionally process/browser local and do not need Redis.

### Redis change and verification ledger

| Change | Files / scope | Reason | Verification |
| --- | --- | --- | --- |
| Removed unused `REDIS_URL` setting and documented the Upstash REST backend and production requirement. | `.env.example`, `src/config/env.ts`, `docker-compose.yml`. | Prevent the local TCP service from being mistaken for the application's supported backend. | Typecheck and focused lint passed. |
| Made shared rate limits and distributed locks fail closed in production; bounded local rate-limit fallback state. | `src/lib/security/rate-limit.ts`, `src/lib/security/rate-limiter.ts`, `src/lib/redis.ts`. | Per-process fallback does not enforce a shared production policy. | Production-policy regression test added; focused suite passed. |
| Replaced wildcard `KEYS` with `SCAN`; limited retries and sanitized Redis error logging. | `src/lib/redis.ts`, `src/lib/security/rate-limit.ts`. | Avoid blocking keyspace scans and leaking internal error detail; bound failure latency. | Cache/queue tests passed; focused lint passed. |
| Made readiness require healthy Redis in production and invalidated pricing cache on admin writes; scoped SMS report cache by timezone. | Health routes, admin pricing routes, SMS report route. | Redis is a production security/coordination dependency; avoid stale pricing and mislabeled user report buckets. | Focused lint, local Redis smoke checks, and local production readiness endpoint passed; deployed endpoint verification pending. |
| Moved SMS provider circuit state and emergency halt to Redis, guarded transitions with distributed locks, and made routing await shared state. | `src/lib/sms/circuit-breaker.ts`, routing engine, queue worker, dispatcher, circuit-breaker tests. | Keep web and worker instances aligned on provider health and dispatch halts. | Typecheck, focused lint, 19 focused Redis/circuit tests, live recovery/status scan, and two-client lock/state visibility checks passed; multi-process app/worker check pending. |

### Redis continuation verification (2026-10-08)

- `npm run build` passed with Next.js 16.3.8 and generated all 169 static pages.
- `npm run lint` passed with zero warnings or errors.
- `npm run test:run` passed: 103 files and 676 tests.
- `npx tsc --noEmit` passed.
- A local production server returned HTTP 200 from `/api/health/ready`; both
  PostgreSQL and Redis reported healthy. The server was stopped after the check.
- Separate Upstash client connections confirmed distributed lock exclusion,
  release visibility, and Redis-backed circuit state visibility. This validates
  shared Redis coordination, but not the deployment's process orchestration,
  which still needs a two-instance app/worker check.
- After that full run, `/api/health`, `/api/health/live`, and
  `/api/health/ready` were excluded from proxy rate limiting so Redis outages do
  not mask readiness with a 429. The focused guest-guard suite passed 17 tests,
  the changed files passed ESLint, and TypeScript passed after this last source
  change; the complete suite/build have not been rerun after this small proxy
  adjustment.

### Upstash credential and coverage follow-up (2026-10-08)

- Rechecked the local `.env` without displaying secret values: both
  `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are present, the URL
  host matches the Upstash database supplied for this project, and `.env` is
  ignored by Git. `.env.example` contains empty placeholders only.
- A fresh live check using the installed `@upstash/redis` SDK passed `PING`,
  expiring object `SET`/`GET`, atomic `SET NX EX` lock exclusion, token-checked
  Lua lock release, and cleanup. Temporary keys used an audit-specific random
  prefix and were deleted. The credentials were not printed.
- Focused Redis verification passed: 4 test files and 19 tests covering the
  circuit breaker, performance/cache behavior, missing-Redis production policy,
  and Redis cache/lock wrappers. The full test/build suite was not rerun in this
  follow-up.
- Re-scanned the web application and sibling mobile, gateway, and firmware
  folders for Redis clients and connection references. Application Redis use
  remains behind the single shared Upstash REST client in `src/lib/redis.ts`;
  the mobile, gateway, and firmware folders contain no Redis client/config.
  The Redis container in `docker-compose.yml` remains optional standalone
  tooling and is not connected to the Next.js app or worker.
- The supplied REST token was pasted into the conversation and must be treated
  as exposed. Rotate/revoke it in Upstash, then replace it in the local ignored
  `.env` and every deployed web and worker environment before production use.
  Do not copy it into source, documentation, `.env.example`, or `NEXT_PUBLIC_*`.
- Redis is used for shared rate limiting, expiring read caches, SMS/queue
  idempotency and worker locks, provider circuit state, and the global dispatch
  halt. PostgreSQL remains the durable source for jobs, wallet/payment
  idempotency, and business records. No Redis-specific app code change was
  required in this follow-up.
- The Codex tool registry for this task does not expose an Upstash MCP tool or
  MCP configuration operation. The project integration uses the supported
  Upstash Redis REST SDK directly; an MCP connection is not required for
  application runtime.
- Remaining external verification: install the rotated token in the deployed
  web and worker secret stores, confirm `/api/health/ready` is healthy there,
  and run one cross-instance worker/lock check in the deployment environment.

## App-to-backend connectivity follow-up (2026-10-08)

### Connectivity model

- The Next.js web app is the shared backend. Browser workflows can use its
  server-side code directly; native clients use its versioned `/api/v1`
  handlers. The mobile dashboard calls the expected auth/MFA, dashboard, SMS,
  messages, wallet, sender-ID, contacts, and gateway routes. The Android
  gateway and ESP32 firmware use the `/api/v1/device/gateways/*` pairing,
  heartbeat, queue, status, incoming-SMS, and firmware-check routes.
- Redis is a backend dependency, not a client dependency. The web API and
  standalone queue worker use the same Upstash REST variables. Mobile,
  Android gateway, and ESP32 firmware must not receive Upstash tokens or talk
  to Redis directly; they call the web API. Gateway SQLite and firmware
  LittleFS are local offline/device stores, not shared server state.

### Findings and fixes

- Mobile and Android gateway previously had different implicit API targets:
  emulator-only `10.0.2.2` for mobile, a local LAN IP on the gateway pairing
  screen, and a separate `api.range.ug` default for gateway background sync.
  Added `.env.example` files and a shared-per-app `EXPO_PUBLIC_API_URL`
  contract. Pairing, mobile API calls, and gateway background sync now resolve
  one configured web backend URL, append `/api/v1` when needed, reject malformed
  URLs, and require HTTPS in production bundles. No local `.env` exists in the
  mobile or Android gateway repo yet.
- The Android gateway pairing screen expected `{ gateway: { id, name } }`, while
  the web handler returns `{ success, gatewayId, token, message }`. It now
  validates the server response and stores the actual returned `gatewayId`.
- The mobile app's sign-out previously erased its local token without revoking
  the server session. Added `POST /api/v1/auth/logout` to revoke the current
  bearer session and audit that action. The mobile client calls it and always
  clears local credentials; if offline, the UI reports that the old server
  session still needs revocation in web Account Security.
- A second client-contract pass found that mobile contact-group creation and
  member add/remove only mutated local screen state, while the mobile list and
  member reads used a separate sample master directory. Added account-scoped
  bearer-session APIs at `/api/v1/account/contact-groups` and
  `/api/v1/account/contact-groups/:id/members`, enforced the existing
  `contacts.view` / `contacts.manage` permissions and ownership boundaries,
  and connected the mobile group/member actions to those persistent records.
  The sample master-directory endpoints remain available under their existing
  paths; the mobile account management screens no longer use them.
- Developer examples and OpenAPI metadata pointed to a separate unverified
  host and `/v1` path. They now derive the production API base from
  `NEXT_PUBLIC_APP_URL` and use `/api/v1`; when the configured origin is still
  localhost, examples show an explicit deployment-domain placeholder instead
  of directing integrators to a guessed host. The homepage curl sample now
  uses the same base and the backend's `recipients` / `senderId` request fields.
- Removed a mobile SMS demo fallback that reported “queued” and cleared the
  compose form after network, 404, or server failures. Failed requests now
  remain visible as failures, so the app cannot claim backend delivery without
  a successful API response.
- ESP32 firmware previously defaulted to a private development IP and did not
  persist the pairing code entered in its setup portal, so it fell back to a
  serial prompt. The firmware now requires an operator-configured backend URL,
  normalizes it to `/api/v1`, migrates the old private-IP default to the setup
  portal, persists/uses the portal pairing code, and saves URL changes for
  paired devices. Pairing codes and access-token fragments/response bodies
  were removed from serial logs.
- The local web app has `NEXT_PUBLIC_APP_URL=http://localhost:3000`; the
  production domain is not configured in the workspace. The former `api.range.ug`
  candidate could not be resolved from this host, so no unverified production
  domain was hard-coded. Set the same actual deployed web app origin in both
  Expo app build environments and the firmware provisioning portal.

### Verification and remaining deployment steps

- Verified that the mobile and hardware-gateway paths used by the clients map
  to route handlers present in the web project. Local API probes returned 200
  for readiness, 401 for unauthenticated `/api/v1/auth/me` and
  `/api/v1/auth/logout`, as expected. The readiness probe briefly returned
  Redis degraded once; a direct SDK ping then passed and the next three probes
  reported database and Redis healthy.
- The mobile logout API tests passed (3 tests). Mobile and Android gateway
  TypeScript checks passed. Mobile and gateway lint passed, including lint on
  changed files. Web TypeScript passed; the new web logout route and test passed
  focused ESLint. The web production build completed successfully with 170
  static pages. The later three readiness probes all reported database and
  Redis healthy.
- ESP32 firmware compilation and hardware pairing/sync could not be verified:
  PlatformIO is not installed and no physical gateway is attached. Chrome
  DevTools MCP is not available in this environment; API requests and local
  readiness probes were used for runtime checks.
- Required before claiming production end-to-end connectivity: set
  `EXPO_PUBLIC_API_URL` for mobile and Android gateway builds to the deployed
  web app origin (or its `/api/v1` base), provision the same origin in every
  ESP32, then test login/MFA/logout, gateway pairing, heartbeat, queue claim,
  and result upload against deployment. Test mobile contact group create,
  add-member, and remove-member flows against the account-scoped endpoints.
  Keep Redis credentials only on the web/worker side, and verify deployed
  readiness plus cross-instance lock behavior.

### Cross-app API follow-up validation (2026-10-08)

- Web TypeScript compilation passed after adding the account-scoped mobile
  contact group endpoints and shared public API-origin helper.
- Focused web ESLint passed for the new endpoints, developer examples,
  OpenAPI contract, and homepage sample.
- Focused API contract and mobile-logout tests passed: 2 files, 9 tests.
- Next.js production build passed and generated all 171 static pages/routes;
  the output included both account-scoped contact group endpoints and the
  existing mobile/device APIs.
- Full repository-wide web ESLint completed with no errors or warnings.
- Mobile and Android gateway TypeScript checks and full lint passed. Firmware
  remains uncompiled because PlatformIO is unavailable.
- Live local probes returned 200 for readiness with PostgreSQL and Redis
  healthy, and 401 for both account contact endpoints when called without a
  bearer session.
- `git diff --check` passed in the web, mobile, Android gateway, and firmware
  repositories; Git emitted only existing LF/CRLF normalization notices.
- Deployed/browser/device flows remain pending. Chrome DevTools MCP is
  unavailable; no signed-in mobile client,
  deployed production URL, or physical gateway was available for the remaining
  end-to-end checks.

### Four-project API and device integration follow-up (2026-10-08)

- Confirmed the web application is the shared API host for the mobile app,
  Android gateway, and ESP32 firmware. The clients use `/api/v1`; mobile and
  Android gateway read `EXPO_PUBLIC_API_URL`, while ESP32 receives the origin
  and trusted root CA during provisioning. Redis remains server-side only and
  is not exposed to apps or devices.
- Mobile campaigns now load approved sender IDs from the backend, select a
  real sender record, and submit its database ID. Mobile API requests have a
  15-second timeout. Android gateway sync requests now time out after 15
  seconds as well.
- The mobile gateway-list endpoint now returns only display fields and
  battery/heartbeat summaries instead of serializing full gateway config,
  pairing values, FCM data, IP data, and extended telemetry to the client.
- Hardened ESP32 gateway pairing: codes use a cryptographic random source,
  expire after ten minutes, are rate limited through the shared server
  limiter, and are claimed in a transaction before device/token records are
  created. The query now selects only a matching pending gateway rather than
  scanning every pending record.
- The ESP32 had used `HTTPClient.begin(url)` for backend HTTPS requests.
  Espressif's implementation configures that overload without a CA, which
  disables certificate verification. Firmware now requires HTTPS plus a
  trusted root CA from the provisioning portal, syncs system time before
  verified requests, and refuses unverified connections. Plain HTTP is
  disabled by default and only available through an explicit local-development
  compile flag. The CA is public certificate material, not a secret.
- Removed the web firmware-check route's placeholder S3 URL. OTA now remains
  disabled until `ESP32_FIRMWARE_VERSION` and a real HTTPS
  `ESP32_FIRMWARE_DOWNLOAD_URL` are configured. Firmware downloads no longer
  receive the device bearer token; deployments must use public or signed
  artifact URLs.
- Corrected both Expo apps to configure splash screen through the SDK 57
  plugin. Added missing Expo font, worklets, and splash dependencies. Aligned
  the Android gateway's Expo patch dependencies with SDK 57 and set Android
  compile/target SDK to 36.
- Current verification: mobile and Android gateway TypeScript and full lint
  passed; web TypeScript, full ESLint, and focused API tests passed (2 files / 9
  tests). Both local Expo configs and `expo install --check` pass. Expo
  Doctor's remote schema check could not reach Expo's service; its remaining
  local checks passed after the SDK patch mismatches were updated. Android
  exports passed for both apps. Each Expo app's production dependency audit
  reported 36 advisories (21 high, 15 moderate); most suggested fixes jump
  across Expo/RN major versions and were not applied blindly. Web production
  dependency audit reported zero advisories.
- Remaining connection requirements: set the deployed web origin in both
  Expo build environments; provision that origin and matching root CA on each
  ESP32; rotate the Upstash REST token previously pasted into chat; configure
  production Upstash variables only on the server; and verify pairing, MFA,
  campaign dispatch, device heartbeat/queue/result, and OTA against deployment.
  No production URL, CA, hardware, or deployment credentials were available.
- Earlier mobile integration gaps were resolved in later passes: wallet top-up
  now uses the MTN Collection flow, and gateway pairing creates a user-owned
  gateway then requests its short-lived pairing code. Live provider/device
  behavior is still unverified as recorded above.

### Export and dependency follow-up

- The Android mobile app exported successfully; its Hermes bundle is 4.2 MB
  and the export includes 46 bundled assets, mostly icon fonts. Review direct
  icon imports and font usage before a later bundle-size optimization.
- The Android gateway export exposed missing `@expo/metro-runtime` and the
  runtime `crypto-js` package (only its types had been declared). Added both
  packages; the Android gateway export now succeeds with a 3 MB Hermes bundle.
- The final web production build passed and generated all 171 static
  pages/routes. Mobile and gateway Expo exports are JavaScript bundle checks;
  they are not signed native builds or device tests. PlatformIO is not
  installed, so ESP32 compilation remains unverified.
- Both Expo projects have the same production audit result: 36 advisories (21
  high, 15 moderate). Most recommended `npm audit fix` paths downgrade Expo,
  React Native, Tailwind, or NativeWind across major versions. Resolve these
  with a supported SDK upgrade plan and security review, not an automatic
  force upgrade.

### MTN MoMo Collection wallet top-ups (2026-10-08)

- Replaced the previous mobile mismatch (mobile sent `{amount, phone}` to an administrator-only manual credit route) with a separate authenticated MTN Collection request flow used by the web and mobile wallet clients.
- Added a durable `MomoPayment` record and status enum. The existing direct admin deposit endpoint remains the manual accounting path.
- MTN RequestToPay uses a generated UUID reference, server-side API user/key and Collection subscription key, Uganda MSISDN normalization, no-store fetches, bounded request timeouts, and per-user shared rate limits. API credentials remain server-only.
- `202 Accepted` creates a pending request only. The account wallet is credited only after the authenticated MTN status endpoint reports `SUCCESSFUL` and the returned `externalId`, amount, and currency match the stored request. The payment row and wallet ledger update occur transactionally under row locks and are idempotent.
- Added an optional MTN callback endpoint accepting both POST and PUT as MTN's setup guidance requires. It treats callback payloads only as a signal; it re-queries MTN with server credentials before settling. MTN documents callback delivery as one-shot with no retry, so clients also poll status. The callback URL host must exactly match the registered ProviderCallbackHost (MTN says subdomains are not allowed); this deployment requirement remains unverified until the public callback host is registered and configured.
- Current change verification: Prisma schema validation and client generation passed; web TypeScript check and focused ESLint passed; MTN number normalization tests passed (2 tests); mobile TypeScript and focused ESLint passed. Live MTN transaction, callback delivery, browser verification, database schema push, and deployment are not verified because account credentials, callback hostname, and a test MTN account were not available.
- Deployment configuration required: `MTN_MOMO_ENVIRONMENT`, `MTN_MOMO_COLLECTION_SUBSCRIPTION_KEY`, `MTN_MOMO_API_USER`, `MTN_MOMO_API_KEY`, plus production Uganda `MTN_MOMO_TARGET_ENVIRONMENT=mtnuganda`, `MTN_MOMO_CURRENCY=UGX`, and registered HTTPS `MTN_MOMO_CALLBACK_URL`. Sandbox uses the sandbox endpoint/target environment and MTN's documented EUR currency; a sandbox wallet must use EUR to avoid cross-currency credits. Apply the additive Prisma schema update using the deployment's reviewed database change process before enabling top-ups.
- Airtel Money remains unavailable in this flow; no Airtel collection credentials/provider contract were supplied.
- Extended verification after the initial notes above: full web TypeScript, full ESLint (`--max-warnings 0`), all 686 tests across 106 files, and Next.js production build all passed. Build generated 173 static pages and routes, including both wallet MoMo endpoints and the webhook. Mobile TypeScript and focused ESLint passed, and Android Expo export completed (4.2 MB Hermes bundle). No live MTN account, deployed callback, database schema push, signed-in browser session, or Chrome DevTools MCP was available, so provider and UI end-to-end behavior remain not verified.

## Cross-project API business-logic pass — 2026-10-08

### System boundary map

- **Web application**: Next.js App Router is the canonical business API. It authenticates mobile sessions/API keys and device credentials, validates requests, owns authorization, message pricing and wallet debits, campaign/recipient records, queue assignment, provider dispatch, status rollups, and retry decisions.
- **Mobile application**: Expo app sends account, campaign, wallet, contact, and gateway operations to the configured web API. SecureStore holds session/MFA credentials and display preferences; campaign segment count is explicitly an estimate only. Server response supplies accepted recipient and unit totals.
- **Android gateway**: Expo app pairs with and calls the web device API; SQLite stores the device's durable transport queue and incoming SMS awaiting sync. Android native code selects a SIM and sends SMS; the API owns each attempt, retry eligibility, and status aggregation.
- **ESP32 firmware**: Calls the same `/api/v1/device/gateways/*` API. SIM selection, AT command exchange, modem delivery reference matching, local config, and read-only device status remain firmware responsibilities because they require hardware access. The local dashboard was reduced to read-only; management uses authenticated API commands and factory reset uses the physical BOOT button.

### Changes in this pass

- Added recipient-specific gateway attempts (`messageRecipientId`, `attemptNumber`) so every queued attempt has a unique ID and a gateway result updates one recipient.
- Added `PARTIAL` campaign status for mixed final recipient outcomes. Shared status reconciliation now drives API gateway results, provider-worker results, and SMS delivery webhooks.
- Made gateway queue claiming use PostgreSQL `FOR UPDATE SKIP LOCKED` so concurrent device polls cannot claim the same attempt.
- Allowed a later carrier DLR to upgrade an attempt from `SENT` to `DELIVERED`; final outcomes remain terminal and duplicate state changes are rejected.
- Moved bounded transient modem retry decisions into the API (up to three attempts for listed modem error codes); `SEND_UNCERTAIN`, expiry, and carrier DLR failure do not retry automatically. Firmware no longer retries a failed attempt ID locally.
- Reject invalid sender IDs in the entire bulk batch before wallet debit, rather than charging and silently skipping those items.
- Added Prisma migration `20261008000100_recipient_gateway_attempts_partial_status` and regenerated the checked-in Prisma client.
- Fixed firmware build blockers found during verification: missing `ArduinoJson`, `<vector>`, LED, and WiFi includes; incorrect namespace forward declaration; and a C++14-incompatible digit separator.
- Updated gateway/firmware documentation to state the API/device responsibility boundary.

### Verification

- Web Prisma schema validation: passed.
- Web TypeScript: passed after Prisma client regeneration.
- Web ESLint: passed with `--max-warnings 0`.
- Focused web SMS integration and status-rollup unit tests: passed (2 files, 7 tests).
- Android gateway TypeScript and ESLint: TypeScript passed; ESLint passed via `npm run lint`. Mobile app TypeScript passed; its `npm run lint` caught and then verified a duplicate API import fix. Added a human-readable `Partially delivered` dashboard label. `npx expo lint` itself failed because the Expo CLI searched for a missing `components` path, although the directory is present in this workspace; use the package lint script for this repository.
- Firmware PlatformIO ESP32 build: passed after fixing the discovered include/forward-declaration/language errors; generated firmware image is build output.
- No production database migration was applied, no live SMS provider/device was exercised, and no browser DevTools MCP is exposed in this session. Browser, physical gateway, carrier DLR, concurrent live polling, and deploy migrations remain unverified.

### Remaining architecture concerns

- Selected `CLOUD`/`SMPP` Gateway dispatch is not implemented. Send APIs now reject these choices before charging; provider-specific dispatch, credentials, retries, DLR handling, and live integration tests remain future work. `DEGRADED` gateways are also rejected because queue polling serves only `ONLINE` gateways.
- Mobile UI requests the configured web API, but live URL configuration, signed-in roles, network behavior, and authentication journeys were not browser/device tested.
- Device result reports are submitted over the network but are not backed by a durable client-side result outbox on both gateway implementations. Network loss after modem send can delay backend status reconciliation; `SEND_UNCERTAIN` must not be retried automatically.
- This is a targeted end-to-end flow audit, not completion of every route, server action, role permission, database constraint, UI screen, asset, integration, or deployment configuration listed above. Other ledger sections remain pending.

- Generated a baseline migration from the pre-change schema because the repository had no migration history. Fresh databases can use the baseline followed by the additive recipient/partial migration. For an already-populated database, operators must verify schema equivalence and mark `20261008000000_baseline` as applied once before deployment; do not run its baseline SQL against live data. No database migration was applied during this review.
- The mobile settings screen now labels push alerts unavailable and explains that no backend push channel/provider exists; it no longer shows a functional-looking UI-only toggle.

- Removed fabricated mobile telemetry totals and hard-coded carrier percentages. Added user-scoped `/api/v1/reports/summary` period aggregation from recipient delivery records and changed the mobile report screen/share text to use actual API results. Report API integration, status-rollup unit, SMS API integration, and unsupported gateway dispatch tests passed (3 files, 10 tests). Final web TypeScript, full ESLint (`--max-warnings 0`), and production Next build all passed; the build includes `/api/v1/reports/summary`.

## Web and mobile front-end/API connectivity and parity — 2026-10-08

### API connectivity inventory

The mobile API client builds every request from `EXPO_PUBLIC_API_URL` and
appends `/api/v1`; it rejects non-path requests and requires HTTPS for
production. The credential is a database-backed session token in Expo
SecureStore, not a developer API key. These mobile calls map to web Route
Handlers and use session-aware authentication:

| Mobile workflow | Web endpoint | Result |
| --- | --- | --- |
| Login, MFA verify/resend, current user, logout | `/api/v1/auth/*` | Implemented; mobile MFA does not support passkeys. |
| Dashboard metrics/recent activity | `/api/v1/dashboard/stats` | Implemented; gateway counts were corrected to filter by the signed-in user. |
| SMS send | `/api/v1/sms/send` | Implemented; server validates sender/recipients, prices, debits, and dispatches. |
| Message history | `GET /api/v1/messages` | Added in this pass; authenticated user scope, bounded page size, and minimal selected fields. |
| Delivery summary | `/api/v1/reports/summary` | Implemented from recipient delivery records. |
| Wallet balance/transactions/MTN top-up/status | `/api/v1/wallet/*` | Implemented; top-up credits only after provider-confirmed settlement. |
| Approved sender IDs | `/api/v1/sender-ids` | Implemented. |
| Contact groups and members | `/api/v1/account/contact-groups/*` | Implemented; server permission checks apply. |
| Gateway list/create/pair | `/api/v1/gateways*` | Implemented; mobile pairing calls create and short-lived pair-code endpoints. |

The web sign-in page rendered in the local browser. Chrome DevTools MCP is not
available; this browser check did not authenticate, exercise live network
requests, or verify native Android/iOS behavior. No production API URL was
configured in the mobile project during this pass.

### Feature parity boundary

The apps share the standard client account, send, wallet, contact-group,
gateway, and report workflows listed above, but they are **not feature clones**.
The mobile app is currently a focused client companion. Web-only client
workflows include saved/advanced campaigns, scheduled SMS and drafts,
templates/variables, full contact CRUD/import/tags/segments/consent, sender-ID
applications, pricing/billing views, detailed report families, notification
center/preferences, profile/security/session management, support tickets, and
developer API key/usage/webhook tooling. Web-only role-specific areas include
admin and agent operations; those should not be exposed in the client app
without explicit permission and product scope. Mobile push notifications are
not implemented and are now shown as unavailable rather than as a working
toggle.

### Changes and verification in this pass

- Added a user-scoped paginated message-history API and connected it to the
  mobile reports screen, including loading, error, empty, and content states.
- Scoped dashboard gateway totals to the authenticated account to prevent
  cross-account counts from appearing in mobile statistics.
- Replaced mobile's gateway-pairing placeholder with API-backed Android
  gateway creation, pairing-code generation, retry, and expiry display.
- Replaced the nonfunctional push toggle with an explicit unavailable state;
  security and support rows now open their corresponding web portal routes.
- Removed the mobile dashboard's silent offline/demo fallback: failed requests
  now show an error and retry action, and unverified zero metrics are not shown
  as real account data.
- Renamed the mobile bottom navigation label from `Campaigns` to `Send`, which
  matches the screen's compose-and-send behavior.
- Web tests for message history, dashboard scoping, and report summaries passed
  (3 files, 5 tests). Web TypeScript and full ESLint passed. Mobile TypeScript
  and full ESLint passed after correcting one effect-state update and an array
  style warning. Final mobile TypeScript, full ESLint, and Android Expo export
  passed after the dashboard error-state and gateway pairing changes; the
  export generated a 4.2 MB Hermes bundle.

### Remaining parity and deployment work

- The standard-client parity target is substantially broader than the current
  mobile feature set. Add those workflows in feature slices with
  session-authenticated API contracts, permission checks, and equivalent
  loading/error/empty states. Do not mirror admin/agent functions by default.
- Configure the mobile build's `EXPO_PUBLIC_API_URL` to the production web
  origin and verify signed-in Android/iOS journeys against a staging backend.
- Implement a push provider and persisted notification preference before
  exposing a toggle; implement mobile passkey/WebAuthn support or communicate
  the existing passkey-only account limitation in the login flow.
- Test message history, report periods, gateway create/pair, and wallet status
  against a deployed database and real provider/device. Those integrations
  were not exercised here.

## Four-project integration and reliability review — 2026-10-08

### Repository map and baseline

| Project | Tracked paths | Architecture and responsibility | Initial state |
| --- | ---: | --- | --- |
| Web | 1,296 | Next.js 16.3.8 App Router, React 19.2.8, TypeScript, Prisma 7/PostgreSQL. Canonical user/business API, authentication, billing, SMS orchestration, webhooks, reports, and queue processing. | `feat/unified-ui-responsive-design-system`, clean at `1eeacf5`. |
| Mobile | 64 | Expo SDK 57 / Expo Router, React Native 0.86.3. Client companion calling the web `/api/v1` routes; session token stored in SecureStore. | `master`, clean at `1d36e24`. |
| Android gateway | 70 | Expo SDK 57 gateway companion plus custom Android SMS module, local SQLite queue, SecureStore device token, and background/foreground sync. | `master`, clean at `4a4de66`. |
| ESP32 firmware | 30 | PlatformIO/Arduino ESP32 firmware. Owns modem/SIM hardware, local telemetry, TLS API client, and physical SMS transport. | `main`, clean at `fc92ded`. |

`git ls-files` counts above include each repository's tracked documentation and
configuration. Vendor/install output and generated builds remain classified as
generated and are not included in those tracked counts. The repositories are
separate Git projects, not a single workspace; shared contracts currently live
in the web API and matching clients/docs.

### Cross-project flow and contract

The web API owns account permissions, campaign validation, pricing, wallet
debits, per-recipient attempt creation/retry, aggregate statuses, and payment
settlement. The mobile client calls user-session routes for MFA, dashboard,
messages/reports, SMS send, wallet, contacts, sender IDs, and gateways. The
Android gateway and ESP32 use device-token routes for pairing, heartbeat, queue
claim, attempt results, incoming messages, and firmware checks. Hardware
gateways send through local modem/SMS hardware and report one attempt result;
they do not calculate price or independently retry business attempts.

Mobile is a focused client companion, not a clone of all web workflows. The
current parity boundary and missing web client features remain documented in
the earlier API connectivity and parity section. Admin/agent functions remain
web-only. Production API origin, passkey support on mobile, and push delivery
remain external/product requirements.

### Verified issues and changes in this pass

- Android delivery callbacks were read from a destructive native getter before
  the server acknowledged them. A network failure could permanently lose a
  carrier result. The native getter now preserves the local outbox; the worker
  removes only result events acknowledged by the API (or stale terminal events
  rejected with 409).
- Foreground/background sync could overlap because the app triggers polling
  every 10 seconds while network calls can run up to 15 seconds. A process-local
  sync guard now prevents duplicate queue processing within one app runtime.
- Incoming SMS were also cleared from Android native storage before they were
  persisted locally, and SIM slot `0` was lost through a truthy-value check.
  Native inbox acknowledgement now happens after a duplicate-safe SQLite
  insert, slot `0` is preserved, and local logs no longer include sender data.
- The unauthenticated ESP32 local dashboard exposed subscriber IMEI/phone and
  USSD balance, plus WiFi SSID, MAC, and the configured backend URL. These
  values are removed from the local HTML/JSON view; remaining modem-sourced
  text is HTML-escaped.
- Serial diagnostics included incoming SMS sender and message body. They now
  log only that an SMS arrived and which SIM received it.
- ArduinoOTA was started without an authentication password, permitting a
  reachable local network client to attempt firmware flashing. Local ArduinoOTA
  now remains disabled unless a valid 32-character password hash is provided
  by trusted build configuration. Backend FOTA remains separately gated by a
  configured HTTPS firmware artifact.
- Firmware diagnostic logging no longer prints the configured backend URL,
  which could otherwise expose accidental URL credentials or query values.
- Updated the delivery webhook integration fixture to model the transactional
  recipient read used by the status reconciler. Raised timeouts only for the
  specific error-page tests that timed out under the full suite's worker load;
  all nine pass in isolated execution.

### Verification and unresolved risks

- Web typecheck, full ESLint, and Next production build passed. The first full
  Vitest run passed 692/696; three failures were timeout-only under full load
  and the remaining test fixture lacked the transaction reconciler's recipient
  read. After correcting those test conditions, the full suite passed 696/696
  across 110 files.
- Web production dependency audit (`npm audit --omit=dev --audit-level=high`)
  found zero vulnerabilities.
- Mobile and gateway TypeScript, lint, Android JavaScript export, and Expo
  dependency compatibility checks passed in this review. Their production
  dependency audits each still report 36 advisories (21 high, 15 moderate) in
  transitive Expo/Metro/NativeWind dependency paths. Automated suggested fixes
  cross Expo/Tailwind major versions; do not force-apply without an SDK upgrade
  plan. A native signed build and hardware delivery test remain unverified.
- ESP32 PlatformIO compilation passed after the security and warning fixes via
  `python -m platformio run`. Physical modem, SIM, WiFi, OTA, and deployed
  TLS/API behavior remain unverified. The second PlatformIO compile reported
  only pre-existing ArduinoJson deprecation and C++ standard warnings; these
  were corrected, and the final compile completed successfully with no compiler
  warnings in its output.
- The Android gateway changes include a Kotlin native module; this host has no
  Android SDK/Gradle installation, so a signed/native Android build and Kotlin
  compilation were not verified. Expo Android export verifies the JavaScript
  bundle only.
- Chrome DevTools MCP is unavailable. No authenticated browser journey or live
  staging API/device flow was exercised during this pass.
- The required Codex Security Deep Scan did not start. Exact tool result:
  `Deep Scan cannot safely start a read-only worker: the parent must provide a
  managed filesystem permission profile.` The account access check was
  `not_granted`; no scan report exists and no substitute scan was started.
- No production database migration, live MTN transaction, mobile production
  API URL, firmware signing artifact, or physical gateway test was performed.
  The Upstash REST token and GitHub personal access token previously pasted in
  conversation must be rotated before production use; this ledger never stores
  either value.

## Verification continuation — 2026-10-08

### Additional web fixes

- Removed the root viewport `maximumScale=1` setting so users can zoom on
  mobile. Raised homepage emerald status/check text to an accessible contrast
  level and restored readable Unicode punctuation, bullets, and copyright text.
- Made the scrollable terminal output keyboard-focusable and gave it an
  accessible name.
- Corrected the developer portal's documented URLs to match the implemented
  `/api/v1` endpoints. Replaced the stale webhook example with the actual
  authenticated message-status route and response shape. The production and
  sandbox hostnames still need an owner-provided contract before documenting
  different domains.
- The API status card now says it is checking while pending and reports
  unavailable on fetch failure instead of asserting that all services are
  operational.
- Updated browser tests that described a different current UI: password
  recovery is an inline view; the primary sign-in button is distinguished from
  provider buttons; the plan is named `Growth`; public-page headings and
  protected routes match the current route inventory. Auth submission tests
  now assert that bot verification blocks submission before credential
  validation.
- Accessibility and developer-doc E2E navigation waits for DOM readiness,
  avoiding hangs on external resources that do not affect the rendered page.

### Verification after the fixes

- Web TypeScript check and ESLint passed. The final production build passed on
  Next 16.3.8 after the documentation correction and generated all 174 static
  pages.
- Isolated OpenAPI contract and job-scheduler tests passed 9/9. A fresh full
  Vitest rerun was interrupted after concurrent checks caused timeout reports;
  it is not a clean final full-suite result. The previous complete 696/696 run
  remains evidence for the prior code state only.
- Production-browser E2E: a broad Chromium run passed 22/24; the two failures
  were stale assertions for current marketing plan/heading names. Accessibility
  and campaign suites passed 6/6 after those corrections. A mobile-Chrome run
  passed 24/24. Firefox could not be run because its Playwright browser binary
  is not installed. The browser console/devtools MCP is not available here.
- Root, login, and design-system axe checks passed 3/3 in an isolated
  production-browser run. The homepage axe check intermittently exceeded the
  30-second suite timeout under repeated runs, so repeat it in a stable CI
  environment before treating timing as settled.
- The documented API samples were aligned by source inspection against the
  route handler; provider integration and live authenticated journeys still
  require staging credentials and real callbacks.

### Completion boundary

This continuation does not close the repository-wide audit. The inventory is
tracked, and the web test/build checks above are evidence, but every route's
authorization and validation, every database query/migration, all UI states,
and all third-party failure modes have not yet been reviewed line by line.
Continue those sections before describing the projects as fully audited or
production-certified. All previously listed secret rotation, staging,
hardware, provider, Android SDK, Firefox, and Deep Scan limitations remain.

## API session authorization continuation — 2026-10-08

### Finding and fix

- Reviewed every current `withApiKey` use under `src/app/api/v1`. The session
  branch previously accepted a valid-looking session by checking only a subset
  of database state, then granted `scopes: ['*']`. This bypassed the normal
  database-authoritative MFA, screen-lock, idle-expiry, identity-match, and
  role-permission checks for SMS, wallet, contacts, sender-ID, reporting, and
  dashboard calls.
- Added direct request-token validation against the database session. It checks
  token/session user identity, active account, revocation, absolute and idle
  expiry, database MFA completion, and screen-lock state from both the signed
  token and lock cookie. Session requests now map route scopes to the existing
  role permissions; unknown scoped actions fail closed.
- The self-profile, dashboard-summary, and reports-summary routes had no
  required scope. Added `profile.read`, `dashboard.read`, and `reports.read`
  scopes in API-key validation and the developer key form. `reports.read` also
  requires `reports.view` for session callers; self-profile and dashboard
  access remain limited to the authenticated account's own data.
- Existing API keys need the matching new scope selected before they can call
  those three endpoints. This is an intentional authorization tightening and
  requires key owners to update/reissue affected keys.
- Added tests for request-session validity and wrapper authorization behavior,
  including identity mismatch, expired/revoked/idle-expired/inactive sessions,
  incomplete MFA, screen lock, and denied role permissions.

### Verification and remaining work

- Focused API-key/session suites passed 14/14 after the final test-environment
  correction. A full web lint and TypeScript check passed. The full test run
  completed with 704/705 passing; the only failure was a 5-second timeout in
  a 404 support-link assertion. Aligned that test with the 15-second timeout
  used by neighboring render tests; the affected error-page and authorization
  suites then passed 23/23. The full suite has not been rerun after this test
  timeout adjustment. The production build passed and generated all 174 static
  pages. `git diff --check` passed.
- The endpoint inventory scan found no remaining `withApiKey(req, '')` route.
- This reviewed the shared wrapper and all of its v1 call sites, not every
  route's complete validation, resource ownership, transaction, or provider
  failure behavior. The broader route-by-route audit remains open.

## API-key quota and message-dispatch continuation — 2026-10-08

### Findings and fixes

- Found a second API-key validator used only by `POST /api/v1/messages`. It
  hashed the entire token even though generated keys store a hash of the secret
  segment, and it bypassed the shared IP, scope, and quota policy. Moved the
  route to `withApiKey` with the required `sms.send` scope and removed the now
  unused legacy validator and its obsolete tests. API-key lookup also requires
  the owning account to remain active.
- API-key quota enforcement previously checked a counter read and then launched
  an unconditional background increment. Concurrent calls could all pass the
  same stale value, and update failures were ignored. Quota admission now uses
  a conditional atomic increment, conditionally advances expired windows, and
  fails closed if a reservation cannot be made. Added race-focused tests.
- The configured per-key request rate (`rateLimit` and `rateLimitWindow`) was
  only applied by the one direct-message route. The shared API wrapper now
  applies the configured limit to every API-key-protected v1 call and applies
  a default 100 requests per 60 seconds per signed-in user. It returns
  consistent 429 responses and rate-limit headers. The direct-message route's
  former duplicate limiter was removed. Production remains fail-closed when
  the shared Upstash-backed limiter is unavailable, per the existing limiter
  policy.
- The direct-message route estimated SMS segments with `ceil(length / 160)`,
  which undercounted Unicode and multipart messages. It now uses the shared
  SMS counter for reserved units and persisted message segments.
- The route previously reserved wallet credits, then created the campaign,
  messages, and dispatch jobs in separate writes. Those writes now run with the
  reservation in one serializable database transaction. It uses the existing
  transaction-aware job enqueue helper with per-message idempotency keys, so a
  failed write rolls back the reservation and partial batch.

### Verification and remaining work

- Focused API-key, quota, billing-ledger, session, and message-dispatch suites
  passed in isolated runs (39/39 and 36/36 across the previous two focused
  runs). Added tests cover a concurrent last-quota-slot race, caller-supplied
  billing transactions, rejected unauthenticated dispatch, insufficient funds,
  atomic enqueue, and Unicode segmentation.
- A new full Vitest run completed 710/711. Its one failure was the tenant/API
  key test's old Prisma mock, which did not return the successful atomic quota
  reservation result. After correcting that fixture, the affected API-key,
  session, quota, MoMo, and wallet suites passed 21/21. The full suite has not
  been rerun after the fixture correction.
- Latest repository-wide TypeScript check passed. The production build passed
  and generated all 174 static pages. Full `npm run lint` did not complete
  within a practical time and grew to about 1.2 GB; the process was stopped.
  Scoped ESLint passed for every changed application and test source file.
- These changes review the shared API-key path and `/api/v1/messages`, not all
  remaining route authorization, validation, database behavior, integrations,
  or cross-project client journeys.

## Wallet and payment continuation — 2026-10-08

### Findings and fixes

- Reviewed the authenticated wallet balance/history routes, admin direct
  deposit, MTN MoMo initiation/status/callback, and generic payment callback.
- MoMo initiation already creates a durable pending request before calling
  MTN, scopes status reads to the signed-in user, and only settles after an
  authenticated MTN status response matches the local amount, currency, and
  external request ID. Callback payloads are treated as signals to re-check
  that authenticated provider status, rather than as payment proof.
- Fixed concurrent MoMo initiation with a reused idempotency key. The database
  unique constraint now resolves the race by returning the existing payment
  when its user, wallet, amount, and normalized phone match; reuse with
  different details is rejected. The losing request does not submit a second
  charge request to MTN.
- Wallet deposit idempotency previously accepted an existing key even when
  the requested wallet or amount differed. It now raises a conflict unless
  wallet, deposit type, amount, and supplied user match.
- Wallet transaction-history paging and type filters now have runtime Zod
  validation, retain the existing 1–500 page size range, and reject invalid
  values instead of passing `NaN` or silently dropping an invalid filter.
  Wallet balance/history and admin deposit routes now log server errors while
  returning a generic 500 message instead of exposing raw error text.

### Open financial contract issue

- `POST /api/webhooks/payment` verifies an HMAC signature, then allows the
  signed payload to select a wallet/user and amount and credits it directly.
  No in-repository provider adapter, payment-intent/charge record, reference
  ownership check, or callback contract was found to link that success event to
  a payment initiated by the application. A valid signature proves the sender,
  but the current handler does not prove a corresponding provider charge.
- Do not enable this webhook for real payments until the provider contract and
  source of truth are identified. Safe resolution options are to match callback
  references against persisted payment intents and verify the provider charge,
  or disable success credits for this generic route and use a provider-specific
  verified settlement path. The intended provider and contract must be
  established before selecting the behavior because this affects real wallet
  balances. This remains a release blocker if this route is configured.

### Verification and remaining work

- `tests/unit/mtn-momo-settlement.test.ts` and
  `tests/unit/wallet-deposit-idempotency.test.ts` passed 4/4; the combined
  post-fix focused API-key/session/quota/payment run passed 21/21.
- Latest repository-wide TypeScript check passed. Scoped lint passed for all
  changed source and test files, and the production build generated all 174
  static pages. Repository-wide lint remains unverified because it was stopped
  after prolonged execution and high memory use.
- The generic payment callback contract remains unresolved as described above.
  This focused pass does not close the endpoint-by-endpoint API, persistence,
  provider, or cross-project audit.

## Mobile and gateway API contract continuation — 2026-10-08

### Cross-project route map reviewed

- Mobile `lib/api.ts` uses one `EXPO_PUBLIC_API_URL` base resolved by
  `lib/api-config.ts` to `/api/v1`. The reviewed mobile calls map to the web
  auth/MFA, dashboard, SMS send, message history, report summary, balance,
  wallet transactions/MoMo, sender-ID, contacts/groups, and gateway routes.
- Android gateway `src/lib/apiConfig.ts` uses the same `/api/v1` resolution.
  Pairing calls `/device/gateways/register`; background sync calls heartbeat,
  queue, message result, and incoming SMS handlers. The ESP32 firmware uses
  those same device paths plus the registration path, with the API prefix
  configured by its setup flow.
- The reviewed Android, firmware, and web gateway-auth code agree on the
  `gt_` token shape, use of the secret suffix for payload encryption, key
  derivation suffixes, AES-256-CBC encryption, HMAC-SHA256, and the `e2ee`
  envelope. This is source-level contract review; physical hardware traffic
  has not been verified in this continuation.

### Findings and fixes

- The mobile app sends campaigns to `POST /api/v1/sms/send`. That handler
  deducted wallet funds before separately creating the message, recipients,
  and queue jobs or hardware attempts. A later write failure could leave a
  charge without dispatch. The deduction and all those records now share one
  serializable transaction; the transaction-aware wallet and hardware dispatch
  helpers avoid opening nested transactions.
- The mobile-send path accumulated per-recipient charges through JavaScript
  floating-point numbers. It now sums Prisma Decimal values directly and
  stores the correct encoding and segment count on the message row.
- A repeated mobile request key previously returned any message with that key,
  even if the sender, content, recipient list, gateway, or account differed.
  The API now returns the original result only for matching request details and
  returns 409 for mismatched reuse. Unique-key/serialization races re-read the
  committed message to make same-request retries idempotent.
- The mobile composer previously generated a new key for every retry. It now
  retains the key after a failed request and clears it when the draft changes or
  the send succeeds, so a retry of an unchanged draft can resolve an uncertain
  response without charging or sending twice.
- Android gateway heartbeats previously sent a hard-coded FCM placeholder,
  `-60` signal strength, and the Wi-Fi/cellular connectivity type as a network
  operator. The backend persisted these as real device fields. Heartbeats now
  send measured battery/charging values and a separately named
  `connectivityMethod`, and omit unavailable FCM/signal/operator values.

### Verification and remaining work

- `tests/integration/api/v1-sms.test.ts` and
  `tests/unit/wallet-deposit-idempotency.test.ts` pass 10/10. Coverage includes
  transaction participation, idempotency mismatch rejection, invalid
  recipients before charging, safe error responses, caller-owned wallet
  deduction transactions, and conflicting financial key reuse.
- Web TypeScript and scoped ESLint passed for the route, wallet, gateway
  dispatch, and test files. The production build passed after the final web
  source changes and generated all 174 static pages.
- Mobile TypeScript and scoped ESLint passed for the changed campaign screen.
  The project-wide `expo lint` command fails because its configured path list
  includes a missing `components` directory. Android gateway TypeScript and
  scoped ESLint passed for the heartbeat worker.
- No source calls to another backend were found in the mobile/API wrapper or
  gateway/firmware request clients during the path comparison. This does not
  establish complete feature parity: the mobile app exposes a smaller set of
  screens and workflows than the web application. A route-by-route parity
  matrix and device/browser journeys remain open.
- Firmware compile, Android native build, staging API calls, device pairing,
  SMS modem delivery, and carrier callbacks were not run in this continuation.

### Open business and reliability findings

- `POST /api/v1/sms/send` does not run the same fraud and regulatory checks at
  request acceptance as `POST /api/v1/messages`. Cloud dispatch has a later
  compliance check that defaults missing message purpose to `MARKETING`, while
  the hardware dispatch route does not show the same centralized check. The
  mobile composer does not collect purpose. Applying a guessed purpose could
  change quiet-hour, consent, and personal-hardware-gateway eligibility. Add a
  purpose selection and align both dispatch paths after the product owner
  confirms the intended classification and explicit-consent requirements for
  ad-hoc phone numbers. Until then, do not treat the two send routes as
  policy-equivalent.
- `sendSmsSchema` allows up to 10,000 recipients, while the mobile send route
  creates each cloud dispatch job serially inside a single serializable
  transaction. Large batches may exceed interactive-transaction time limits.
  Before reducing the documented API limit or changing batch acceptance, agree
  on the supported per-request batch size and desired partial-batch behavior;
  then implement bounded/bulk job insertion and test representative sizes.
- Android gateway jobs and delivery reports remain vulnerable to ambiguous
  outcomes if the app/process stops after the modem accepts an SMS but before
  its status report is durably acknowledged. Automatic replay could duplicate
  SMS, so reconcile this with a durable report outbox and an explicit
  uncertain-delivery state rather than blind retries.
- The generic payment callback finding above remains a release blocker until
  provider reference creation and authoritative charge verification are
  documented and implemented.

### Status update — 2026-10-09

- SMS-send now rejects invalid destination numbers before billing and returns
  a generic 500 response for unexpected internal failures, while preserving
  safe client errors for known conflicts and insufficient wallet funds.
- Final targeted web coverage passed 10/10, the production build generated 174
  pages, web and gateway type/lint checks passed, and mobile type plus changed
  screen lint passed. The repository-wide mobile lint command still references
  a missing `components` directory; the changed screen's scoped lint passed.
- This update does not close the cross-project, route-by-route, staging,
  hardware, or payment-provider review items above.

## Deployment-readiness continuation — 2026-10-09

### Confirmed defects addressed

- Sender selectors submit `SenderId.id` UUIDs, but shared send/schedule/campaign
  validation limited the value to 11 characters. The shared reference schema
  now accepts a UUID or the existing short sender label; actual registration
  still enforces the sender-label limit. The v1 send API now resolves either
  representation within the approved user/client ownership scope.
- The v1 schedule route did not validate sender ownership and deducted funds
  before independently inserting the schedule. It now resolves an approved
  owned sender, stores the canonical reference, and performs deduction plus
  schedule creation in one transaction. Unexpected errors are no longer
  returned verbatim. This does not implement schedule dispatch or change the
  current schedule pricing policy.
- `JobWorker` and `processJobsBatch` share the Job table but support different
  job types. Both previously selected jobs outside their handler sets, causing
  unsupported-job failures when both ran. Claims and lease recovery now filter
  by supported types. Recovery of campaign-worker leases also clears lockedBy.

### Corrections and additional release blockers

- Correction to the previous compliance note: `send-sms` jobs created by
  `/api/v1/sms/send` are handled by `src/lib/jobs/processor.ts`, which calls
  Pandora directly. The compliance check in `sms-dispatcher.ts` handles the
  distinct `sms.dispatch` job type. Its marketing default cannot be assumed
  to protect the mobile-send path. Purpose/consent alignment remains open.
- Scheduling is not connected end to end: the SMS schedule handlers insert
  ScheduledMessage records, but CronScheduler.tick reads ScheduledJob records.
  No worker reading due ScheduledMessage records was found in the source
  search. Stored schedules and successful API responses do not establish
  actual scheduled delivery. One-off and recurring execution, cancellation
  races, consent, and pricing/rebilling require completion before release.
- The existing schedule estimate remains 10 currency units per recipient,
  unlike the destination/segment pricing used by immediate sending. This
  billing discrepancy is not resolved by the transaction fix.
- Correction to prior mobile lint notes: the repository's configured command
  is `npm run lint` (eslint over the project), which passed in this continuation.
  The missing-components error was from separately invoking `expo lint`, not
  from the configured project command.
- Database SELECT 1 and an authenticated Upstash REST PING both succeeded in
  read-only checks. The first local readiness endpoint request returned 503
  with unhealthy database/degraded Redis; repeat and production-load readiness
  remain important. No production SMS or payment was initiated.

### Verification results — 2026-10-10

- Full web Vitest suite passed: 114 test files, 720 tests, one worker. The
  targeted SMS send/schedule, worker isolation, form, and session-idle suites
  also passed independently: 5 files, 22 tests.
- Web TypeScript check passed. ESLint passed for all changed source and test
  files. The Next.js 16.3.8 production build passed and generated 174 pages.
  Repository-wide web lint was not rerun; its earlier run was stopped after
  high memory use.
- Mobile TypeScript (`npx tsc --noEmit`) and configured `npm run lint` passed.
- Gateway TypeScript and configured lint passed.
- ESP32 firmware compiled successfully with PlatformIO using one build worker.
  The image uses 54,480 of 327,680 bytes RAM and 1,255,673 of 1,966,080 bytes
  flash. The upstream Arduino framework emitted repeated
  `CONFIG_ARDUHAL_LOG_DEFAULT_LEVEL` redefinition warnings.
- `git diff --check` passed. The local database `SELECT 1` and Upstash REST
  `PING` succeeded in the read-only checks recorded above; a repeated local
  readiness request returned healthy after an initial 503. These checks do
  not establish production availability or load capacity.
- The login page rendered in the named agent-browser session, and Next.js
  reported no compilation, configuration, or session errors. The user said
  they cannot sign in yet, so authenticated browser journeys, role access,
  and protected-page behavior remain unverified. No live SMS or payment was
  sent; no real modem or ESP32 hardware was exercised.

### Audit status and remaining release blockers

- This remains an incomplete production-readiness audit. Scheduled SMS
  execution is not wired to the stored ScheduledMessage records, schedule
  pricing differs from immediate sending, and cancellation/refund races need
  resolution. These need implementation before claiming the SMS lifecycle is
  production ready.
- Payment callback reference creation and authoritative provider verification,
  campaign purpose/consent policy, credential rotation, the unavailable
  managed security scan, real carrier/payment staging checks, hardware
  delivery, and uncertain-send recovery remain open.
- Full endpoint-by-endpoint review and authenticated browser verification
  across web, mobile, gateway, and firmware are not complete. Passing local
  builds and tests do not establish that all four applications are free of
  defects or ready for deployment.

## Scheduled SMS execution continuation — 2026-10-10

### Scope and user-approved billing behavior

- The user confirmed: charge the first scheduled occurrence upfront, refund
  only when cancellation happens before dispatch, and charge each later
  recurring occurrence when it becomes due. This behavior is implemented for
  both the signed-in web route and the API-key v1 route. No live SMS was sent.
- Traced the route → validation/pricing → wallet transaction → durable Job →
  `processJobsBatch` → Pandora SMS jobs → recipient/message status rollup flow.
  The separate `CronScheduler` continues to process ScheduledJob records; the
  new due-time communication job is scheduled directly in the shared Job table.

### Changes

- Added a shared quote service so immediate and scheduled SMS use matching
  phone validation, message segmentation, destination prices, and recipient
  costs. Existing scheduled rows are reconciled against the current quote at
  first dispatch; additional charges or refunds occur atomically before any
  recipient jobs are queued.
- Added atomic schedule creation, upfront wallet deduction, and durable
  due-time dispatch job creation for both web and v1 API scheduling. Added
  idempotency storage and client ownership to scheduled records.
- Added worker support to claim and process scheduled SMS jobs, create normal
  message/recipient records, and queue individual recipient sends in one
  transaction. Each occurrence uses stable idempotency keys. A stale job cannot
  dispatch an edited, canceled, or superseded occurrence.
- Added recurring occurrence calculation with the stored timezone, weekday,
  daily/monthly interval, end-date, and occurrence-count rules. The first
  occurrence is covered by upfront payment; later occurrences are charged at
  due time. Insufficient balance pauses the recurring schedule without sending
  or charging that occurrence.
- Added pre-dispatch failure refunds for the upfront charge, transactional
  cancellation/refund, and message status rollup to schedule completion.
  Cancellation/edit/pause now use a compare-and-set transition against the
  schedule version to coordinate with dispatch.
- Fixed the scheduled-messages screen so a rejected cancellation remains
  visible and reports the server error instead of claiming success. Masked
  unexpected errors on schedule read/update/cancel paths.
- Added tests for due dispatch, stale jobs, current-price adjustment, recurring
  per-occurrence billing/next-job scheduling, and v1 schedule enqueueing.

### Verification and deployment state

- Full web Vitest suite passed: 115 files, 725 tests, one worker. Focused
  scheduled-dispatch, job-worker, and v1 SMS suites passed again after the last
  edits: 19 tests.
- Web TypeScript (`npm run typecheck`), repository-wide ESLint
  (`npm run lint`), and the Next.js 16.3.8 production build all passed. Build
  generated 174 static pages. `git diff --check` passed; Git only reported its
  configured LF-to-CRLF conversion notices.
- The migration `20261010000000_scheduled_sms_dispatch` is additive, but it has
  not been deployed to any database. Run the reviewed migration through the
  normal staging/production database release process before using scheduled
  API persistence; local schema generation is not migration deployment.
- The scheduler uses the existing `/api/cron/process-jobs` endpoint, which
  requires `Authorization: Bearer $CRON_SECRET`. Deployment must invoke this
  endpoint frequently enough to meet the product's send-time expectations;
  this repository has no checked-in Vercel/Netlify cron manifest. Confirm the
  deployment scheduler and secret are configured before enabling schedules.
- The scheduled UI cancellation behavior was source-reviewed and linted, but
  authenticated browser interaction could not be verified because the user
  previously reported being unable to sign in. Chrome DevTools MCP remains
  unavailable in this environment.
- Live database migration, external cron invocation, provider delivery,
  authenticated browser journeys, consent/purpose policy, payment callback
  verification, and real gateway/hardware flows remain unverified. This does
  not close the larger cross-project audit or change the overall incomplete
  production-readiness status above.

## Deployment prerequisites continuation — 2026-10-10

### Database migration checks

- Inspected the environment target without displaying credentials. The
  checkout's `.env` points to a local development PostgreSQL database
  (`localhost:5432`, `master_template`), not staging or production. It contains
  65 public tables but no `_prisma_migrations` table. `prisma migrate status`
  therefore reports the baseline, recipient partial-status, and scheduled SMS
  migrations all as pending.
- A read-only `prisma migrate diff --from-config-datasource --to-schema` shows
  that the existing local database is missing more than the new scheduled SMS
  columns: it also lacks the `MomoPayment` table, `MessageStatus.PARTIAL`, and
  recipient-attempt columns/indexes. Applying the full chain to this existing
  database could collide with pre-existing tables and has been intentionally
  withheld. No existing database was modified.
- Applied all three migrations successfully to a newly created disposable
  local database, confirmed `prisma migrate status` reported “up to date”,
  then removed that temporary database. This verifies the committed migration
  chain from empty; it does not count as a staging or production migration.

### Deployment and live integration availability

- No deployment manifest, `.vercel` project link, Vercel CLI login, or
  deployment-provider selection is present in this checkout. The connected
  Vercel account API returned no accessible projects. The user has been asked
  which platform is the intended target before a cron configuration is added.
- The local environment has a `CRON_SECRET`, but no Pandora SMS username,
  password, or sender ID. There is no staging database or staging API URL
  configured. Therefore no live staging SMS delivery or actual scheduler
  invocation was attempted. Unit/integration tests and the isolated migration
  run are the available evidence for this continuation.
- Credentials pasted earlier in the conversation must be rotated in their
  provider consoles. No Upstash management MCP or GitHub token-revocation
  action is available in this environment, and the project has no deployment
  access to replace the corresponding staging/production values. Do not reuse
  the disclosed values; update local and deployed secret stores after rotation.
- The local application/test-account browser login remains unavailable, so
  authenticated browser verification is still blocked. The earlier user
  response said they could not sign in yet; browser MCP also remains
  unavailable.

## Local scheduled worker verification — 2026-10-10

- The user requested local implementation and testing only. No deployment,
  staging database, or production database was changed.
- Found that the standalone `npm run worker` entry point did not load `.env`,
  unlike the Next.js development server. Added `import "dotenv/config"` at
  the worker entry point so local database, Redis, and worker settings are
  available when launched from the package script. A local environment probe
  confirmed database and Upstash variables are loaded without printing them.
- The standalone `npm run worker` loop is the recurring local queue trigger;
  it polls due jobs continuously and includes `scheduled-sms.dispatch`. The
  Next.js `/api/cron/process-jobs` route is an alternate authenticated batch
  trigger, not a separate required scheduler for a local daemon setup.
- Verification after the worker startup fix: TypeScript passed; scoped ESLint
  passed; scheduled dispatcher, queue-worker isolation, cron auth, and cron
  scheduler test suites passed (4 files, 11 tests); Next.js 16.3.8 Turbopack
  reported no compilation issues; local login rendered with HTTP 200; the
  cron route returned 401 without authorization; browser console had no
  errors; accessibility scan reported 0 WCAG 2 A/AA violations; production
  build generated 174 static pages successfully. `git diff --check` passed
  (Git printed only the configured LF-to-CRLF conversion notice).
- The existing local `master_template` database remains untouched because its
  migration history is absent and its schema differs from the checked-in
  migration chain. A fresh disposable database was created for a follow-up
  migration recheck, but this attempt ended with a Prisma schema-engine error
  without diagnostic detail; the disposable database was removed. The earlier
  isolated migration run recorded above had succeeded, but this second attempt
  was not reproducible in this run. No worker was pointed at the drifted
  database and no provider send was attempted.
- Live SMS still needs Pandora credentials and a configured approved sender.
  Authenticated scheduled-page behavior still needs a signed-in local test
  account. The full audit, staging provider flow, and deployment readiness
  remain open.

## Cross-project local validation — 2026-10-10

- Refreshed all four checkout states. Web is on
  `feat/unified-ui-responsive-design-system` at `f2d7c17` with local worker and
  ledger changes. Mobile is on `master` at `dac45a4`, gateway on `master` at
  `230e20e`, and firmware on `main` at `3a4c3f6`; those three checkouts were
  clean and matched their configured upstream refs at inspection.
- Mobile and gateway share the same `EXPO_PUBLIC_API_URL` normalization to
  `/api/v1`, bearer authentication, timeout handling, and production HTTPS
  requirement. Static path comparison confirmed the mobile's auth, dashboard,
  SMS send, wallet, sender-ID, contacts, and gateway operations have matching
  web API route handlers. The gateway's pair, heartbeat, queue, incoming SMS,
  result, and firmware-check paths also match web route handlers. Firmware
  normalizes its saved backend URL to `/api/v1` and uses the same device API
  paths. This is source-contract verification, not proof of a live connection.
- Expo doctor passed 21/21 checks in both React Native projects. TypeScript and
  lint passed in mobile and gateway. Android JavaScript exports succeeded for
  both apps (1,669 mobile modules and 1,336 gateway modules). PlatformIO
  successfully compiled the ESP32 target: 54,480/327,680 bytes RAM and
  1,255,673/1,966,080 bytes flash.
- Mobile and gateway have no local `.env`; both `.env.example` files leave
  `EXPO_PUBLIC_API_URL` blank. Neither app config has an EAS project ID, and
  this machine has no Android SDK, `adb`, Gradle, or EAS CLI. Native gateway
  builds, signed mobile artifacts, device permissions, modem sending, and
  background execution were not verified.
- The mobile screen inventory currently covers login/MFA, dashboard, immediate
  campaigns, contacts/groups, wallet, reports, gateways, and settings. It does
  not implement the web app's scheduled-send management, drafts/templates,
  detailed delivery-report, support, or developer-key screens. This is a
  documented feature-parity gap, not a route-connectivity failure; user intent
  to make the mobile app an exact clone still needs a deliberate scope and
  implementation pass.
- The full web suite passed after correcting a load-sensitive test timeout:
  115 test files and 725 tests passed. The OpenAPI secret-marker check's
  timeout was raised from 5 to 15 seconds; its isolated contract file passed
  6/6, followed by the clean full-suite rerun.
- Refreshed package audit results: web has five high-severity findings in the
  development ESLint/Next lint-tool dependency chain and zero production
  dependency advisories. Mobile and gateway each report 36 advisories (21
  high, 15 moderate), including their production dependency trees. Suggested
  automated web remediation downgrades `eslint-config-next` across the
  installed Next.js major, so it was not applied. No compatible, low-risk fix
  for the mobile/gateway set was verified; these remain dependency release
  blockers to triage before deployment.
- Local source/build validation is strong, but deployment is not certified and
  the four projects are not yet proven error-free or fully feature-equivalent.
  Required items still include correctly
  migrating the intended database, setting API URLs and secrets in the actual
  deploy environments, valid SMS/payment provider configuration, authenticated
  user journeys, native Android/device testing, and a production cron/worker
  topology. Existing provider, payment callback, security-scan, and hardware
  blockers remain tracked above.

## Web and mobile styling / source-language audit — 2026-10-10

- Web uses Next.js 16.3.8, React 19, Tailwind CSS 4 through
  `@tailwindcss/postcss`, and the global Tailwind stylesheet. Application code
  under `src/` was already TypeScript (`.ts`/`.tsx`). Converted the four
  remaining project-authored JavaScript helper scripts in `scriptit/` to
  TypeScript; TypeScript now checks them as part of the root project. Toolchain
  configuration files remain in their expected JS/MJS formats.
- Mobile uses Expo 57, React Native 0.86, NativeWind 4.2.7, and Tailwind 3.4.
  Its routed screens and shared app modules are TypeScript (`.ts`/`.tsx`), the
  NativeWind Babel/Metro/CSS/type setup was present, and route styles already
  use NativeWind classes alongside dynamic theme/native style values. Expanded
  Tailwind's content paths to cover the actual TypeScript entry points and
  `lib/`, and replaced the unused starter `StyleSheet` in `App.tsx` with
  NativeWind classes.
- A baseline Expo web export failed because `react-native-web` was missing.
  Installed the SDK-compatible `react-native-web` dependency and explicitly
  selected Metro for the Expo web bundler, as required by the NativeWind web
  setup. Web export then succeeded; Android export also succeeded.
- Verification after these changes: mobile TypeScript, ESLint, Expo Doctor
  (21/21), web export, and Android export passed. Web TypeScript and scoped
  ESLint over converted scripts passed; the Next.js production build generated
  all 174 static pages.
- This is a stack/configuration and source-language alignment, not a claim that
  every existing web style is utility-only. The web app retains global/design
  token CSS and dedicated legacy/Swagger stylesheets; some established web and
  mobile screens retain inline values for dynamic measurements, runtime theme
  values, and native navigation controls. A full visual migration of those
  existing styles was not performed in this pass.

## Cross-project functionality continuation — 2026-10-10

- Re-reviewed the API contract used by the Android gateway and firmware,
  including device pairing, heartbeat, queue claim, incoming SMS, attempt
  results, and firmware update checks. The firmware's configured API origin is
  normalized to `/api/v1` by its Wi-Fi manager; the earlier suspected path
  mismatch was not a defect.
- Fixed a backend gateway-state bug: heartbeat updates can refresh telemetry
  while preserving an administratively suspended gateway. Admin commands are
  now returned only when the conditional status update confirms the gateway
  was not concurrently suspended.
- Added runtime validation for incoming device SMS payloads, normalized valid
  timestamps, bounded phone/message fields, and removed phone/message content
  from operational logs.
- Fixed the Android gateway's rolling throughput handling. The API value is
  SMS submissions per minute; the worker now enforces a rolling 60-second
  limit using a persistent SQLite reservation ledger, including migration of
  recent work from pre-existing local jobs. The queue API now includes the
  configured limit even when its queue is empty, so the worker cannot fall back
  to a higher default while processing locally retained jobs. This change is
  source-checked but still needs an Android native build and hardware
  verification.
- Replaced an unused unsafe router failover routine that re-routed every
  recipient after a five-minute timeout. The cron worker now conditionally
  finalizes stale gateway attempts as `SEND_UNCERTAIN`, preserves a newer
  recipient state, and never blindly retries an ambiguous send. Device result
  updates use a conditional write so a concurrent cron finalization cannot be
  overwritten by a late transaction. The timeout path is bounded to 100
  attempts per cron run.
- Fixed Android multipart SMS status handling: each segment now has a distinct
  broadcast identity, and carrier delivery receipts are aggregated across all
  parts before the backend is told the SMS was delivered. A native Android
  build and real modem/carrier tests remain unavailable in this environment.
- Verification: web TypeScript and repository lint passed; all 116 web unit and
  integration test files passed (728/728 tests), with two additional route
  tests passing separately after test collection. The Next.js production build
  passed and generated 174 static pages. Mobile and gateway TypeScript, lint,
  and Android JavaScript exports passed (1,678 and 1,682 modules respectively).
  PlatformIO compiled the ESP32 firmware (54,480/327,680 bytes RAM and
  1,255,673/1,966,080 bytes flash). Android native compilation remains
  unavailable because this machine has no Android SDK/Gradle setup.
- Chromium route-protection smoke passed 7/7 against the built production app
  on an isolated local port. An initial run reused an unrelated server on the
  default port and returned 404s; the isolated rerun verified the app's actual
  redirect behavior. Authenticated workflows and role-specific pages remain
  unverified without a signed-in test account.
- Scope limitation: repository inventories and integration paths were
  rechecked across four checkouts, but this is not a per-file, route-by-route
  review of every UI state or database query. Authenticated journeys remain
  unverified because no test user session was available. Live provider,
  financial callback, consent/compliance, device, credential-rotation, and
  managed deep-security-scan blockers remain open as recorded above.
- Follow-up gateway review: made rolling-window count, durable rate reservation,
  and local job claim one exclusive SQLite transaction. This closes the race
  between foreground and headless runtimes that could otherwise both pass the
  throughput check. Local failures before invoking the native modem now restore
  the local claim and release its reservation; failures after invocation remain
  `SEND_UNCERTAIN` to avoid duplicate SMS. The gateway now reports modem
  submission only after the native call returns successfully, and local send
  logs omit recipient data.
  The behavior follows the SQLite transaction model documented for
  [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/). Gateway
  TypeScript and lint checks passed, and the Android JavaScript bundle exported
  successfully (1,682 modules). Android native compilation and modem/carrier
  behavior remain unverified.

