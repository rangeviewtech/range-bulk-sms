# Design System & UI/UX Token Specification — Range Bulk SMS

> **Entity**: Range View Technology Services Uganda Limited  
> **Aesthetic**: Enterprise Precision Dark/Light Aesthetic  
> **Source Files**: `src/design-system/tokens/colors.ts`, `src/app/globals.css`, `tailwind.config.ts`  
> **Next-Gen Rules**: See [`DESIGN_AND_RESPONSIVE_RULES.md`](./DESIGN_AND_RESPONSIVE_RULES.md) for full responsive breakpoints, enterprise API standards, and anti-AI-isms.

---

## 1. Design Philosophy

The Range Bulk SMS visual language is engineered around **clarity, high contrast, telecom operational confidence, and responsiveness**. The system is **tokens-first**: every layout, component, badge, and border derives strictly from standardized CSS variables and semantic design tokens.

### Key Tenets
1. **Zero Hardcoded Hex Codes in Components**: Components exclusively consume semantic CSS classes (`bg-primary`, `text-muted-foreground`, `border-border`, etc.).
2. **Dual-Theme Fidelity**: Every screen, modal, card, and telemetry graph is designed and verified to render with contrast in both Light and Dark modes.
3. **Telecom Brand Integrity**: Official carrier identities (MTN Yellow, Airtel Red, UTL Blue, Safaricom Green) are precisely tokenized for instant visual status.
4. **Accessible by Default (WCAG AA)**: Interactive elements maintain a minimum 4.5:1 text contrast ratio, visible focus rings, and explicit screen-reader attributes.

---

## 2. Core Brand Tokens

Defined in `src/design-system/tokens/colors.ts`:

```typescript
export const brandColors = {
  primaryYellow: "#FBCA07",     // Core Brand Yellow
  primaryBlue: "#04648C",       // Core Brand Deep Blue
  white: "#FFFFFF",             // Surface White
  lightYellow: "#FBE392",       // Accent Light Yellow
  mediumBlue: "#67A0AF",        // Accent Medium Blue
  lightBlue: "#A6CBD8",         // Muted Light Blue
  darkNeutral: "#554C3B",       // Neutral Dark Slate
  darkNavy: "#07163D",          // Deep Navigation Navy
  darkNavySurface: "#03102E",   // Background Navy Base
} as const;
```

---

## 3. Semantic Theme Palettes

### 3.1 Light Mode Palette
Optimized for clean daylight readability in office and commercial enterprise environments:

| Semantic Token | HSL Value | Hex Equivalent | UI Usage |
|---|---|---|---|
| `--background` | `hsl(0 0% 100%)` | `#FFFFFF` | Main canvas background |
| `--foreground` | `hsl(218 30% 12%)` | `#141B2D` | Primary typography |
| `--card` | `hsl(0 0% 100%)` | `#FFFFFF` | Content cards & table containers |
| `--primary` | `hsl(48 98% 51%)` | `#FBCA07` | Primary action buttons, active tabs |
| `--primary-foreground` | `hsl(218 30% 12%)` | `#141B2D` | Dark text on Yellow buttons (a11y) |
| `--secondary` | `hsl(198 94% 28%)` | `#04648C` | Secondary action buttons & links |
| `--secondary-foreground` | `hsl(0 0% 100%)` | `#FFFFFF` | White text on secondary buttons |
| `--muted` | `hsl(210 20% 96%)` | `#F1F5F9` | Table headers, inactive filters |
| `--muted-foreground` | `hsl(215 16% 47%)` | `#64748B` | Secondary descriptions, timestamps |
| `--border` / `--input` | `hsl(214 32% 91%)` | `#E2E8F0` | Structural borders & input strokes |
| `--ring` | `hsl(198 94% 28%)` | `#04648C` | Focus outline ring |

### 3.2 Dark Mode Palette
Engineered for operations centers, night shifts, and modern developer interfaces:

| Semantic Token | HSL Value | Hex Equivalent | UI Usage |
|---|---|---|---|
| `--background` | `hsl(222 47% 11%)` | `#0B132B` | Root page background |
| `--foreground` | `hsl(210 40% 98%)` | `#F8FAFC` | Primary typography |
| `--card` | `hsl(224 40% 14%)` | `#131D38` | Dashboard tiles, data cards, modals |
| `--primary` | `hsl(48 98% 51%)` | `#FBCA07` | Primary CTA, highlight accents |
| `--primary-foreground` | `hsl(218 30% 12%)` | `#141B2D` | Dark text for high-contrast on Gold |
| `--secondary` | `hsl(198 94% 28%)` | `#04648C` | Subtle secondary actions |
| `--muted` | `hsl(223 35% 18%)` | `#1E293B` | Inactive buttons, badge backgrounds |
| `--muted-foreground` | `hsl(215 20% 72%)` | `#94A3B8` | Subtitles, helper text |
| `--border` / `--input` | `hsl(223 30% 20%)` | `#26354D` | Subtle dark container borders |
| `--ring` | `hsl(48 98% 51%)` | `#FBCA07` | Gold focus ring in dark mode |

---

## 4. Telecom Network Brand Badges

Defined in `src/components/sms/network-badge.tsx`:

| Mobile Network | Background Color | Text Color | Border Color | Visual Identity |
|---|---|---|---|---|
| **MTN Uganda** | `#FFCC00` | `#000000` (Bold) | `#E6B800` | Official MTN Canary Yellow |
| **Airtel Uganda** | `#ED1C24` | `#FFFFFF` (Bold) | `#C7141B` | Official Airtel Crimson Red |
| **Uganda Telecom (UTL)** | `#0054A6` | `#FFFFFF` (Bold) | `#004080` | Official UTL Royal Blue |
| **Safaricom Kenya** | `#00A859` | `#FFFFFF` (Bold) | `#008F4C` | Official Safaricom Emerald Green |
| **Africell** | `#782B8F` | `#FFFFFF` (Bold) | `#5C206D` | Official Africell Regal Purple |
| **Vodacom** | `#E60000` | `#FFFFFF` (Bold) | `#CC0000` | Official Vodacom Signal Red |

---

## 5. Developer Portal & HTTP Method Tokens

Tokenized specifically for technical API documentation and webhook inspectors (`src/app/globals.css`):

```css
/* HTTP Method Badges - Light / Dark */
--method-get-text: #047857;     /* Light */  |  --method-get-text: #20D5A0;     /* Dark */
--method-post-text: #0369A1;    /* Light */  |  --method-post-text: #35B6FF;    /* Dark */
--method-put-text: #B45309;     /* Light */  |  --method-put-text: #FFCC24;     /* Dark */
--method-patch-text: #6D28D9;   /* Light */  |  --method-patch-text: #9D6DFF;   /* Dark */
--method-delete-text: #B91C1C;  /* Light */  |  --method-delete-text: #FF4D6D;  /* Dark */
```

---

## 6. Typography & Grid System

### Font Stacks
- **Sans-Serif Font**: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Monospace Font**: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`

### Modular Scale
- `display`: `4.5rem` (72px) / Line height: `1.1`
- `h1`: `3.0rem` (48px) / Line height: `1.2`
- `h2`: `2.25rem` (36px) / Line height: `1.25`
- `h3`: `1.75rem` (28px) / Line height: `1.3`
- `h4`: `1.25rem` (20px) / Line height: `1.4`
- `body-lg`: `1.125rem` (18px) / Line height: `1.5`
- `body`: `1.0rem` (16px) / Line height: `1.5`
- `body-sm` / `caption`: `0.875rem` (14px) and `0.75rem` (12px)

### Spacing & Elevation
- Base spacing follows the 4pt grid: `4` = `1rem` (16px), `2` = `0.5rem` (8px), `1` = `0.25rem` (4px).
- Container border radius `--radius`: `0.625rem` (10px) with derivatives `--radius-sm` (6px) and `--radius-xl` (14px).
- Elevation shadows: `shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`.

---

## 7. Component Construction Patterns

### Class Merging
Always utilize the `cn()` utility (`clsx` + `tailwind-merge`) from `@/lib/utils`:
```typescript
import { cn } from "@/lib/utils";

export function CustomCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border bg-card p-6 shadow-sm", className)} {...props} />;
}
```

### Variant Management
Standardize on `class-variance-authority` (`cva`) for multi-variant primitives:
```typescript
import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### Accessibility Rules
1. **Explicit Buttons**: Always declare `<button type="button">` or `<button type="submit">` to prevent accidental form triggers.
2. **Screen Reader Labels**: Any button with only an icon must include `aria-label="Action description"`.
3. **Contrast Verification**: Light mode yellow buttons (`#FBCA07`) MUST use dark text (`#141B2D`) to satisfy the 4.5:1 WCAG contrast rule.

---

*Authored and maintained for the Range Bulk SMS Design System.*
