# Next.js Master Starter Template

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License: Proprietary](https://img.shields.io/badge/license-Proprietary-red)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

A production-quality, reusable Next.js starter template built by **Range View Technology Services Uganda Limited**.

## Features

- **App Router**: Leveraging the latest Next.js features (Server Components, Actions, Layouts).
- **Design System**: A robust, token-first design system built on Tailwind CSS v4 and Radix UI.
- **50+ UI Components**: Pre-built, accessible, responsive components (shadcn/ui inspired).
- **Dark/Light Mode**: First-class support for both themes using Next Themes.
- **Accessibility (a11y)**: Built-in focus management, ARIA attributes, and keyboard navigation.
- **Responsive**: Mobile-first design principles.
- **Type Safety**: Strict TypeScript configuration.
- **Code Quality**: Pre-configured ESLint, Prettier, and Husky.

## Tech Stack

| Technology | Description |
| --- | --- |
| Next.js 15 | React framework for production |
| React 19 | UI Library |
| Tailwind CSS v4 | Utility-first CSS framework |
| Radix UI | Unstyled, accessible component primitives |
| Lucide React | Icon library |
| TypeScript | Static typing |

## Quick Start

```bash
# Clone the repository
git clone <repository-url> my-new-project

# Navigate into the project
cd my-new-project

# Install dependencies
npm install

# Start the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                  # Next.js App Router pages and layouts
├── components/           # UI Components (ui/, layout/, navigation/, etc.)
├── config/               # App configuration (nav, site info, etc.)
├── design-system/        # Design tokens (colors, typography, spacing)
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions (cn, etc.)
└── types/                # Global TypeScript interfaces/types
```

## Key Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run start`: Runs the built app in production mode.
- `npm run lint`: Lints the codebase.

## Customization for New Projects

To start a new project from this template:
1. Update `package.json` with the new project name and details.
2. Modify `src/config/app.ts` with the new branding.
3. Update theme tokens in `src/app/globals.css` and `src/design-system/tokens/colors.ts`.

## Documentation

- [Architecture](./ARCHITECTURE.md)
- [Design System](./DESIGN_SYSTEM.md)
- [Customization](./CUSTOMIZATION.md)
- [Contributing](./CONTRIBUTING.md)
- [Security](./SECURITY.md)

## License

Proprietary — Range View Technology Services Uganda Limited. All rights reserved.
