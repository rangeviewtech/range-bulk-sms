# Security Guidelines

Security is a primary concern. Follow these practices when developing with the template.

## Environment Variable Handling

- **Never** commit `.env` files.
- Prefix public environment variables with `NEXT_PUBLIC_`.
- Server-only secrets should be strictly accessed in Server Components or API Routes.

## Input Validation

Always validate user input.
- Use `zod` for parsing and validating complex data structures.
- Do not trust client-side validation alone; always validate on the server in Next.js Server Actions or API routes.

## XSS and CSRF Prevention

- React escapes strings by default, mitigating most Cross-Site Scripting (XSS) attacks. Avoid using `dangerouslySetInnerHTML`.
- Next.js App Router Actions include built-in protections for Cross-Site Request Forgery (CSRF).

## Security Headers

Configure `next.config.mjs` to inject standard security headers:
- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Secrets Management

Use dedicated secret managers (like AWS Secrets Manager, Vercel Env Vars, or Doppler) rather than hardcoded keys in the codebase.

## Reporting Vulnerabilities

If you discover a security vulnerability, please report it immediately to Range View Technology Services Uganda Limited internal security team rather than opening a public issue.
# Performance Guidelines

Performance is a critical feature. Follow these guidelines to maintain a fast, responsive application.

## Server Components by Default

Always use Next.js Server Components unless you specifically need client-side interactivity (`onClick`, `useState`, `useEffect`). Server Components send zero JavaScript to the client, drastically reducing bundle size.

## Image Optimization

Use the `<Image>` component from `next/image` for all images.
- It provides automatic WebP/AVIF conversion.
- It prevents Cumulative Layout Shift (CLS).
- Always define `width` and `height` or use `fill`.

## Font Optimization

Use `next/font` to automatically host Google Fonts locally. This removes external network requests and prevents Layout Shift via CSS `size-adjust`.

## Bundle Size Management

- Analyze bundles using `@next/bundle-analyzer`.
- Avoid importing entire libraries (e.g., `import { get } from 'lodash'` instead of `import _ from 'lodash'`).

## Code Splitting

Use Next.js dynamic imports (`next/dynamic`) for heavy components (e.g., rich text editors, heavy charts, maps) that are not needed immediately on page load.
# Accessibility (a11y)

Building inclusive applications is a core requirement for this template. We target **WCAG 2.1 AA** conformance.

## Keyboard Navigation

All interactive elements must be fully functional via keyboard alone.
- Use native elements (`<button>`, `<a>`) where possible.
- Ensure logical tab order.
- Maintain a visible focus ring. (We use the `@utility focus-ring` in Tailwind).

## Focus Management

When opening modals, dropdowns, or sheets, focus must be trapped within the component and returned to the trigger upon closing. Radix UI handles much of this out of the box.

## Color Contrast

The color tokens in `src/design-system/tokens/colors.ts` are designed to pass contrast ratios for text. When adding new colors, ensure a contrast ratio of at least 4.5:1 for normal text.

## Screen Reader Support

- Ensure images have descriptive `alt` tags.
- Use `aria-label` or `sr-only` utility classes for icon-only buttons.
- Use appropriate semantic HTML5 elements (`<nav>`, `<main>`, `<article>`).

## Accessible Component Checklist

When building new components:
- [ ] Does it have a visible focus state?
- [ ] Is it navigable via `Tab`?
- [ ] Do custom interactive elements have correct `aria-role` and `aria-expanded`/`aria-checked`?
- [ ] Have you tested it with a screen reader (e.g., VoiceOver, NVDA)?
# Testing Strategy

Robust testing ensures the stability and longevity of projects built on this template.

## Testing Philosophy

- **Write tests for logic, not implementation details.**
- **Prioritize integration testing** over pure unit testing for UI components.
- **Maintain a fast feedback loop** during development.

## Test Structure

Tests are typically located alongside the source files:
- `src/components/ui/button.tsx`
- `src/components/ui/button.test.tsx`

## Unit & Component Testing

We use **Vitest** + **Testing Library**.
- Run tests: `npm run test`
- Render components with `render()` from `@testing-library/react`.
- Use `screen.getByRole` to find elements.

## E2E Testing

End-to-End testing is handled by **Playwright**. E2E tests live in the `e2e/` directory at the project root.
- Run tests: `npm run test:e2e`

## Accessibility Testing

Integration tests should use `jest-axe` to assert no basic a11y violations are introduced.

## Coverage Targets

While 100% coverage is not strictly mandated, we target **80% statement coverage** for business logic (hooks, utility functions) and core UI primitives.
