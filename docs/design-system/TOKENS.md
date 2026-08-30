# Design Tokens Reference

Tokens are the single source of truth for the visual design system.

## Locations
- **CSS Variables:** `src/app/globals.css` (The source of truth for rendering).
- **TypeScript Objects:** `src/design-system/tokens/*.ts` (For programmatic access in JS if needed).

## Governance
- **No Hardcoding:** Never hardcode a color, padding, or border-radius in a component. 
- **Adding Tokens:** If a new semantic meaning is required, add a token to both `globals.css` and `colors.ts`.
- **Naming Convention:** Use semantic names (`background`, `destructive`, `muted`) rather than literal color names (`blue-500`, `red-600`) to ensure dark mode works seamlessly.
