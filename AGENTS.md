# AI Coding Agent Instructions

When acting as an AI coding agent for this repository, you must adhere strictly to the following instructions:

## Critical Execution Directives

- **Do not stop after identifying differences.** You must actually **IMPLEMENT** the required fixes across the project.
- **Do not give recommendations instead of changes.**
- **Inspect → compare → identify → implement → test → compare again → refine.**
- Repeat the browser comparison cycle until the development system closely matches the production/original system in both UI/UX and functionality.
- When you discover a discrepancy, trace it back to the correct shared component, design token, asset, page component, or business logic rather than applying unnecessary isolated hacks.
- Preserve existing functionality and existing architecture wherever possible.
- Never replace working functionality with mocked or placeholder functionality.
- Never redesign the product simply because you can make it look different.
- **Priority Hierarchy:**
  1. **ORIGINAL PRODUCTION PARITY**
  2. **FUNCTIONAL CORRECTNESS**
  3. **VISUAL CONSISTENCY**
  4. **RESPONSIVE CONSISTENCY**
  5. **PERFORMANCE**
  6. **ACCESSIBILITY**
  7. **MAINTAINABLE IMPLEMENTATION**
- Perform the work deeply across the entire application, not only the currently visible page.

## Core Directives

1. **Read Architecture & Design System First:** Always read and adhere strictly to `docs/UI_UX_DESIGN_SYSTEM.md`, `docs/RESPONSIVE_UI_AUDIT.md`, `ARCHITECTURE.md`, and `DESIGN_AND_RESPONSIVE_RULES.md` before generating or modifying UI code. Zero horizontal overflow down to 320px mobile (`document.documentElement.scrollWidth === clientWidth`) is strictly enforced across all 86 routes.
2. **Dual Table/Card Transformation:** Whenever displaying tabular data exceeding 3 columns, implement a mobile card deck (`block md:hidden`) alongside the desktop table (`hidden md:block`) according to `docs/UI_UX_DESIGN_SYSTEM.md`. Never force mobile users to scroll wide tables horizontally.
3. **Reuse Existing Components:** Search the `src/components/` directory. Do not reinvent the wheel. If a button, input, or layout component exists, use it.
4. **Follow Design Tokens:** Utilize the semantic CSS variables defined in `src/design-system/tokens/colors.ts` and `src/app/globals.css`. Never use raw hex colors.
5. **Follow Responsive Rules:** Code must be mobile-first. Test your assumptions across standard breakpoints (320px, 375px, 640px, 768px, 1024px, 1440px).
6. **Follow Accessibility (a11y) Rules:** Always provide explicit `aria-label`s for icon buttons, ensure focus visibility rings, meet minimum 44×44px touch targets, and use semantic HTML.
7. **Strict TypeScript:** Write strict TypeScript. Do not use `any`. Create proper interfaces/types.
8. **Run Tests:** Run the testing suite after changes (`npx vitest run`) and verify type safety (`npm run typecheck`).
9. **Lint and Typecheck:** Ensure no ESLint or TypeScript errors are introduced.
10. **Chrome DevTools MCP Verification:** Always verify changes in the live browser using Chrome MCP tools (`evaluate_script`, `emulate`) to confirm 0px document overflow and visual parity.
11. **No Unnecessary Dependencies:** Do not add external npm packages unless absolutely required and approved.
12. **Security First:** Never expose secrets or API keys. Never bypass input validation.
13. **Shared Components:** Do not modify a globally shared component (in `src/components/ui/`) for a highly specific feature requirement. Compose it or create a feature-specific wrapper instead.
14. **Documentation:** Update relevant markdown files in `/docs` or the root if architecture changes.
15. **Theming:** Maintain dark/light theme support. Every new UI element must look correct in both modes.
16. **Preserve Design Language:** Keep the clean, modern, professional enterprise aesthetic.

## File Naming Conventions

- Components: `kebab-case.tsx` (e.g., `theme-toggle.tsx`).
- Hooks: `camelCase.ts` (e.g., `useAuth.ts`).
- Types: `kebab-case.ts` (e.g., `user-types.ts`).

## Component Patterns

- Always use `export function ComponentName()` instead of `export const ComponentName = () => {}`.
- Props should extend standard HTML attributes where appropriate (`interface Props extends React.HTMLAttributes<HTMLDivElement>`).
- Use the `cn()` utility from `@/lib/utils` for class merging.

## Import Rules

- Use the `@/` alias for all internal imports.
- Standard import order:
  1. React/Next imports
  2. Third-party packages
  3. Internal components
  4. Internal utilities/types

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
