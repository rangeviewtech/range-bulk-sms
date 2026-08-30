# Technology Stack

This document tracks the core packages used in the template and the rationale for their inclusion.

| Package | Version | Purpose | Reason | Docs URL | Upgrade Notes |
|---------|---------|---------|--------|----------|---------------|
| `next` | `^15.0.0` | Framework | Best-in-class React framework for SSR and App Router | [Docs](https://nextjs.org/docs) | Major version shifts require reading migration guides carefully. |
| `react` | `^19.0.0` | UI Library | Standard for modern web dev | [Docs](https://react.dev/) | - |
| `tailwindcss` | `^4.0.0` | Styling | Utility-first CSS, high performance, inline themes | [Docs](https://tailwindcss.com/) | Uses inline @theme variables. |
| `lucide-react` | `^0.244.0` | Icons | Clean, consistent SVG icons | [Docs](https://lucide.dev/) | - |
| `clsx` | `^2.1.1` | Utilities | Conditional class merging | [Docs](https://github.com/lukeed/clsx) | - |
| `tailwind-merge` | `^2.3.0` | Utilities | Resolves Tailwind utility conflicts | [Docs](https://github.com/dcastil/tailwind-merge) | - |
| `class-variance-authority` | `^0.7.0` | Styling | Component variant management | [Docs](https://cva.style/docs) | - |
| `@radix-ui/react-*` | Various | UI Primitives | Accessible, unstyled core components | [Docs](https://www.radix-ui.com/) | - |
| `next-themes` | `^0.3.0` | Theming | Avoids hydration mismatch on dark mode | [Docs](https://github.com/pacocoursey/next-themes) | - |
| `@tanstack/react-table` | `^8.10.0` | Data Table | Headless UI for tables | [Docs](https://tanstack.com/table/latest) | - |
| `react-hook-form` | `^7.45.0` | Forms | Performant, flexible form validation | [Docs](https://react-hook-form.com/) | Use alongside Zod. |
