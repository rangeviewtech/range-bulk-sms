# Design System

The design system establishes the visual language of the application. It is token-first, ensuring consistency and reusability across all projects.

## Philosophy

- **Tokens-First:** All visual properties (colors, spacing, typography) stem from a centralized set of tokens.
- **Consistency:** Avoid magic numbers and hardcoded hex values.
- **Reuse:** Build composed components out of strict primitives.

## Color System

Semantic colors allow the theme to adapt gracefully to Light and Dark modes.

- **Background / Foreground:** Base application colors.
- **Primary / Secondary / Accent:** Brand and interactive elements.
- **Muted:** Subtle backgrounds and text.
- **Destructive / Success / Warning / Info:** State feedback.
- **Border / Input / Ring:** UI structural borders and focus states.

## Typography Scale

We use a modular scale for predictable rhythm:
- `display` (4.5rem)
- `h1` to `h5` (3rem down to 1.25rem)
- `body-lg`, `body`, `body-sm` (1.125rem down to 0.875rem)
- `caption`, `label`, `overline`, `code`

## Spacing & Elevation

- **Spacing:** Matches the standard 4pt grid (e.g., `4` = `1rem`).
- **Elevation:** Managed via shadows (`sm`, `md`, `lg`, `xl`, `2xl`, `inner`).

## Component Patterns

- Components should accept `className` and merge using `cn()`.
- Define variants using `class-variance-authority` (cva).
- Use `React.forwardRef` to support compositional component wrapping.

## Icon System

We standardize on **Lucide React** for consistency in line weight, stroke, and scale.

## Do's and Don'ts

- **DO** use CSS variables for colors to support theme switching.
- **DON'T** hardcode `#HEX` colors in Tailwind classes.
- **DO** use `cn()` for dynamic class concatenation.
- **DON'T** override primitive spacing/colors inside composed components unless absolutely necessary.
