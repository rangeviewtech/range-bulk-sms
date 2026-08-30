# AI Coding Rules

These rules govern how AI agents should write and modify code within this project.

1. **Safety First**: Do not delete configurations without understanding their impact. Do not expose `.env` values.
2. **Component Reusability**: Do not duplicate UI. Check `src/components/ui` first.
3. **Tailwind Best Practices**: Use `@apply` sparingly. Prefer utility classes in JSX. Merge classes using `cn()`.
4. **Server vs. Client**: Always default to Server Components. Only add `'use client'` at the boundary where state or effects are absolutely necessary.
5. **Type Strictness**: Define explicit interfaces for all component props and API responses. No implicit `any`.
6. **Error Handling**: Implement `error.tsx` boundaries for major route segments. Handle async errors gracefully.
7. **Accessibility**: All interactive elements must have focus states and ARIA roles where semantic HTML falls short.
