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
