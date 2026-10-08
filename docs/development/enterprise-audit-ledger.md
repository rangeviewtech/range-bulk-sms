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
| Framework baseline | Next.js 16.3.5 App Router; React and React DOM 19.2.8; TypeScript 5 range. `package.json`/lockfile now request Next.js 16.3.8, but `node_modules` could not be updated and remains 16.3.5. |
| Database | PostgreSQL through Prisma ORM 7.9.1 and `@prisma/adapter-pg`; schema at `prisma/schema.prisma`; generated client under `src/generated/prisma`. |
| UI | React, Tailwind CSS 4, Radix primitives, local design-system and shared UI modules. |
| Validation | Zod 3, React Hook Form and `@hookform/resolvers`. |
| Tests | Vitest 4, Testing Library, Playwright 1.62, axe-core. Both `src/__tests__` and `tests/` are present. |
| Integrations visible in manifests/source inventory | Upstash Redis/ratelimit, Nodemailer, Google GenAI, Turnstile, Telegram, WhatsApp, SMS providers, payment and device gateway webhooks. Full credential-free inventory pending. |
| Browser verification | Chrome DevTools MCP is not exposed. Playwright is installed, but its configured server could not start because the `next` shim is missing. The existing localhost server was inspected in the Codex browser and displayed a Next build overlay (`Can't resolve '../route-cache-key'`) with console errors. |
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

Tracked/file inventory: **958 paths** reported by `rg --files` with common
ignored generated/vendor directories excluded; this includes generated Prisma
client output and test reports and is therefore not a count of maintained
source files. A Git-index based per-path classification is pending before
claiming exhaustive file review.

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
`/api/geo`, `/api/variables`, and `/api/ai`. A generated manifest is stored in
`docs/development/audit-inventory/`: 84 page files and 110 API Route Handler
files. It records concrete paths and HTTP method exports; guard and validation
columns are lexical screening only and must be checked against helper
implementations and each endpoint's intent.

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
- Two mobile product/API ambiguities remain open: wallet top-up currently
  targets an admin-only direct-credit endpoint but promises a payment-provider
  flow; the production payment initiation contract/provider details are
  needed before implementing the financial workflow. The mobile “Pair Phone”
  action is still a placeholder and needs confirmation whether it should list
  and pair existing user-owned gateway records.

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
- The mobile push-notification preference remains an unimplemented UI-only toggle: the web preference model has no `PUSH` channel or push delivery service. Define product/provider behavior before adding a truthful API-backed control.

- Removed fabricated mobile telemetry totals and hard-coded carrier percentages. Added user-scoped `/api/v1/reports/summary` period aggregation from recipient delivery records and changed the mobile report screen/share text to use actual API results. Report API integration, status-rollup unit, SMS API integration, and unsupported gateway dispatch tests passed (3 files, 10 tests). Final web TypeScript, full ESLint (`--max-warnings 0`), and production Next build all passed; the build includes `/api/v1/reports/summary`.

