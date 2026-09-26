# Range Bulk SMS — UI/UX Design System & Responsive Architecture Specification

> **Version:** 2.0.0  
> **Status:** Active & Enforced  
> **Audience:** Frontend Engineers, UI/UX Designers, Product Architects, AI Pair Programmers  
> **Governance:** Mandatory reading before introducing, modifying, or refactoring UI components or routes.

---

## 1. Product Design Vision & Principles

The Range Bulk SMS platform is an enterprise-grade communications infrastructure application designed for organizations, telecom partners, developers, and field agents across Sub-Saharan Africa and international markets.

### Core Principles

1. **Enterprise Clarity Over Decoration**  
   Every element on the screen exists to communicate data, state, or afford action. Interfaces should feel sharp, modern, intentional, and purposeful—not generically AI-generated or adorned with frivolous ornaments.

2. **Zero-Overflow Mobile-First Reflow**  
   Mobile viewport support is non-negotiable. At viewports as narrow as 320px (iPhone SE, budget Android devices, feature phones running Chromium WebViews), there must be **exactly zero accidental horizontal document overflow** (`document.documentElement.scrollWidth === clientWidth`).

3. **Dual Table-Card Responsive Architecture**  
   Tabular data exceeding 4 columns must automatically reflow into a high-density, touch-friendly card deck on mobile viewports (`< 768px`), reserving traditional multi-column tables for desktop screens (`≥ 768px`).

4. **Deterministic Token Compliance**  
   Arbitrary hex codes, bespoke shadows, and ad-hoc paddings are strictly forbidden. All styles must derive from canonical CSS design tokens defined in `src/app/globals.css` and `src/design-system/tokens/colors.ts`.

5. **Universal Accessibility (WCAG 2.2 AA Minimum)**  
   Every interactive element must provide an explicit accessible name (`aria-label`, visible text, or `aria-labelledby`), touch targets must meet the minimum 44×44px interactive bounds, and focus outlines must remain clearly visible in both light and dark themes.

6. **Developer-First API Elegance**  
   The developer ecosystem (API keys, quotas, rate limits, webhooks, docs) must reflect top-tier developer platforms (Stripe, Twilio, GitHub), featuring instant copy-to-clipboard, policy indicators, quota usage bars, and interactive curl/SDK snippets.

---

## 2. Design Tokens & Semantic Color System

All colors are defined via CSS custom variables (`hsl(var(--token))`) and linked to Tailwind CSS utilities. Never use raw hex codes (e.g. `#1e293b`) directly in component JSX.

### Color Tokens

| Semantic Token | Light Mode Value | Dark Mode Value | Usage |
|---|---|---|---|
| `--background` | `hsl(0 0% 100%)` | `hsl(222.2 84% 4.9%)` | Root page background |
| `--foreground` | `hsl(222.2 84% 4.9%)` | `hsl(210 40% 98%)` | Primary body typography |
| `--card` | `hsl(0 0% 100%)` | `hsl(222.2 84% 6.5%)` | Elevated surface containers |
| `--card-foreground` | `hsl(222.2 84% 4.9%)` | `hsl(210 40% 98%)` | Text within card containers |
| `--popover` | `hsl(0 0% 100%)` | `hsl(222.2 84% 6.5%)` | Dropdowns, tooltips, flyouts |
| `--popover-foreground` | `hsl(222.2 84% 4.9%)` | `hsl(210 40% 98%)` | Text inside flyouts |
| `--primary` | `hsl(221.2 83.2% 53.3%)` | `hsl(217.2 91.2% 59.8%)` | Primary brand action, key CTAs |
| `--primary-foreground` | `hsl(210 40% 98%)` | `hsl(222.2 47.4% 11.2%)` | Text on primary brand backgrounds |
| `--secondary` | `hsl(210 40% 96.1%)` | `hsl(217.2 32.6% 17.5%)` | Subordinate action surfaces |
| `--secondary-foreground` | `hsl(222.2 47.4% 11.2%)` | `hsl(210 40% 98%)` | Text on secondary surfaces |
| `--muted` | `hsl(210 40% 96.1%)` | `hsl(217.2 32.6% 17.5%)` | Subtle backdrops, chips, dividers |
| `--muted-foreground` | `hsl(215.4 16.3% 46.9%)` | `hsl(215 20.2% 65.1%)` | Captions, timestamps, placeholders |
| `--accent` | `hsl(210 40% 96.1%)` | `hsl(217.2 32.6% 17.5%)` | Active hover backgrounds |
| `--accent-foreground` | `hsl(222.2 47.4% 11.2%)` | `hsl(210 40% 98%)` | Text on active hover backgrounds |
| `--destructive` | `hsl(0 84.2% 60.2%)` | `hsl(0 62.8% 30.6%)` | Errors, delete triggers, alert states |
| `--destructive-foreground` | `hsl(210 40% 98%)` | `hsl(210 40% 98%)` | Text on destructive buttons |
| `--border` | `hsl(214.3 31.8% 91.4%)` | `hsl(217.2 32.6% 17.5%)` | Structural borders, card borders |
| `--input` | `hsl(214.3 31.8% 91.4%)` | `hsl(217.2 32.6% 17.5%)` | Form field outline borders |
| `--ring` | `hsl(221.2 83.2% 53.3%)` | `hsl(224.3 76.3% 48%)` | Interactive focus rings |

### Status Badges & Functional Accents

- **Success / Completed / Active:**  
  `bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20`
- **Warning / Scheduled / Pending:**  
  `bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20`
- **Danger / Failed / Inactive / Rate Limited:**  
  `bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20`
- **Info / Draft / Processing:**  
  `bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20`

---

## 3. Responsive Breakpoint Strategy

Range Bulk SMS employs a 6-tier responsive grid system built mobile-first:

```
[320px] ─── xs ─── [640px] ─── sm ─── [768px] ─── md ─── [1024px] ─── lg ─── [1280px] ─── xl ─── [1536px] ─── 2xl
 Narrow Mobile     Phablet          Tablet Portrait     Laptop/Desktop      Large Display      Ultra-wide
```

### Breakpoint Matrix

| Viewport Width | Class Prefix | Layout Behavior | Navigation Mode |
|---|---|---|---|
| `320px - 639px` | `< sm:` | 1-column stacked, full-width inputs, touch drawer, card decks | Hidden sidebar, sticky mobile top bar, Sheet drawer |
| `640px - 767px` | `sm:` | 2-column metric cards, inline search + action buttons | Hidden sidebar, sticky mobile top bar, Sheet drawer |
| `768px - 1023px` | `md:` | Multi-column data tables, split form grids, 3-stat rows | Collapsed icon sidebar (64px) or Drawer |
| `1024px - 1279px` | `lg:` | Full desktop sidebar (260px), 4-stat metric rows, preview panels | Persistent fixed sidebar |
| `1280px+` | `xl:` | 12-column complex layouts, split composer + live phone preview | Persistent fixed sidebar + max-w container |

### Strict Responsive Invariants

1. **No Hardcoded Pixel Widths on Containers:**  
   Never write `w-[800px]` or `min-w-[700px]` on root elements. Always pair with `max-w-full`, `w-full`, or `overflow-x-auto`.
2. **Horizontal Safe Margins:**  
   Page content containers must always feature padding: `px-3 sm:px-6 lg:px-8`.
3. **Word Break & Text Truncation:**  
   Every phone number, API key, UUID, and hash must have `break-all`, `truncate`, or `font-mono text-xs overflow-hidden` to prevent pushing card borders outwards.

---

## 4. Layout Architecture: RangeShell & RangeSidebar

### Structure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ RangeSidebar (Desktop: 260px Fixed / Mobile: Hidden)           │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Top Header Bar (Height: 64px)                           │   │
│   │   [Mobile Menu Button] [Logo]     [Theme] [Wallet] [User] │   │
│   └─────────────────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Main Content Area (min-w-0, flex-1, overflow-y-auto)     │   │
│   │   PageHeader (Title, Description, Quick Actions)         │   │
│   │   Stat Cards Grid (1 col mobile -> 4 cols desktop)      │   │
│   │   Main Card (Mobile Card Deck / Desktop Data Table)     │   │
│   │   Pagination Footer (Responsive page jump + size select)│   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Rules

1. **Header Reflow Safeguards (`src/components/layout/range-sidebar.tsx`):**
   - Padding must be responsive: `px-2.5 sm:px-6`.
   - Action buttons right-side gap must scale: `gap-1.5 sm:gap-3`.
   - Brand logo title text hides below 400px (`hidden min-[400px]:inline`) while preserving the 32×32px brand icon.
   - Quick "Send SMS" top-bar button truncates text on mobile: `<span className="hidden sm:inline">Send SMS</span>`.

2. **Mobile Drawer (`Sheet`):**
   - Must cover `w-[280px] sm:w-[320px]`.
   - Must close automatically on navigation item click (`setMobileOpen(false)`).
   - Must support swipe-to-dismiss and click-outside backdrop dismissal.
   - Must render active wallet balance and quick top-up CTA at bottom of drawer.

---

## 5. Dual Table / Card Transformation Pattern

Whenever presenting tabular data with more than 3 columns, adhere strictly to the Dual Table/Card pattern:

```tsx
<Card>
  <CardContent className="p-0">
    {items.length === 0 ? (
      <EmptyState ... />
    ) : (
      <>
        {/* 1. Mobile View (< 768px): Stacked High-Density Cards */}
        <div className="block md:hidden divide-y divide-border">
          {items.map((item) => (
            <div key={item.id} className="p-4 space-y-2.5 hover:bg-muted/20 transition-colors">
              {/* Primary Header Row */}
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-foreground text-sm line-clamp-1">
                  {item.primaryLabel}
                </span>
                <Badge variant="outline" className="text-[11px] shrink-0">
                  {item.status}
                </Badge>
              </div>

              {/* Data / Metric Rows */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/40 p-2.5 rounded-lg border border-border/50 text-xs">
                <span>{item.secondaryLabel}</span>
                <span className="font-mono">{item.value}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 flex-1">
                  Primary Action
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Delete">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Desktop View (≥ 768px): Full Multi-Column Data Table */}
        <div className="hidden md:block w-full overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Column 1</TableHead>
                <TableHead>Column 2</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.primaryLabel}</TableCell>
                  <TableCell>{item.value}</TableCell>
                  <TableCell className="text-right">...</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </>
    )}

    {/* Shared Pagination Controls */}
    <Pagination
      page={page}
      totalPages={totalPages}
      pageSize={pageSize}
      totalItems={totalItems}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
    />
  </CardContent>
</Card>
```

---

## 6. Form Inputs, Validation & Touch Targets

### Input Sizing & Ergonomics

1. **Minimum Touch Targets:**  
   All clickable elements (buttons, select triggers, checkboxes, icon buttons) must have a bounding box of at least **44×44px** on touch viewports, or provide visual padding equivalent to standard touch targets.
2. **Input Font Size on iOS:**  
   Input font sizes must **never be smaller than 16px (`text-base` or `text-sm sm:text-xs`)** to prevent automatic iOS Safari viewport zoom upon input focus.
3. **Helper & Error Text:**  
   Every error message must be rendered via `<InputError id="..." message="..." />` and linked to the input via `aria-describedby` and `aria-invalid="true"`.
4. **Phone Input Formatting:**  
   Use `<SinglePhoneInput />` or `<PhoneRecipientsInput />` with embedded country selector, automatic E.164 normalization, and live carrier badge detection.

---

## 7. Modal, Dialog & Sheet Guidelines

1. **Responsive Dialog Viewport:**  
   Dialogs must always use responsive max widths:
   `className="w-[calc(100%-2rem)] max-w-lg sm:max-w-xl p-0 overflow-hidden"`
2. **Scroll Containment:**  
   Dialog bodies must be wrapped in `<DialogBody className="max-h-[75vh] overflow-y-auto p-4 sm:p-6">` to prevent modal content from expanding off-screen on landscape mobile devices.
3. **Action Button Stacking:**  
   Modal footers must stack vertically on mobile and align horizontally on desktop:
   `className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 p-4 sm:p-6 border-t"`
   Each button should take `w-full sm:w-auto`.

---

## 8. Typography Scales & Hierarchy

The application utilizes Inter and the system native font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`).

| Level | Size (Desktop) | Size (Mobile) | Weight | Line Height | Usage |
|---|---|---|---|---|---|
| **H1** | 24px (`text-2xl`) | 20px (`text-xl`) | Bold (700) | 1.2 | Page title |
| **H2** | 18px (`text-lg`) | 16px (`text-base`) | Semibold (600) | 1.3 | Card / section header |
| **H3** | 15px (`text-base`) | 14px (`text-sm`) | Semibold (600) | 1.4 | Group / modal title |
| **Body** | 14px (`text-sm`) | 13px (`text-xs`) | Regular (400) | 1.5 | Standard body text |
| **Caption** | 12px (`text-xs`) | 11px (`text-[11px]`) | Medium (500) | 1.4 | Timestamps, badge text |
| **Code** | 12px (`text-xs`) | 11px (`text-[11px]`) | Medium (500) | 1.5 | API keys, references, JSON |

---

## 9. Developer API Section Design Standards

The developer section (`/developer/api-keys`, `/developer/webhooks`, `/api/docs`) adheres to strict quality guidelines:

1. **Multiple Key Architecture:**  
   Users can create unlimited scoped API keys for distinct applications (e.g., E-Commerce Staging, Mobile App Production, POS Billing).
2. **Quota Policy Display:**  
   - Unlimited / Uncapped keys show `∞ Uncapped` in primary color.
   - Quota-capped keys show formatted badges (e.g. `10,000 / week`, `50,000 / month`) accompanied by progress indicators.
3. **One-Time Secret Reveal:**  
   API secret keys are revealed exactly once upon creation in a secured modal with single-click copy and warning notices.
4. **Key Filtering & Search:**  
   Keys must be instantly searchable by name, prefix (`rb_live_...`), and filterable by status (`Active`, `Revoked`, `Expired`).
5. **Interactive Docs:**  
   All code snippets must support multi-language toggles (cURL, Node.js, Python, PHP), with dynamic placeholder replacement and one-click copy.

---

## 10. Accessibility (a11y) Verification Protocol

1. **Accessible Names:**  
   Every button without visible text must include an explicit `aria-label`:
   `<Button variant="ghost" size="icon" aria-label="Edit campaign"><Pencil className="w-4 h-4" /></Button>`
2. **Focus Visibility:**  
   Never suppress focus rings (`outline-none`) without adding `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.
3. **Contrast Compliance:**  
   All text must achieve a minimum contrast ratio of **4.5:1** against its background in both light and dark themes (3:1 for large text ≥ 18pt).
4. **Form Labels:**  
   All inputs must have an associated `<Label htmlFor="...">` or `aria-label`.

---

## 11. Chrome DevTools MCP Audit Checklist

Before committing any UI change, developers and AI agents must run the following automated verification using Chrome DevTools MCP:

```javascript
// Verification snippet to run via evaluate_script
(() => {
  const width = window.innerWidth;
  const scrollW = document.documentElement.scrollWidth;
  const clientW = document.documentElement.clientWidth;
  const overflow = scrollW > clientW;
  const overflowingElements = Array.from(document.querySelectorAll('*'))
    .filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.right > width + 1 && window.getComputedStyle(el).overflow !== 'hidden';
    })
    .map(el => ({ tag: el.tagName, class: el.className, right: el.getBoundingClientRect().right }));

  return {
    viewport: width + 'px',
    clientWidth: clientW,
    scrollWidth: scrollW,
    hasHorizontalOverflow: overflow,
    overflowingCount: overflowingElements.length,
    elements: overflowingElements.slice(0, 5)
  };
})();
```

**Passing Criteria:**
- `hasHorizontalOverflow === false`
- `scrollWidth === clientWidth`
- Tested viewports: **320px, 375px, 768px, 1024px, 1440px**
- Dark and Light themes verified.
