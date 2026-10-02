# Range SMS Unified Design System

## Overview
This document defines the single source of truth for the visual language and interaction design of the entire Range SMS ecosystem, encompassing the Next.js Web Application and the React Native Mobile Gateway/Client applications.

## 1. Tokens & Color Palette
We utilize a semantic color system across all platforms:

- **Brand Primary (Blue):** `#04648C` (Web: `var(--color-brand-blue)`, Mobile: `text-brand-blue`)
- **Brand Secondary (Yellow):** `#F2C94C` (Web: `var(--color-brand-yellow)`, Mobile: `text-brand-yellow`)
- **Brand Dark (Navy):** `#07163D` (Web: `var(--color-brand-navy)`, Mobile: `text-brand-navy`)
- **Backgrounds:** `#f8fafc` (slate-50) for app backgrounds, `#ffffff` for elevated surfaces.

## 2. Typography
- **Font Family:** Inter (Web) / System Default Sans-Serif (Mobile)
- **Scale:**
  - Page Titles: `text-3xl font-bold text-brand-navy`
  - Section Headers: `text-lg font-bold text-brand-navy`
  - Body: `text-base text-gray-700`
  - Subtext: `text-sm text-gray-500`

## 3. Shape and Elevation
- **Border Radius:** `rounded-xl` (12px) for cards, `rounded-2xl` (16px) for larger surface areas.
- **Borders:** Subtle `border border-gray-100` on elevated surfaces.
- **Shadows:** Soft `shadow-sm` on default cards, `shadow-lg` on prominent floating action elements.

## 4. Components
- **Buttons:** Solid `bg-brand-blue` with `text-white font-bold`, applying a 90% opacity hover state (Web) or active opacity (Mobile).
- **Cards:** White backgrounds with `border-gray-100`, using Flexbox for internal spacing (`p-5` or `p-6`).

## 5. Accessibility (WCAG 2.2 AA)
- All interactive elements must have a minimum touch target of 44x44px.
- Contrast ratios for text must exceed 4.5:1. (e.g., `#07163D` on `#ffffff` is 14:1).
- Focus states must be preserved on Web (`focus-visible:ring-2 focus-visible:ring-brand-blue`).

## 6. Responsiveness
- **Web Breakpoints:** Mobile-first architecture using standard Tailwind breakpoints (`md`, `lg`, `xl`). 
- **Mobile Safe Areas:** React Native layouts must utilize `SafeAreaView` or programmatic padding to prevent notch/home indicator overlap.
