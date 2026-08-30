# Contributing

We welcome contributions. Please follow these guidelines to maintain a high standard of code quality.

## Code Style and Conventions

- **Strict TypeScript:** Avoid `any`. Use interfaces and precise types.
- **Formatting:** Prettier is enforced. Run `npm run format`.
- **Linting:** ESLint is strictly enforced. Run `npm run lint`.

## Branch Naming

- `feature/description-of-feature`
- `fix/description-of-bug`
- `chore/description-of-chore`
- `docs/description-of-update`

## Commit Messages

Follow Conventional Commits:
- `feat: add user authentication`
- `fix: resolve sidebar collapse issue`
- `docs: update deployment guide`

## Pull Request Process

1. Create a feature branch.
2. Commit your changes.
3. Open a PR against `main`.
4. Ensure all CI checks (lint, format, test) pass.
5. Request a review from at least one core team member.

## Code Review Checklist

- Does the PR follow the design system tokens?
- Are new components accessible (a11y)?
- Is the component fully responsive?
- Does it support dark mode?
- Is the code self-documenting (avoiding unnecessary comments)?
- Are tests included?
