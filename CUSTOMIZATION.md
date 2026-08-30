# Customization Guide

This guide details how to customize the Master Starter Template for new projects.

## How to Start a New Project

1. Clone the repository into a new folder.
2. Run `rm -rf .git` and `git init` to start a fresh git history.
3. Update `package.json` with the new project name, version, and description.

## Branding

- **Name:** Update `src/config/app.ts`.
- **Logo:** Replace SVG/PNG assets in `public/`.
- **Colors:** Update `globals.css` `:root` and `.dark` variables, as well as `src/design-system/tokens/colors.ts`.

## Navigation Configuration

Update `src/config/navigation.ts` to add or remove links from the sidebar, header, or footer.

## Adding New Components

1. Place primitive UI components in `src/components/ui/`.
2. Place composed components in their respective folders (`layout`, `feedback`, `forms`, etc.).
3. Export them properly and ensure they use the `cn()` utility for class merging.

## Adding Authentication

To integrate authentication (e.g., NextAuth.js or Supabase):
1. Create `src/lib/auth.ts` or similar.
2. Wrap the application in the provider in `src/app/layout.tsx`.
3. Use the `AuthLayout` component for login/register pages.

## Adding a Database (Prisma)

1. Run `npm install prisma --save-dev` and `npm install @prisma/client`.
2. Run `npx prisma init`.
3. Define your schema in `prisma/schema.prisma`.
4. Instantiate the Prisma client in `src/lib/db.ts`.

## Removing Example Features

Simply delete unused components from `src/components/` and remove their configurations from `src/config/`. The architecture is decoupled to prevent breakage.
