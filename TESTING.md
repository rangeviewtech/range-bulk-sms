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
