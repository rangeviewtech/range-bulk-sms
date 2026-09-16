# Project audit and remediation

Audit date: 2026-09-08. This report describes the fixes in this working checkout. It is not a claim that every business workflow or third-party integration has passed production acceptance testing. The checkout contained extensive existing changes before the audit; those changes were preserved.

## Architecture and data flow

- Next.js 16.3.2 App Router with React 19 and TypeScript. Route groups separate public authentication screens from the protected dashboard. Proxy checks signed session claims before protected navigation; server authorization also checks the database session and account state.
- Public pages include the landing page, authentication, legal pages, and design-system examples. Protected routes cover the dashboard, fleet tracking, reports, charts, profile, settings, notifications, and communications administration.
- Authentication uses server actions, signed HttpOnly cookies, and PostgreSQL-backed sessions. Password authentication creates a short-lived pending verification session where required; successful verification creates a full session. Role/permission checks protect administrative operations.
- Prisma 7 with the PostgreSQL adapter provides persistence. The generated client reflects the current schema, including sessions, verification records, notifications, preferences, queued jobs, schedules, and execution records.
- Notification dispatch reads user destinations/preferences, resolves templates, and enqueues delivery jobs. The authenticated cron endpoint evaluates schedules and processes jobs. Providers handle SMTP, Pandora SMS, Telegram, WhatsApp, and in-app delivery. Telegram account linking uses a secret-protected webhook.
- React state and local storage manage local UI preferences. Shared components, CSS variables, Tailwind, Radix primitives, and legacy styles define the interface. Some fleet/report/settings screens still contain demonstration data and incomplete service integrations.
- The service worker caches only eligible public static assets. It excludes HTML, RSC responses, APIs, and private/no-store responses.
- Vitest covers units and mocked API integration. Playwright covers public navigation, access controls, themes, design-system rendering, and automated accessibility checks on desktop/mobile Chromium.

## Findings and fixes

### Authentication and authorization

1. The login form simulated success without calling the login action. It now submits credentials and CAPTCHA to the server and handles authentication errors and verification redirects.
2. Social login created shared demonstration identities without an OAuth exchange. That path now fails explicitly and issues no session. A real OAuth implementation is still required before enabling social login.
3. MFA verification treated the otplib result object as a boolean. It now requires the explicit valid flag and validates six-digit input.
4. OTP endpoints trusted supplied user IDs and could fall back to unchallenged verification. They now require a matching, temporary, password-authenticated session, active user state, a configured permitted channel, and rate limits. Authenticator-enabled users must satisfy the authenticator challenge.
5. Session authorization did not consistently enforce pending MFA, account status, database revocation, or screen lock. Server authorization now enforces these states; user data selected for the session excludes credential fields.
6. Temporary verification sessions now expire after ten minutes. Full sessions retain the established seven-day lifetime. Creating a session rotates the current browser session.
7. Screen lock depended on a client-writable cookie. The locked state is now signed and changed by server actions; unlock verifies the stored hashed PIN.
8. Protected route matching and dashboard authorization were incomplete. Protected fleet/report/chart/notification routes now have consistent access gates; communications administration checks explicit permissions.
9. Password-reset consumption and session revocation could race. Reset now consumes a live token atomically in a transaction, updates the password, and revokes sessions/reset tokens.
10. Security settings showed simulated controls. MFA enrollment, confirmation, disable, and PIN changes now use authenticated server actions. Changing MFA state and revoking old sessions occur in one database transaction.
11. CAPTCHA omission and unavailable configuration were not consistently handled. Production verification fails closed; configured verification checks status, explicit success, and timeout. Form/server validation remains authoritative.
12. Profile identity now comes from the authenticated account rather than a fixed demonstration identity.
13. New-device detection excludes the current pending session so it cannot hide the event it is meant to detect.

### APIs, messaging, and background processing

14. Notifications API now authenticates requests, validates strict action payloads, scopes updates to the owner, returns sanitized errors, and prevents response caching.
15. Cron authorization compares byte buffers safely and returns a generic failure response.
16. Telegram webhook rejects missing/mismatched secrets, validates private-chat linking input, and consumes linking tokens atomically with the user update.
17. Queue insertion uses atomic idempotent upsert. Schedule advancement and enqueue/execution recording use an atomic compare-and-update transaction keyed to the scheduled run time.
18. Workers claim pending/retrying jobs using PostgreSQL locking, validate payloads, reject unsupported types, record retry/dead-letter outcomes, and release leases conditionally on ownership.
19. Serial batches renew remaining job leases and skip jobs they no longer own. Stale-job recovery increments attempts and dead-letters exhausted jobs instead of retrying indefinitely.
20. Dispatch includes verified Telegram destinations and enforces WhatsApp consent. Channel-specific idempotency keys prevent one channel from suppressing another.
21. Unknown templates now fail instead of serializing arbitrary payloads. Email/Telegram substitutions escape HTML, and password-reset links target the actual reset route.
22. Active delivery providers fail on missing configuration instead of reporting simulated success. Network operations have timeouts. SMTP/Pandora support the variable names already documented in the environment example as compatibility aliases.
23. Critical queue wake-ups use Next.js background work handling rather than a floating request.
24. Notification settings validate phone numbers, persist preferences transactionally, and use verified Telegram linking rather than accepting arbitrary chat IDs.
25. Error handling recognizes real AppError instances. Logging redacts additional credential/message fields. Request IDs are forwarded to application handlers as well as responses.

### Rendering, caching, accessibility, and maintenance

26. Local-storage state uses a server-safe snapshot and synchronizes hook instances; consecutive updates read current storage. Zero-delay debounce now works.
27. The notification icon has an accessible label; notification navigation only accepts safe internal paths.
28. CSP permits the actual CAPTCHA/map resources and limits unsafe-eval to development. Inline-script permission remains; a nonce migration was not introduced in this pass.
29. Swagger initialization no longer polls for a missing preset; it handles script failure and disables remote spec validation.
30. The service worker no longer caches authenticated content and clones responses before asynchronous cache writes consume them.
31. Design-system swatches use complete static Tailwind classes, ensuring production CSS includes their semantic colors.
32. Tests now exercise behavior instead of conditional skipping; accessibility tests are included by the Playwright configuration. An empty security-preference test was replaced with a real assertion.
33. Dependency overrides update deepmerge-ts, mysql2, and fast-uri to patched versions. Prisma schema validation and the production build exercise compatibility. Revisit overrides when upstream packages incorporate these fixes.
34. Normalize CSS is now placed in the base cascade layer so it cannot erase styled-link backgrounds. Existing blue actions use a readable foreground token, cookie policy links use semantic text colors, decorative footer separators are hidden from assistive technology, and home actions stack on narrow screens.
35. Playwright accepts PLAYWRIGHT_PORT to isolate the app from unrelated development servers.
36. Deployment guidance now identifies the supported Node runtime, standalone Docker prerequisite, provider variables, production Redis/CAPTCHA requirements, and separate build/lint checks.

## Verification

- TypeScript: passed (standalone compiler and production build type-check stage).
- ESLint: full project passed with zero warnings; final touched-file lint recorded separately.
- Vitest: 28 files, 92 tests passed. Database/provider dependencies in these tests are mocked; this is not a live delivery test.
- Dependency audit: zero reported vulnerabilities in the resolved lockfile at verification time.
- Production build: compilation, type checking, page generation, and route summary completed successfully after replacing the old generated cache. The initial attempt failed with a Windows/OneDrive EPERM while removing the old cache; the old cache was preserved outside the checkout.
- Next.js runtime diagnostics: the endpoint identified this checkout on port 3107 and returned empty compilation, configuration, and session-error lists. Browser React introspection did not return a usable component tree, so no render-count benchmark is claimed.
- Prisma: schema validation passed during this audit. A read-only database connection succeeded. No production migration, schema reset, or live account modification was performed.
- Browser verification: all 28 checks passed on desktop and mobile Chromium, including six automated accessibility scans, public navigation, six protected-route redirects, API access control, unavailable social sign-in, theme persistence, and all six design-system sections. Tests ran on dedicated port 3107 after identifying an unrelated app on port 3000. Authenticated workflows require a user-operated test-account sign-in and have not been accepted as verified.

Detailed command logs are in the current user's temporary directory under master-project-audit. They are verification artifacts, not committed source files.

## Remaining concerns and acceptance work

- No original production URL or signed-in baseline was available for a full production-parity comparison. The audit preserved the current design; it does not certify every page against the original product.
- Signed-in login/MFA enrollment/PIN/password reset/role combinations and account notification settings still need staging acceptance with a test account. Existing unit tests validate key failure and authorization cases, not every browser workflow.
- SMTP, SMS, Telegram, and WhatsApp delivery must be tested in an authorized staging environment. Provider templates, API versions, credentials, and hosting time limits remain deployment-specific. The audit did not send messages to real recipients.
- Queue delivery is at-least-once. A process failure after provider acceptance but before recording success can duplicate a message; provider-supported idempotency or an outbox/delivery-receipt design is needed for stronger guarantees. PostgreSQL lock/recovery behavior needs concurrent-worker integration testing on an isolated database.
- Existing demonstration fleet/report screens and legacy placeholder services need product requirements and real integrations. Replacing them with invented business logic would change behavior and was not attempted.
- Review the migration history against the current schema before deployment. Generated types do not prove an existing production database has the necessary tables/columns.
- If the old fake social-login or vulnerable MFA implementation was deployed, review affected sessions/accounts and revoke them through the normal administration process. Disabling future bypasses does not retroactively establish the legitimacy of older sessions.
- Production deployment must supply working distributed rate limiting and CAPTCHA configuration. A missing dependency denies access rather than silently weakening authentication.
- CSP still permits inline scripts. Swagger loads a remote major-version bundle. Consider self-hosting/pinning that asset and a separately tested nonce policy.
- Public SEO metadata and crawl policy need a verified production origin and intended indexable-page inventory. No sitemap/robots generator was found in the app. Avoid indexing protected/demo pages by accident.
- Automated accessibility scans do not replace keyboard/screen-reader review or full contrast/responsive testing across all authenticated screens. Firefox and production performance benchmarks remain outside the completed browser run.
- The checkout's OneDrive-managed generated files caused an EPERM and slow-filesystem warnings. A non-synced local checkout is preferable for reliable build/test iteration.

## Performance and maintainability impact

The changes remove polling and simulated work, bound queue claims/retries and external request duration, make idempotency atomic, avoid private offline caching, and prevent lost local-storage updates. They improve correctness and operational predictability. No before/after bundle, database-load, or Web Vitals benchmark was performed, so no numeric performance improvement is claimed.
