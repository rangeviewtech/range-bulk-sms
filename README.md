# Range Bulk SMS Platform

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License: Proprietary](https://img.shields.io/badge/license-Proprietary-red)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)

A production-grade, multi-tenant **Enterprise Bulk SMS Platform** built with Next.js 16 (App Router), TypeScript, Prisma ORM, and Tailwind CSS by **Range View Technology Services Uganda Limited**.

---

## Key Capabilities

### 1. Multi-Role Portal Architecture
- **Admin Portal (`/admin/*`)**: System configuration, agent management, client onboarding, SMS pricing matrix, provider routing, commission approvals, audit logs, and analytics.
- **Client Portal (`/sms/*`, `/contacts/*`, `/wallet/*`)**: Campaign creation, scheduled broadcasts, contact book with custom fields, Excel/CSV bulk import, sender ID applications, financial receipts, and delivery analytics.
- **Agent / Reseller Portal (`/agent/*`)**: Commission tracking, client referral management, tiered revenue earnings, and sub-account monitoring.

### 2. Messaging & Gateway Engine
- **Multi-Channel & Multi-Provider**: Support for HTTP REST gateways, Pandora, SMPP, WhatsApp, Telegram, and SMTP email.
- **Android Device SMS Gateways (`/gateways`)**: Pair physical Android devices to send SMS via SIM cards with real-time battery, signal, and heartbeat tracking.
- **Dynamic Template Engine**: Personalized SMS messages with merge tags (`{{firstName}}`, `{{company}}`), unicode support, and automatic multi-part GSM 03.38 character segmentation.
- **Scheduled & Recurring Campaigns**: Background cron processor for scheduled campaigns and automated queue dispatching.

### 3. Financials & Commission Engine
- **Prepaid Wallet Architecture**: ACID-compliant balance deductions, reservations, and refunds with database-level row locking (`FOR UPDATE`).
- **Country & Operator Pricing Matrix**: Multi-currency pricing tables per destination country and mobile network operator.
- **Automated Reseller Commissions**: Dynamic commission engine supporting fixed, percentage, and tiered volume rules with automated wallet payouts.

### 4. Developer API & Webhooks
- **REST API v1 (`/api/v1/*`)**: Send single/bulk SMS, check delivery statuses, query wallet balance, and manage sender IDs via API keys.
- **Interactive Swagger Documentation**: Available at `/api/docs`.
- **Inbound & Outbound Webhooks**: Real-time delivery receipt (DLR) updates and payment gateway webhooks.

---

## Tech Stack

| Technology | Description |
| --- | --- |
| **Next.js 16.3** | Turbopack, App Router, Server Components & Route Handlers |
| **React 19** | Modern UI rendering with Suspense & Server Actions |
| **Prisma ORM 7** | Type-safe PostgreSQL client with migrations and relations |
| **Tailwind CSS v4** | Token-first design system with instant dark/light theming |
| **Radix UI & Lucide** | Accessible unstyled primitives and vector iconography |
| **Vitest** | Comprehensive unit and integration test suite |
| **Zod** | Runtime request schema validation and sanitization |

---

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/rangeviewtech/range-bulk-sms.git
cd range-bulk-sms

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Generate Prisma Client & push database schema
npx prisma generate
npx prisma db push

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
range-bulk-sms/
├── prisma/
│   └── schema.prisma         # Prisma schema with all models (User, Wallet, Message, Campaign, etc.)
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/           # Authentication pages (login, register, 2fa, forgot-password)
│   │   ├── (dashboard)/      # Protected dashboard routes
│   │   │   ├── admin/        # Admin portal
│   │   │   ├── agent/        # Agent / Reseller portal
│   │   │   ├── sms/          # Client campaign & message management
│   │   │   ├── contacts/     # Address book & group management
│   │   │   ├── gateways/     # Device SMS gateways
│   │   │   └── wallet/       # Wallet, pricing & transactions
│   │   └── api/              # Route handlers (REST API v1, Admin APIs, Webhooks, Cron)
│   ├── components/           # UI components, layout shells, form controls
│   ├── config/               # App configuration, navigation, permissions, and assets
│   ├── design-system/        # Design tokens and theme styling
│   ├── hooks/                # Custom React hooks
│   └── lib/                  # Services (SMS router, Wallet, Commission, Auth, Prisma)
└── tests/                    # Vitest unit & integration test suites
```

---

## Key Scripts

- `npm run dev`: Starts the Turbopack development server on port 3000.
- `npm run build`: Generates optimized production build across all 111 routes.
- `npm run start`: Runs production server.
- `npm run typecheck`: Runs strict TypeScript checking (`tsc --noEmit`).
- `npm run test:run`: Executes all Vitest unit and integration test suites.
- `npm run lint`: Runs ESLint analysis.

---

## License

Proprietary — **Range View Technology Services Uganda Limited**. All rights reserved.
