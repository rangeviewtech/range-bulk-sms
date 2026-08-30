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
