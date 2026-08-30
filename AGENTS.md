# AI Coding Agent Instructions

When acting as an AI coding agent for this repository, you must adhere strictly to the following instructions:

## Core Directives

1. **Read Architecture First:** Always understand the concepts in `ARCHITECTURE.md` and `DESIGN_SYSTEM.md` before generating code.
2. **Reuse Existing Components:** Search the `src/components/` directory. Do not reinvent the wheel. If a button, input, or layout component exists, use it.
3. **Follow Design Tokens:** Utilize the CSS variables defined in `src/design-system/tokens/colors.ts` and `src/app/globals.css`. Never use raw hex colors.
4. **Follow Responsive Rules:** Code must be mobile-first. Test your assumptions using Tailwind's `md:`, `lg:` breakpoints.
5. **Follow Accessibility (a11y) Rules:** Always provide `aria` labels for icon buttons, ensure focus visibility, and use semantic HTML.
6. **Strict TypeScript:** Write strict TypeScript. Do not use `any`. Create proper interfaces/types.
7. **Run Tests:** Run the testing suite after changes if instructed, or suggest running them.
8. **Lint and Typecheck:** Ensure no ESLint or TypeScript errors are introduced.
9. **No Unnecessary Dependencies:** Do not add external npm packages unless absolutely required and approved.
10. **Security First:** Never expose secrets or API keys. Never bypass input validation.
11. **Shared Components:** Do not modify a globally shared component (in `src/components/ui/`) for a highly specific feature requirement. Compose it or create a feature-specific wrapper instead.
12. **Documentation:** Update relevant markdown files in `/docs` or the root if architecture changes.
13. **Theming:** Maintain dark/light theme support. Every new UI element must look correct in both modes.
14. **Preserve Design Language:** Keep the clean, modern, professional aesthetic.

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
