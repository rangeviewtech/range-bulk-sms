# Next-Generation UI/UX Design & Responsive Engineering Rules

> **Repository**: Range Bulk SMS (`range-bulk-sms`)  
> **Entity**: Range View Technology Services Uganda Limited  
> **Target Audience**: AI Coding Agents, IDEs, and Human Engineers  
> **Version**: 2.0 (Next-Generation Enterprise Architecture)  
> **Core Mandate**: Build UI, UX, and APIs that reflect human designer craftsmanship (Linear, Stripe, Vercel caliber), avoiding generic "AI-generated" patterns, placeholders, and layout breakage.

---

## 1. Architectural Philosophy: Designer-Crafted vs. AI-Generated

### 1.1 Eliminating "AI-isms"
AI-generated interfaces often suffer from recognizable flaws. When generating code in this repository, you **MUST STRICTLY AVOID**:
1. **Generic Placeholders**: Never render `"Chart Placeholder"`, `"Coming Soon"`, or mocked empty divs. Always implement real, working components with actual data visualizations (e.g. using `recharts`).
2. **Arbitrary Spacing & Inconsistent Margins**: Do not use ad-hoc Tailwind spacing (e.g. `mt-[17px]`, `p-[23px]`). Adhere strictly to the standard spacing scale (`space-y-4`, `p-4 sm:p-6 lg:p-8`).
3. **Hardcoded Hex Colors**: Never write `#04648C` or `#FBCA07` inside page components unless referencing defined brand constants. Always consume semantic tokens (`bg-card`, `text-foreground`, `border-border`, `text-primary`).
4. **Unresponsive Tables & Overflow Horrors**: Never render an unconstrained `<table>` directly inside a flex or grid container without an `overflow-x-auto rounded-lg border` wrapper.
5. **Ignoring Extreme Screen Sizes**: Never test only on standard 1080p desktop. Every screen must be engineered mobile-first and verified from **320px width** (narrow mobile) up to **1920px+** (wide desktop).
6. **Fake Navigation**: Every button, link, and tab must lead to real routes, drawers, or modal dialogs with functioning state.

### 1.2 The Three Pillars of Range Enterprise Design
- **Precision**: Clean lines, subtle border strokes (`border-border/60`), subtle depth shadows (`shadow-xs` / `shadow-2xs`), and monospaced typography for financial and numeric data (`font-mono`).
- **Operational Confidence**: Telecom operators and enterprise clients manage high-stakes customer notifications. The UI must radiate stability, verified carrier statuses (MTN, Airtel, Safaricom), and clear delivery analytics.
- **Micro-Interactions**: Instant feedback on user actions (optimistic button states, loading spinners, tactile copy confirmations, and non-blocking toast notifications via `sonner`).

---

## 2. Responsive Viewport Matrix & Breakpoint Rules

The design system enforces strict responsive behavior across seven discrete screen classes:

| Viewport Class | Breakpoint Range | Primary Form Factor | Key Layout Directives |
|---|---|---|---|
| **Ultra-Compact Mobile** | `320px – 374px` | iPhone SE (1st gen), Galaxy Z Flip outer | Zero horizontal scroll. Hide secondary chips. Compact wallet badge (`2.0M UGX`). 100% width buttons. Single column. |
| **Standard Mobile** | `375px – 430px` | iPhone 13/14/15/16, Galaxy S24, Pixel | Minimum touch targets 44×44px. Collapsible accordion navigation. Sticky floating actions. Full-width cards. |
| **Phablet / Small Tablet** | `431px – 767px` | iPad Mini portrait, Foldables unfolded | 2-column KPI metric cards. Horizontal swipe indicator on data tables. Search and filters in wrap rows. |
| **Tablet Portrait** | `768px – 1023px` | iPad 10.2", iPad Air portrait | Fixed 90px left icon navigation (`md:block`). 2-column form layouts. Floating simulator hidden or docked. |
| **Tablet Landscape / Laptop** | `1024px – 1279px` | iPad Pro landscape, MacBook Air 13" | 2-column split layout (`grid-cols-1 lg:grid-cols-3` or `2:1`). Interactive live handset simulator visible. |
| **Standard Desktop** | `1280px – 1535px` | 1080p Monitor, MacBook Pro 16" | Full navigation pill with balance, SMS capacity chip, and quick `+ Top Up` action. 3 to 4 column KPI grids. |
| **Ultra-Wide Screens** | `1536px+` | 1440p, 4K Ultrawide | Maximum content container `max-w-7xl` or `max-w-[1600px]`, centered with balanced gutters (`mx-auto`). |

### 2.1 Universal Viewport Rules
1. **The 320px Mandate**:
   - Every page must render without a horizontal scrollbar at `320px` viewport width.
   - Text elements must use `truncate`, `break-words`, or `text-wrap` to prevent overflow.
   - Fixed top header (`#top-navigation-bar`) must gracefully adjust spacing (`px-2.5 sm:px-6`) and hide optional chips on `< sm`.
2. **Mobile-First Layout Construction**:
   - Write standard classes for mobile, followed by `sm:`, `md:`, `lg:`, `xl:` progressive enhancements.
   - Example: `className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"`
3. **Touch Targets & Ergonomics**:
   - Interactive elements (buttons, inputs, dropdown items, switches) on mobile must have a minimum clickable area of 40×40px (recommended 44×44px).
   - Use `active:scale-95` micro-scale animation for tactile touch response.

---

## 3. Component Architecture & Design Patterns

### 3.1 Top Navigation Bar (`#top-navigation-bar`)
- **Structure**:
  - Left: Mobile hamburger menu toggle (`md:hidden`) + Brand logo icon + "Range SMS".
  - Center: Spacer (`hidden md:block`).
  - Right: Responsive Wallet Badge + Universal Search (`Ctrl+K`) + Theme Toggle.
- **Wallet Badge Rules**:
  - Desktop (`sm:flex`): Glowing emerald icon + "BALANCE" label + Font-mono balance + SMS credits capacity chip (`lg:inline-flex`) + Quick `+ Top Up` link (`xl:inline-flex`).
  - Mobile (`flex sm:hidden`): Compact pill badge with emerald icon + formatted compact currency (e.g. `2.0M UGX` / `45k UGX`).
  - Mobile Drawer (`variant="drawer"`): Dedicated top-level card with available balance, SMS capacity pill, and full-width "Top Up Credits" button.

### 3.2 Tables & Data Grids
- **Container Structure**:
  ```tsx
  <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-2xs">
    <table className="w-full text-xs text-left">
      <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
        ...
      </thead>
      <tbody className="divide-y divide-border/40">
        ...
      </tbody>
    </table>
  </div>
  ```
- **Mobile Card Fallback**: For complex tables with > 5 columns, provide a mobile card view (`block sm:hidden`) that displays rows as individual card tiles.

### 3.3 Forms & Inputs
- **Input Styling**:
  - Height: `h-10 sm:h-11` for comfortable touch on mobile.
  - Border: `border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20`.
  - Font: `text-sm text-foreground placeholder:text-muted-foreground`.
- **Validation & Errors**:
  - Real-time inline feedback using `<InputError message={...} />`.
  - Shake / border-destructive highlights on submission errors.
- **Unsaved Changes Shield**:
  - Always guard draftable forms (e.g. SMS Compose, API Key creation, Webhook forms) with `useUnsavedChanges`.

### 3.4 Interactive Handset Simulator
- **Desktop (`lg:block`)**: Fixed or sticky iPhone handset simulator rendering real-time message previews, dynamic variable substitutions, GSM-7/Unicode segment calculations, and carrier stamps.
- **Mobile (`< lg`)**: Hidden by default, accessible via a prominent `"Preview Handset"` modal/drawer button.

---

## 4. Enterprise API Design & Presentation Standards

When designing, documenting, and presenting REST APIs for Range Bulk SMS, follow these enterprise standards:

### 4.1 URL Architecture & Resource Naming
- **Prefix**: `/api/v1/...` for external public APIs; `/api/...` for internal dashboard routes.
- **Nouns Only**: Use plural nouns (`/sms/send`, `/sms/bulk`, `/sms/schedule`, `/contacts`, `/sender-ids`, `/wallet/balance`, `/webhooks`).
- **HTTP Verbs**:
  - `POST`: Create resource or dispatch messages (`POST /api/v1/sms/send`).
  - `GET`: Read resource or query status (`GET /api/v1/balance`, `GET /api/v1/sms/{id}`).
  - `PUT`: Complete idempotent resource replacement (`PUT /api/v1/contacts/{id}`).
  - `PATCH`: Partial resource update (`PATCH /api/v1/webhooks/{id}`).
  - `DELETE`: Resource removal (`DELETE /api/v1/contacts/{id}`).

### 4.2 Standard Success Response Envelope
Every successful API response must return a standardized JSON structure:
```json
{
  "success": true,
  "data": {
    "messageId": "msg_01j7abc98124",
    "status": "QUEUED",
    "recipientCount": 1,
    "cost": 45.0,
    "currency": "UGX",
    "createdAt": "2026-09-25T08:30:00Z"
  },
  "meta": {
    "requestId": "req_01j981240abc",
    "rateLimitRemaining": 998
  }
}
```

### 4.3 Standard Error Envelope (RFC 9457 Problem Details)
All client and server errors must adhere strictly to **RFC 9457 HTTP Problem Details**:
```json
{
  "type": "https://docs.rangesms.com/errors/insufficient-balance",
  "title": "Insufficient Prepaid Balance",
  "status": 402,
  "detail": "Your wallet balance of 200 UGX is insufficient to dispatch 10 SMS messages (cost: 450 UGX).",
  "code": "insufficient_balance",
  "instance": "/api/v1/sms/send",
  "requestId": "req_01j981240abc",
  "errors": {
    "required": 450,
    "available": 200,
    "currency": "UGX"
  }
}
```

### 4.4 Idempotency Standards
- High-throughput payment and messaging endpoints **MUST** support the `Idempotency-Key` HTTP header.
- If a client retries a request with the same `Idempotency-Key` within 24 hours, return the cached result with `200 OK` or `201 Created` without duplicate credit deduction or double-sending.

### 4.5 Security & Authentication Headers
- API requests authenticate via Bearer token: `Authorization: Bearer rsms_live_...` or `Authorization: Bearer rsms_test_...`.
- Tokens are hashed using SHA-256 before database lookup (never stored in plaintext).
- Webhook payloads are signed using HMAC-SHA256: `X-Range-Signature: t=1695631200,v1=5d41402abc4b2...` with timestamp replay protection (maximum 300-second drift).

### 4.6 Developer Portal Presentation ([`/api/docs`](file:///c:/Users/alilu/OneDrive/Documents/range-bulk-sms/src/app/api/docs/page.tsx))
- **Hero Code Showcase**: Displays the primary **SMS Send** snippet in cURL, Node.js (Axios), Python (Requests), and PHP (cURL).
- **Interactive Sandbox Toggle**: Switch between Sandbox (mock carrier dispatch) and Production (live carriers).
- **Complete Endpoints Catalog**:
  1. `SingleSmsSend` (`POST /api/v1/sms/send`)
  2. `BulkSmsSend` (`POST /api/v1/sms/bulk`)
  3. `ScheduleSms` (`POST /api/v1/sms/schedule`)
  4. `WalletBalance` (`GET /api/v1/balance`)
  5. `SenderId` (`POST /api/v1/sender-ids`)
  6. `Contact` (`POST /api/v1/contacts`)
  7. `WebhookDeliveryEvent` (`GET /api/webhooks/sms/delivery`)
  8. `WebhookSimulateRequest` (`POST /api/v1/sandbox/simulate-delivery`)

---

## 5. Visual Tokens & Theme Specifications

### 5.1 Color Tokens Table
All components consume variables defined in `src/app/globals.css`:

| Token | Light Mode Value | Dark Mode Value | Usage |
|---|---|---|---|
| `--background` | `hsl(0 0% 100%)` | `hsl(222 47% 11%)` | Main app background canvas |
| `--foreground` | `hsl(218 30% 12%)` | `hsl(210 40% 98%)` | Primary high-contrast text |
| `--card` | `hsl(0 0% 100%)` | `hsl(223 47% 14%)` | Cards, modals, containers |
| `--border` | `hsl(214 32% 91%)` | `hsl(217 33% 20%)` | Card and input border strokes |
| `--primary` | `hsl(48 98% 51%)` | `hsl(48 98% 51%)` | Brand Yellow (`#FBCA07`) |
| `--primary-foreground` | `hsl(218 30% 12%)` | `hsl(218 30% 12%)` | Contrast dark text on yellow buttons |
| `--muted` | `hsl(210 20% 96%)` | `hsl(223 47% 18%)` | Table headers, secondary pill tags |
| `--muted-foreground` | `hsl(215 16% 47%)` | `hsl(215 20% 65%)` | Subtitles, labels, helpers |
| `--emerald-accent` | `hsl(160 84% 39%)` | `hsl(160 84% 39%)` | Financial amounts, wallet indicators |

### 5.2 Typography Scale
- **Display / Headers**: `font-sans font-bold tracking-tight text-foreground` (`text-xl sm:text-2xl lg:text-3xl`).
- **Body & Controls**: `font-sans text-xs sm:text-sm text-foreground`.
- **Numbers & Metrics**: `font-mono font-bold text-foreground` (balances, phone numbers, segment counts, HTTP status codes, IDs).
- **Labels & Microcopy**: `text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground`.

---

## 6. Quality Gates & Release Checklist

Every change, new page, or feature addition MUST satisfy this verification gate before being declared complete:

1. **TypeScript Typecheck**:
   ```bash
   npx tsc --noEmit
   ```
   *Requirement: 0 errors.*
2. **ESLint Validation**:
   ```bash
   npx eslint . --max-warnings 0
   ```
   *Requirement: 0 warnings, 0 errors.*
3. **Unit & Integration Test Suite**:
   ```bash
   npx vitest run
   ```
   *Requirement: All test suites (38+ files, 325+ tests) must pass 100%.*
4. **DevTools MCP Multi-Device Responsive Inspection**:
   - Mobile: `320×650` and `375×812` (zero overflow, touch targets >= 44px).
   - Tablet: `768×1024` (proper sidebar spacing, stacked cards).
   - Desktop: `1024×768`, `1280×800`, `1440×900` (clean split columns, full navigation pill).
5. **Theme Parity Check**:
   - Inspect and confirm visual contrast in both **Dark Mode** and **Light Mode**.
