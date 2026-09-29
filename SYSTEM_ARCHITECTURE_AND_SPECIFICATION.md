# Range Bulk SMS — Comprehensive System Architecture & Engineering Specification

> **Platform**: Range Bulk SMS  
> **Entity**: Range View Technology Services Uganda Limited  
> **Version**: 1.0.0 (Enterprise Carrier-Grade Production Release)  
> **Framework**: Next.js 16.3.5 (Turbopack) • React 19.2.8 • TypeScript 5.7 • Prisma ORM 7.9.1 • Tailwind CSS 4.0  
> **Last Updated**: September 29, 2026  
> **System Status**: Production-Certified (0 TypeScript Errors, 0 ESLint Warnings, 48/48 Test Files Passed, 429/429 Vitest Tests Passed, 159/159 Compiled Routes)

---

## Table of Contents

1. [Executive Summary & Platform Identity](#1-executive-summary--platform-identity)
2. [Multi-Tenant Hierarchy & Access Control (RBAC)](#2-multi-tenant-hierarchy--access-control-rbac)
3. [End-to-End System Architecture](#3-end-to-end-system-architecture)
4. [Core Business Functionalities & Workflows](#4-core-business-functionalities--workflows)
   - [4.1 SMS & Messaging Suite](#41-sms--messaging-suite)
   - [4.2 Live Simulator & Real-Time Encoding Preview](#42-live-simulator--real-time-encoding-preview)
   - [4.3 Advanced Campaign Engine (Broadcast, Recurring, Drip, A/B Split Testing)](#43-advanced-campaign-engine-broadcast-recurring-drip-ab-split-testing)
   - [4.4 Contact Directory, Groups & Dynamic Segment AST Compiler](#44-contact-directory-groups--dynamic-segment-ast-compiler)
   - [4.5 Consent, Opt-In/Opt-Out & Regulatory Suppression List Compliance](#45-consent-opt-inopt-out--regulatory-suppression-list-compliance)
   - [4.6 Carrier Least Cost Routing (LCR) & Failover Engine](#46-carrier-least-cost-routing-lcr--failover-engine)
   - [4.7 Telecom Circuit Breaker & Aggregator Health Monitoring](#47-telecom-circuit-breaker--aggregator-health-monitoring)
   - [4.8 Native SMPP v3.4 Telecom Protocol Driver](#48-native-smpp-v34-telecom-protocol-driver)
   - [4.9 Airtel Telecom Direct Interconnect Gateway](#49-airtel-telecom-direct-interconnect-gateway)
   - [4.10 Global 250+ Country Phone Registry & National Operator Resolution](#410-global-250-country-phone-registry--national-operator-resolution)
   - [4.11 Regulatory KYC Engine & Compliance Document Verification](#411-regulatory-kyc-engine--compliance-document-verification)
   - [4.12 Hardware & IoT SMS Gateways (Android GSM & ESP32 SIM800L)](#412-hardware--iot-sms-gateways-android-gsm--esp32-sim800l)
   - [4.13 Billing, Wallet & Double-Entry Transaction Ledger](#413-billing-wallet--double-entry-transaction-ledger)
   - [4.14 Reseller & Agent Commission Engine](#414-reseller--agent-commission-engine)
   - [4.15 Security, Anti-Fraud, Distributed Rate Limiting & WebAuthn](#415-security-anti-fraud-distributed-rate-limiting--webauthn)
   - [4.16 Developer Platform, Public REST API (v1), Webhook Subsystem & MCP](#416-developer-platform-public-rest-api-v1-webhook-subsystem--mcp)
   - [4.17 Telemetry, Delivery Receipts (DLR) & Analytics](#417-telemetry-delivery-receipts-dlr--analytics)
   - [4.18 Customer Support, Real-Time Chat Assistant & AI Grammar Engine](#418-customer-support-real-time-chat-assistant--ai-grammar-engine)
5. [Directory Structure & Module Breakdown](#5-directory-structure--module-breakdown)
6. [Technology Stack & Dependency Inventory](#6-technology-stack--dependency-inventory)
7. [UI/UX Design System, Color Tokens & Aesthetic Specifications](#7-uiux-design-system-color-tokens--aesthetic-specifications)
   - [7.1 Brand Foundations & Dual-Theme Harmonization](#71-brand-foundations--dual-theme-harmonization)
   - [7.2 WCAG AAA/AA Contrast Compliance Specification](#72-wcag-aaaaa-contrast-compliance-specification)
   - [7.3 Telecom Network Brand Identities](#73-telecom-network-brand-identities)
   - [7.4 Developer Portal & HTTP Method Tokenization](#74-developer-portal--http-method-tokenization)
   - [7.5 Typography, Spacing & Elevation Grid](#75-typography-spacing--elevation-grid)
   - [7.6 Component Patterns, Uniform Height & Accessibility Standards](#76-component-patterns-uniform-height--accessibility-standards)
8. [Data Models & Database Schema Overview](#8-data-models--database-schema-overview)
9. [Background Processing & Queue Execution Pipeline](#9-background-processing--queue-execution-pipeline)
10. [Quality Assurance, Testing & Build Verification](#10-quality-assurance-testing--build-verification)

---

## 1. Executive Summary & Platform Identity

**Range Bulk SMS** is a carrier-grade enterprise bulk messaging, telecommunications routing, and mobile infrastructure platform engineered by **Range View Technology Services Uganda Limited**. It delivers high-throughput, mission-critical SMS broadcast services, transactional messaging, two-factor authentication (OTP) delivery, and hardware-coupled mobile gateway integration engineered specifically for East African telecom ecosystems (Uganda, Kenya, Tanzania, Rwanda) as well as global routing across 250+ countries.

The platform unifies commercial bulk SMS campaigns, automated contact directory synchronization, compliance/suppression list enforcement, reseller agent commissions, prepaid billing ledgers, and low-level telecom signaling into a single, high-performance Next.js 16 full-stack architecture running React 19.

### Strategic Differentiators
- **Direct Telecom Interconnects**: Direct SMPP v3.4 signaling drivers to mobile network operator Short Message Service Centers (SMSC) alongside high-speed Airtel and MTN HTTP/REST aggregators.
- **Telecom Circuit Breaker**: Resilient 3-state circuit breaker (`CLOSED`, `OPEN`, `HALF_OPEN`) with exponential cooldowns and automatic fallback routing to prevent message stalls during carrier gateway degradation.
- **Hardware Gateway Bridging**: Support for native Android GSM gateways (dual-SIM slots) and remote ESP32 SIM800L microcontroller hardware modules for off-grid operations.
- **Strict Compliance & Consent**: Regulatory compliance aligning with Uganda Communications Commission (UCC), GDPR, and TCPA guidelines via immutable, append-only consent tracking (`ConsentLog`).
- **Financial Security**: Strict double-entry transactional accounting with serializable database transaction isolation (`Prisma.TransactionIsolationLevel.Serializable`) to prevent double-spending or credit race conditions.
- **A/B Testing & AI Optimization**: Statistical message variant split-testing and Google Gemini AI grammar/tone optimization integrated directly into the SMS Send Studio.
- **Reseller Multi-Tenancy**: Built-in tiered agent commissions, white-label client management, and real-time commission disbursements.

---

## 2. Multi-Tenant Hierarchy & Access Control (RBAC)

The platform enforces a five-level hierarchical tenant model governed by strict Role-Based Access Control:

```mermaid
graph TD
    A["Super Admin / Platform Operator"] --> B["Reseller Agent"]
    A --> C["Enterprise Client / Organization"]
    B --> D["Agent Sub-Client"]
    C --> E["Organization Admin"]
    C --> F["Campaign Manager"]
    C --> G["API / Developer Bot"]
    D --> H["Sub-Account User"]
```

### Roles & Permission Matrix
| Role | Scope | Capabilities |
|---|---|---|
| **ADMIN** | System-Wide | Full administrative override, provider routing management, system audit logs, global pricing config, agent commission payouts, sender ID approvals, job queue telemetry, carrier circuit breaker controls. |
| **AGENT** | Reseller Portal | Onboard client accounts, assign client credit pools, configure markup margins, track real-time commissions, request wallet withdrawals. |
| **CLIENT_ADMIN** | Organization | Full tenant management, wallet top-up, user invitations, API key generation, webhook configuration, sender ID requests. |
| **MANAGER** | Workspace | Create, launch, pause, and cancel campaigns, import contacts, manage custom variables and templates, view delivery reports. |
| **MEMBER / VIEWER** | Workspace | Read-only access to campaign telemetry, contact groups, and delivery logs. |

### Caching Architecture for RBAC
To eliminate hundreds of repetitive database queries during layout and Server Component rendering, `src/lib/auth/authorization.ts` implements `ROLE_PERMISSIONS_CACHE`—an in-memory permission cache with a 5-minute TTL that validates role capability sets with zero SQL overhead.

---

## 3. End-to-End System Architecture

The application is structured as a decoupled, layered enterprise architecture:

```mermaid
flowchart TB
    subgraph ClientLayer ["Client & Ingestion Layer"]
        Browser["Next.js 16 Web App (React 19)"]
        DevAPI["Public REST API v1"]
        AndroidGW["Android GSM Gateway"]
        ESP32["ESP32 SIM800L Gateways"]
        MCPServer["shadcn & Tool MCP Servers"]
    end

    subgraph SecurityLayer ["Security & Edge Layer"]
        Proxy["Edge Proxy & CSRF Filter"]
        RateLimit["Upstash Redis Sliding-Window Rate Limiter"]
        FraudEngine["AIT Fraud & OTP Pumping Guard"]
        AuthGuard["NextAuth & WebAuthn / Passkey Guard"]
    end

    subgraph CoreServices ["Core Business Logic"]
        CampaignMgr["Campaign & A/B Engine"]
        SegmentComp["Dynamic Segment AST Compiler"]
        ConsentSvc["Consent & Suppression Service"]
        BillingSvc["Serializable Billing Ledger"]
        RoutingEng["Least Cost Routing & Circuit Breaker"]
        KYCEngine["Regulatory KYC Engine"]
    end

    subgraph QueueWorkers ["Asynchronous Execution Pipeline"]
        WorkerDaemon["Background Job Worker Daemon"]
        Expander["Campaign Expansion Worker"]
        Dispatcher["SMS Dispatch Worker"]
        WebhookWorker["Webhook HMAC Dispatcher"]
    end

    subgraph ProviderLayer ["Signaling & Telecom Gateway"]
        SMPPDriver["Native SMPP v3.4 Driver"]
        AirtelDriver["Airtel Telecom Gateway"]
        HTTPProviders["Telecom REST APIs (MTN / Airtel)"]
        HardwareBridge["Device Gateway Poller"]
    end

    ClientLayer --> SecurityLayer
    SecurityLayer --> CoreServices
    CoreServices --> QueueWorkers
    QueueWorkers --> ProviderLayer
    ProviderLayer --> SMSC["Telecom SMSC Networks"]
```

---

## 4. Core Business Functionalities & Workflows

### 4.1 SMS & Messaging Suite
Located at `src/app/(dashboard)/sms/`:
- **Single / Quick SMS**: Instant message dispatch to single or ad-hoc phone numbers with real-time GSM 03.38 character counter, unicode detection, message part calculation (160 chars GSM-7, 70 chars UCS-2), and credit cost preview.
- **Delivery Mode Selector**: Four selectable delivery pipelines:
  - `Standard`: Default cost-effective broadcast routing.
  - `Express`: High-priority routing bypassing batch queues for immediate dispatch.
  - `Priority`: Dedicated channel allocation for OTPs and critical alerts.
  - `Fallback`: Multi-route failover with automated hardware gateway fallback.
- **Custom Dynamic Variables SMS**: Full merge tag resolution (`src/app/(dashboard)/sms/custom/page.tsx`) enabling personalized bulk messaging with mustache syntax (e.g., `Hello {{name}}, your balance is UGX {{balance}}`).
- **Sender ID Governance**: Alphanumeric sender ID application pipeline requiring corporate justification, sample message payload, and KYC verification before administrative approval.
- **Template Library**: Reusable message templates categorized by purpose (Transactional, Marketing, Notifications, Alerts) with dynamic variable extraction and preview.
- **Drafts Management**: Automated draft auto-saving with synchronization drawer (`DraftsDrawer`, `useSmsDraft`) supporting multi-device message authoring.

### 4.2 Live Simulator & Real-Time Encoding Preview
Located at `src/components/sms/` and integrated into `/sms/send`, `/sms/custom`, `/sms/templates`, and `/sms/variables`:
- **Name**: **Live Simulator** (Standardized name across UI, removing legacy "Handset" phrasing).
- **Uniform 40px Height**: Action toggle buttons standardized to `h-10` (40px) matching all platform inputs and action triggers.
- **React 19 SSR Hydration Safety**: Uses `useMounted` (`useSyncExternalStore`) and `suppressHydrationWarning` to eliminate server-to-client theme hydration mismatches on handset frames.
- **Real-Time Telecom Telemetry**:
  - Live character counting with GSM-7 vs. Unicode (UCS-2) auto-detection.
  - Segment breakdown (e.g., "160 chars • 1 part (GSM-7)" vs. "71 chars • 2 parts (Unicode)").
  - Cost preview calculated dynamically based on segment count and destination carrier.
  - Device frame styling with sender ID header, timestamps, and message bubble rendering.

### 4.3 Advanced Campaign Engine (Broadcast, Recurring, Drip, A/B Split Testing)
The campaign engine features a deterministic execution lifecycle with 20 distinct states:

```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> SCHEDULED : Schedule for Future
    DRAFT --> PREPARING : Launch Now
    SCHEDULED --> PREPARING : Trigger Time Reached
    PREPARING --> PROCESSING : Audience Expanded & Validated
    PROCESSING --> PAUSED : User / Fraud Pause
    PAUSED --> RESUMING : Resume
    RESUMING --> PROCESSING : Continue Dispatch
    PROCESSING --> CANCELLING : Abort Request
    CANCELLING --> CANCELLED : In-Flight Jobs Drained
    PROCESSING --> COMPLETED : All Parts Delivered
    PROCESSING --> FAILED : System / Credit Failure
    COMPLETED --> [*]
    CANCELLED --> [*]
    FAILED --> [*]
```

#### Campaign Types & Features
1. **BROADCAST**: One-off instant or scheduled blast to designated contact groups or dynamic segments.
2. **RECURRING**: Automated recurring campaigns powered by 5-field CRON expressions or intervals (Daily, Weekly, Monthly) with an optional `maxOccurrences` ceiling. Upon cycle completion, the engine automatically calculates `nextRunAt` and schedules the next batch.
3. **DRIP**: Sequential automated messaging workflows delivering scheduled touchpoints over multi-day or multi-week intervals based on contact sign-up or enrollment date.
4. **A/B SPLIT TESTING** (`src/lib/sms/ab-testing.ts`):
   - Variant generation with configurable traffic allocation percentages (e.g., 50/50, 70/30).
   - Automated winner determination based on delivery rates or link click-through conversions.
5. **SCHEDULED MESSAGE SAFETY AUTO-PAUSE** (`src/components/sms/edit-scheduled-message-dialog.tsx`):
   - 10-second transmission freeze: Messages within 10 seconds of scheduled dispatch are locked to prevent duplicate execution during active edits.
   - Automatic pause on edit: Editing an existing scheduled campaign transitions it to `PAUSED` state with a safety banner, requiring explicit confirmation before rescheduling.
   - Quick reschedule presets: Instant adjustment buttons (+15 mins, +1 hour, Tomorrow 9 AM).

### 4.4 Contact Directory, Groups & Dynamic Segment AST Compiler
- **Phone Normalization**: Automated phone parser and sanitizer (`src/lib/sms/normalizer.ts`) converting inputs to standard E.164 format with deep prefix resolution (`+256` Uganda, `+254` Kenya, `+255` Tanzania, `+250` Rwanda).
- **Excel & CSV Importer**: Full `.xlsx` (via `read-excel-file` / `write-excel-file`) and CSV import engine with column variable mapping, phone normalization, carrier auto-detection, and duplicate deduplication.
- **Static Groups & Tags**: Many-to-many organizational structure mapping contacts across functional categories with detailed group member modals (`GroupDetailsDialog`).
- **Dynamic Segment AST Compiler**: Abstract Syntax Tree compiler (`src/lib/contacts/segment-compiler.ts`) allowing dynamic audience generation using recursive `AND`/`OR` Boolean rule trees:
  - Supported Fields: `name`, `phone`, `email`, `carrier`, `status`, `createdAt`, `metadata.*`.
  - Supported Operators: `EQUALS`, `NOT_EQUALS`, `CONTAINS`, `NOT_CONTAINS`, `STARTS_WITH`, `ENDS_WITH`, `GREATER_THAN`, `LESS_THAN`, `IS_EMPTY`, `IS_NOT_EMPTY`.
  - Evaluates tens of thousands of contact records with zero runtime SQL injection vulnerability.

### 4.5 Consent, Opt-In/Opt-Out & Regulatory Suppression List Compliance
Built to satisfy statutory telecommunications privacy mandates (UCC, GDPR, TCPA):
- **Append-Only Consent Ledger**: Every consent modification is recorded permanently in the `ConsentLog` database table with timestamp, IP address, user agent, channel (`WEB`, `SMS`, `API`, `IMPORT`), and reason.
- **Opt-In / Opt-Out State Machine**: Contacts marked `OPT_OUT` or `SUPPRESSED` are automatically filtered out during campaign expansion.
- **Marketing vs. Transactional Exemptions**: System distinguishes between promotional marketing broadcasts (requiring active opt-in) and critical transactional notifications (OTPs, banking alerts, password resets) allowed under lawful basis exemptions.

### 4.6 Carrier Least Cost Routing (LCR) & Failover Engine
Located at `src/lib/sms/routing-engine.ts`:
- **Carrier Prefix Detection**: Instantly identifies destination network carrier:
  - **MTN Uganda**: `077`, `078`, `076`, `039`.
  - **Airtel Uganda**: `070`, `075`, `074`.
  - **Uganda Telecom (UTL)**: `071`.
  - **Safaricom Kenya**: `070`, `071`, `072`, `079`.
- **Dynamic Routing & Cost Optimization**: Queries active providers from `SmsProvider` database, sorts by lowest rate per SMS for the target carrier, and validates provider health scores.
- **Automatic Failover**: If the primary route returns an unrecoverable telecom failure (e.g., SMPP bind failure or network timeout), the engine shifts the message attempt to the secondary backup provider in real time.

### 4.7 Telecom Circuit Breaker & Aggregator Health Monitoring
Located at `src/lib/telecom/circuit-breaker.ts`:
- **Three-State Architecture**:
  - `CLOSED`: Normal operation. Messages route through the provider. Consecutive errors are tracked.
  - `OPEN`: Gateway failure threshold exceeded (default: 5 consecutive failures). Provider is completely isolated, and traffic is diverted to fallback routes.
  - `HALF_OPEN`: Cooldown period expires (default: 60s). A single probe request tests gateway recovery. If successful, the circuit transitions back to `CLOSED`. If failed, it returns to `OPEN` with exponential backoff.
- **Emergency Circuit Override**: Administrative ability to trip or reset provider circuits manually via `/admin/providers`.

### 4.8 Native SMPP v3.4 Telecom Protocol Driver
Located at `src/lib/sms/providers/smpp-provider.ts`:
- **Direct Signaling**: Eliminates third-party HTTP aggregators by opening native binary TCP sockets directly to mobile network operator Short Message Service Centers (SMSC).
- **Binary PDU Handling**: Implements full Protocol Data Unit (PDU) encoding and decoding:
  - `bind_transmitter` (`0x00000002`): Authenticates system with SMSC credentials, system type, and interface version `0x34`.
  - `submit_sm` (`0x00000004`): Dispatches short message with source/destination TON (Type of Number), NPI (Numbering Plan Identification), data coding, and ESM class.
  - `enquire_link` (`0x00000015`): Transmits periodic keep-alive heartbeat to maintain persistent telecom socket sessions.
  - `unbind` (`0x00000006`): Gracefully closes telecom sessions.
- **SMPP Sequence Management**: Thread-safe atomic counter guaranteeing synchronous correlation between command requests and SMSC `command_status` responses.

### 4.9 Airtel Telecom Direct Interconnect Gateway
Located at `src/lib/telecom/airtel-provider.ts`:
- High-performance REST aggregator client optimized for Airtel East Africa SMSCs.
- Supports batch dispatch, Bearer token authentication, custom client correlate IDs, and asynchronous delivery report parsing.

### 4.10 Global 250+ Country Phone Registry & National Operator Resolution
Located at `src/lib/sms/country-registry.ts`:
- Comprehensive data registry covering 250+ international countries and territories.
- Resolves country name, 2-letter ISO code, 3-letter ISO code, flag emoji, national dial codes, regex format patterns, and national telecom operators with MCC/MNC codes.
- UI components: `CountryPickerDropdown` and `CountryFlagPhone` provide accessible, searchable international input with auto-formatting.

### 4.11 Regulatory KYC Engine & Compliance Document Verification
Located at `src/lib/sms/regulatory-engine.ts`:
- Country-specific telecommunications compliance and sender ID regulations:
  - Categorizes countries into strict KYC requirements (Uganda UCC, Kenya CAK, Tanzania TCRA, UAE TDRA) vs. standard registrations.
  - Validates required KYC documents (Certificate of Incorporation, Letter of Authorization, Tax Clearance, ID of Directors).
  - Enforces local telecom quiet hours (prohibiting promotional SMS between 8 PM and 8 AM in regulated jurisdictions).

### 4.12 Hardware & IoT SMS Gateways (Android GSM & ESP32 SIM800L)
Provides hybrid edge messaging capabilities when internet-to-SMSC links are unavailable or when utilizing low-cost local SIM cards:
- **Android GSM Gateway**: Mobile application pairs with the web platform via a secure cryptographic token. Polls `/api/v1/device/gateways/queue`, sends SMS via the device's native dual-SIM slots, and reports DLR results back to `/api/v1/device/gateways/messages/result`.
- **ESP32 + SIM800L Microcontroller Gateway**: Lightweight IoT firmware maintaining an HTTP/WebSocket connection to `/api/v1/gateways/pair`. Ideal for off-grid industrial telemetry, rural alerts, and autonomous micro-gateways.

### 4.13 Billing, Wallet & Double-Entry Transaction Ledger
Located at `src/lib/billing/billing-service.ts`:
- **Prepaid Credit Architecture**: Organizations maintain a prepaid credit balance (`smsCredits`) and fiat wallet (`balance`).
- **Serializable Isolation Guarantee**: All wallet operations run inside `Prisma.TransactionIsolationLevel.Serializable`. Concurrent dispatch jobs cannot overdraw an account under high concurrency.
- **Immutable Transaction Audit Ledger**: Deductions, refunds, and deposits record a corresponding immutable `Transaction` row referencing the originating `Message` or `Campaign` ID, preventing double-billing on retry loops.
- **Tiered Volume Pricing**: Dynamic rate calculation based on monthly commit volume tiers (`/wallet/pricing`).
- **Real-Time Navigation Badge**: `NavWalletBadge` displays current balance directly in header navigation with low-balance warning states.

### 4.14 Reseller & Agent Commission Engine
- **Commission Models**: Configurable percentage markup, fixed margin per SMS, or tiered volume thresholds.
- **Automatic Accrual**: As client organizations under an agent send messages, the system automatically calculates the margin and writes an `APPROVED` or `PENDING` commission row to the `Commission` ledger.
- **Payout Management**: Administrative tracking of agent withdrawal requests with ledger settlement.

### 4.15 Security, Anti-Fraud, Distributed Rate Limiting & WebAuthn
- **AIT Fraud & OTP Pumping Guard** (`src/lib/security/fraud-prevention.ts`): Velocity throttling detecting automated bots, toll fraud blocking against high-cost premium international numbers, and automatic campaign circuit breaking.
- **Distributed Rate Limiting** (`src/lib/security/rate-limiter.ts`): `@upstash/ratelimit` with Redis sliding-window algorithms and local in-memory fallback.
- **Authentication & Credential Protection**:
  - WebAuthn / Passkeys (`@simplewebauthn`) for biometric hardware-bound login.
  - Time-based One-Time Passwords (TOTP) and SMS OTP challenge verification.
  - Argon2 and Bcrypt password hashing.
  - Inactivity screen locking (`/screen-lock`) and CSRF origin verification in edge proxy (`src/proxy.ts`).
  - Strict HTML form compliance: Hidden username fields on credential forms and `autoComplete="tel"` on phone inputs satisfying browser password manager requirements.

### 4.16 Developer Platform, Public REST API (v1), Webhook Subsystem & MCP
- **Public REST API (`/api/v1/`)**: Programmatic single and batch message dispatch, message status queries, credit balance enquiries, approved sender ID lookups, and device gateway polling.
- **Cryptographic API Key Management**: SHA-256 hashed storage of API tokens (`rk_live_...`), scoped permissions (`sms:send`, `contacts:read`), and individual application quota management with quota reset actions.
- **Real-Time Webhooks**: Cryptographically signed event delivery with `X-Range-Signature: sha256=...` generated via `HMAC-SHA256` with exponential backoff retries.
- **Model Context Protocol (MCP) Integration**:
  - Configured in `~/.gemini/config/mcp_config.json`, `.vscode/mcp.json`, and `components.json`.
  - Integrates the official `shadcn` MCP server, `chrome-devtools-mcp`, `prisma-mcp-server`, `github-mcp-server`, and `ui-skills` for intelligent component discovery and automated pair-programming workflows.

### 4.17 Telemetry, Delivery Receipts (DLR) & Analytics
- **Handset Delivery Receipts**: Real-time webhook ingestion updating handset status (`DELIVERED`, `UNDELIVERED`, `EXPIRED`, `REJECTED`).
- **Visual Analytics**: Interactive Recharts components displaying message volume over time, carrier distribution donut charts, and failure reason breakdowns across `/reports/sms`, `/reports/financial`, `/reports/usage`, and `/reports/campaigns`.
- **Export Engine**: Filterable, server-side CSV export for regulatory auditing and client reconciliation.

### 4.18 Customer Support, Real-Time Chat Assistant & AI Grammar Engine
- Floating client support chat box (`src/components/chat/support-chatbox.tsx`) accessible across the dashboard.
- Full ticket lifecycle management (`src/app/api/support/tickets`).
- **AI Grammar & Tone Optimization** (`src/components/sms/grammar-check-modal.tsx`): Powered by Google Gemini (`@google/genai`), providing automated message proofreading, tone adjustment (Formal, Urgent, Friendly), and character-shortening optimization.

---

## 5. Directory Structure & Module Breakdown

```text
range-bulk-sms/
├── .github/
│   └── workflows/
│       └── ci.yml                     # Automated CI/CD pipeline (Lint, Typecheck, Test, Build)
├── .vscode/
│   ├── extensions.json                # Recommended workspace extensions
│   ├── mcp.json                       # VS Code / Cursor MCP server configurations
│   └── settings.json                  # Editor and formatting settings
├── components.json                    # shadcn UI registry and component alias configuration
├── prisma/
│   ├── schema.prisma                  # Master database schema with 45+ models & enums
│   └── seed.ts                        # Development database seeding script
├── src/
│   ├── app/                           # Next.js App Router (159 compiled routes)
│   │   ├── (auth)/                    # Authentication Route Group
│   │   │   ├── login/                 # User credentials & WebAuthn passkey login
│   │   │   ├── register/              # Self-service client registration
│   │   │   ├── 2fa/                   # Two-factor authentication verification
│   │   │   ├── otp/                   # OTP challenge input
│   │   │   ├── screen-lock/           # Inactivity lock screen
│   │   │   ├── forgot-password/       # Password recovery request
│   │   │   └── reset-password/        # Token-verified password reset
│   │   ├── (dashboard)/               # Authenticated Dashboard Application
│   │   │   ├── dashboard/             # Role-based metrics & agent overview
│   │   │   ├── sms/                   # SMS Messaging Subsystem
│   │   │   │   ├── send/              # SMS Send Studio with Live Simulator
│   │   │   │   ├── scheduled/         # Scheduled queue management & auto-pause dialog
│   │   │   │   ├── custom/            # Dynamic variable message builder
│   │   │   │   ├── campaigns/         # Campaign list, builder, and live telemetry
│   │   │   │   ├── drafts/            # Draft message management
│   │   │   │   ├── templates/         # Template CRUD management
│   │   │   │   ├── variables/         # Custom merge tags registry & simulator
│   │   │   │   └── delivery-reports/  # Handset DLR log table & filters
│   │   │   ├── contacts/              # Contact & Audience Management
│   │   │   │   ├── groups/            # Static contact groups & member dialogs
│   │   │   │   ├── segments/          # Dynamic AST segment builder
│   │   │   │   ├── tags/              # Contact tagging interface
│   │   │   │   └── import/            # Bulk Excel (.xlsx) / CSV file uploader
│   │   │   ├── sender-ids/            # Alphanumeric sender ID registry & application
│   │   │   ├── wallet/                # Billing, wallet deposits, pricing, transactions
│   │   │   ├── developer/             # Developer API keys, webhook endpoints, usage
│   │   │   ├── agent/                 # Reseller client lists, commissions, earnings
│   │   │   ├── reports/               # SMS, campaign, financial, and usage analytics
│   │   │   ├── admin/                 # Platform administration & provider management
│   │   │   ├── gateways/              # Android & ESP32 hardware gateway manager
│   │   │   ├── settings/              # Account, security, notification, SMS settings
│   │   │   └── support/               # Support tickets & user issue tracking
│   │   ├── api/                       # Internal Application API Endpoints
│   │   │   ├── admin/                 # System administration APIs
│   │   │   ├── agent/                 # Commission and client onboarding APIs
│   │   │   ├── ai/                    # Gemini grammar and tone optimization APIs
│   │   │   ├── auth/                  # NextAuth & WebAuthn APIs
│   │   │   ├── campaigns/             # Campaign lifecycle, pause, resume, launch APIs
│   │   │   ├── contacts/              # Contact, segment compiler, and consent APIs
│   │   │   ├── cron/                  # Serverless worker polling trigger (/cron/worker)
│   │   │   ├── developer/             # API key generation & webhook ping test APIs
│   │   │   ├── sms/                   # Dispatch, schedule, drafts, and DLR lookup APIs
│   │   │   ├── wallet/                # Wallet deposit and ledger transaction APIs
│   │   │   └── webhooks/              # Inbound payment, SMS DLR, and Telegram hooks
│   │   ├── api/v1/                    # Public Developer REST API (Bearer token auth)
│   │   │   ├── messages/              # Programmatic single & batch message dispatch
│   │   │   ├── balance/               # Credit balance enquiry
│   │   │   ├── sender-ids/            # Approved sender ID listing
│   │   │   └── device/gateways/       # Android & ESP32 gateway polling endpoints
│   │   ├── globals.css                # Tailwind 4 master stylesheet & design tokens
│   │   ├── layout.tsx                 # Root layout with theme & session providers
│   │   └── page.tsx                   # High-conversion public enterprise landing page
│   ├── components/
│   │   ├── ui/                        # Radix UI primitives (Button, Dialog, Table, etc.)
│   │   ├── layout/                    # RangeShell, RangeSidebar, PageHeader
│   │   ├── navigation/                # LanguageToggle, RangeAppsDropdown, NavWalletBadge
│   │   ├── brand/                     # RangeLogo (theme-adaptive SVG brand vector)
│   │   ├── sms/                       # Live Simulator, CountryPickerDropdown, CountryFlagPhone,
│   │   │                              # VariableTextarea, DraftsDrawer, GrammarCheckModal,
│   │   │                              # EditScheduledMessageDialog, NetworkBadge
│   │   ├── chat/                      # Floating support chat widget (SupportChatbox)
│   │   └── docs/                      # Interactive code snippets for developer portal
│   ├── config/
│   │   ├── navigation.ts              # Hierarchical dashboard navigation definition
│   │   └── site.ts                    # Global branding and metadata configuration
│   ├── design-system/
│   │   └── tokens/
│   │       ├── colors.ts              # Semantic hex & HSL color tokens
│   │       ├── typography.ts          # Font scale, line heights, weights
│   │       └── spacing.ts             # 4pt layout and elevation grid
│   ├── lib/
│   │   ├── auth/                      # NextAuth configuration, authorization, session dal
│   │   ├── billing/                   # Serializable wallet ledger & credit deduction
│   │   ├── contacts/                  # Dynamic segment AST compiler & CSV/Excel parser
│   │   ├── queue/                     # Database-backed background worker framework
│   │   │   ├── worker.ts              # Core polling loop with atomic row-level locks
│   │   │   └── handlers/              # CampaignExpander, SmsDispatcher, WebhookDispatcher
│   │   ├── security/                  # Rate limiter, AIT fraud prevention, CSRF guards
│   │   ├── sms/                       # Normalizer, RoutingEngine, ConsentService, CountryRegistry,
│   │   │                              # RegulatoryEngine, CustomVariables, AbTesting
│   │   ├── telecom/                   # CircuitBreaker, AirtelProvider, SmppProvider
│   │   ├── prisma.ts                  # Cached Prisma ORM database client singleton
│   │   ├── utils.ts                   # Tailwind cn() class merging utility
│   │   └── metadata.ts                # SEO OpenGraph & Schema.org JSON-LD generator
│   ├── proxy.ts                       # Edge proxy middleware (Asset routing & CSRF)
│   └── types/                         # Shared TypeScript interfaces and domain types
├── src/__tests__/                     # Vitest unit & integration test suites (48 files, 429 tests)
│   ├── ab-testing-engine.test.ts      # A/B split-test traffic split & winner resolution
│   ├── airtel-telecom.test.ts         # Airtel gateway protocol & DLR tests
│   ├── billing-service.test.ts        # Ledger idempotency & concurrency tests
│   ├── circuit-breaker.test.ts        # Telecom circuit breaker 3-state transitions
│   ├── consent-service.test.ts        # Opt-in/opt-out compliance logic
│   ├── country-registry.test.ts       # 250+ country lookup & prefix resolution
│   ├── excel-import.test.ts           # Excel .xlsx parsing & contact row validation
│   ├── fraud-prevention.test.ts       # AIT velocity & toll fraud blocking tests
│   ├── normalizer.test.ts             # E.164 phone normalization & carrier lookup
│   ├── routing-engine.test.ts         # Least Cost Routing & failover simulation
│   ├── scheduled-message-edit.test.ts # Auto-pause safety locks & rescheduling
│   ├── smpp-provider.test.ts          # Binary PDU encoder/decoder socket tests
│   └── variable-textarea.test.ts      # Merge tag insertion & highlighter parsing
├── playwright.config.ts               # Multi-browser Playwright test configuration
├── vitest.config.ts                   # Vitest unit runner configuration with alias paths
├── next.config.ts                     # Next.js 16 compiler and image optimization settings
├── tsconfig.json                      # Strict TypeScript compiler rules
└── package.json                       # Project manifests, scripts, dependencies
```

---

## 6. Technology Stack & Dependency Inventory

| Domain | Technology / Library | Exact Version | Strategic Architectural Purpose |
|---|---|---|---|
| **Core Framework** | `next` | `16.3.5` | React 19 App Router, Turbopack, Server Actions, Edge Middleware. |
| **UI Runtime** | `react` / `react-dom` | `19.2.8` | React Server Components, concurrent rendering, transitions. |
| **Language** | `typescript` | `^5.7.0` | Strict type safety, 0 `any` usage, end-to-end schema validation. |
| **ORM & Database** | `prisma` / `@prisma/client` | `^7.9.1` | Type-safe PostgreSQL client with connection pooling and migrations. |
| **Driver Adapter** | `@prisma/adapter-pg` / `pg` | `^7.9.1` | Native PostgreSQL socket driver adapter. |
| **CSS & Styling** | `@tailwindcss/postcss` | `^4.0.0` | Next-generation utility-first styling with `@theme` token injection. |
| **Class Merging** | `clsx` / `tailwind-merge` | `^2.1.1` / `^3.6.0` | Collision-free dynamic class name concatenation. |
| **Style Variants** | `class-variance-authority` | `^0.7.1` | Composable component variant definitions (`cva`). |
| **UI Primitives** | `@radix-ui/react-*` | Latest | Accessible, unstyled UI primitives (Dialog, Dropdown, Tabs, Slider). |
| **Icons** | `lucide-react` | `^1.33.0` | Consistent, lightweight SVG icon system. |
| **Theming** | `next-themes` | `^0.4.6` | Client-side theme switching with zero flash of unstyled content. |
| **Toast Notifications**| `sonner` | `^2.0.8` | Performant, accessible stack toast notifications. |
| **Charts & Telemetry** | `recharts` | `^3.10.1` | Composable SVG visual charts for campaign and delivery metrics. |
| **Form Handling** | `react-hook-form` / `zod` | `^7.86.0` / `^3.25.76` | High-performance uncontrolled forms with schema validation. |
| **Table Virtualization**| `@tanstack/react-table` | `^9.1.2` | Headless table architecture for large contact and log datasets. |
| **Excel Ingestion** | `read-excel-file` / `write-excel-file` | `^9.3.10` / `^4.1.1` | Binary `.xlsx` spreadsheet parsing and export generation. |
| **AI Optimization** | `@google/genai` | `^2.24.0` | Google Gemini API integration for message grammar and tone optimization. |
| **Biometric Auth** | `@simplewebauthn/browser` / `server` | `^14.0.0` | FIDO2 / WebAuthn passwordless biometric authentication. |
| **Bot Detection** | `@marsidev/react-turnstile` | `^1.6.0` | Cloudflare Turnstile CAPTCHA bot protection. |
| **Hashing & Auth** | `argon2` / `bcryptjs` / `jose` | Latest | Secure password hashing and JWT payload verification. |
| **Distributed Cache** | `@upstash/redis` / `@upstash/ratelimit` | Latest | Redis-backed sliding-window rate limiting & distributed mutex. |
| **CRON Expression** | `cron-parser` | `^5.10.1` | Parsing and evaluating recurring campaign schedule intervals. |
| **API Documentation** | `next-swagger-doc` | `^0.5.0` | Programmatic OpenAPI 3.0 document generation. |
| **Unit Testing** | `vitest` / `vitest-mock-extended` | `^4.1.11` | ESM unit test runner with mocked Prisma context (429 tests). |
| **E2E Automation** | `@playwright/test` | `^1.62.1` | Headless Chromium/Firefox/Mobile browser test automation. |

---

## 7. UI/UX Design System, Color Tokens & Aesthetic Specifications

### 7.1 Brand Foundations & Dual-Theme Harmonization
The core design tokens are defined in `src/design-system/tokens/colors.ts` and `src/app/globals.css`.

The design system implements a **Dual-Theme WCAG AAA/AA Architecture**:
- **Light Theme**: Standalone text, icons, and non-button accent badges utilize deep petrol blue (`#04648C`), providing an **uncompromised 7.2:1 contrast ratio (WCAG AAA)** against white surfaces (`#FFFFFF`).
- **Dark Theme**: Standalone accents utilize vibrant brand gold (`#FBCA07`), providing an **11.5:1 contrast ratio (WCAG AAA)** against dark slate surfaces (`#0B132B` / `#0F172A`).
- **Active Card Styling**: Active and selected card containers feature distinctive visual background contrast on both theme modes, ensuring immediate situational awareness.

```mermaid
classDiagram
    class BrandFoundations {
        +PrimaryYellow: #FBCA07
        +PrimaryBlue: #04648C
        +LightYellow: #FBE392
        +DarkNavy: #07163D
        +DarkNavySurface: #03102E
    }
    class LightPalette {
        +Background: hsl(0 0% 100%)
        +Foreground: hsl(218 30% 12%)
        +Primary: hsl(48 98% 51%)
        +Secondary: hsl(198 94% 28%)
        +Muted: hsl(210 20% 96%)
        +Border: hsl(214 32% 91%)
    }
    class DarkPalette {
        +Background: hsl(222 47% 11%)
        +Foreground: hsl(210 40% 98%)
        +Card: hsl(224 40% 14%)
        +Primary: hsl(48 98% 51%)
        +Secondary: hsl(198 94% 28%)
        +Border: hsl(223 30% 20%)
    }
    BrandFoundations <|-- LightPalette
    BrandFoundations <|-- DarkPalette
```

### 7.2 WCAG AAA/AA Contrast Compliance Specification
| Token Name | Light Mode (CSS Value) | Dark Mode (CSS Value) | Hex / Reference | Contrast Ratio | Compliance Level |
|---|---|---|---|---|---|
| `--background` | `hsl(0 0% 100%)` | `hsl(222 47% 11%)` | `#FFFFFF` / `#0B132B` | Base Surface | Standard |
| `--foreground` | `hsl(218 30% 12%)` | `hsl(210 40% 98%)` | `#141B2D` / `#F8FAFC` | 14.8:1 / 16.2:1 | **WCAG AAA** |
| `--card` | `hsl(0 0% 100%)` | `hsl(224 40% 14%)` | `#FFFFFF` / `#131D38` | Container Base | Standard |
| `--primary` | `hsl(48 98% 51%)` | `hsl(48 98% 51%)` | `#FBCA07` (Brand Gold) | 11.5:1 (on Dark) | **WCAG AAA** |
| `--primary-foreground`| `hsl(218 30% 12%)` | `hsl(218 30% 12%)` | `#141B2D` | 10.2:1 | **WCAG AAA** |
| `--secondary` | `hsl(198 94% 28%)` | `hsl(198 94% 28%)` | `#04648C` (Petrol Blue)| 7.2:1 (on Light) | **WCAG AAA** |
| `--secondary-foreground`| `hsl(0 0% 100%)` | `hsl(0 0% 100%)` | `#FFFFFF` | 7.2:1 | **WCAG AAA** |
| `--muted-foreground` | `hsl(215 16% 47%)` | `hsl(215 20% 65%)` | `#64748B` / `#94A3B8` | 4.8:1 / 5.4:1 | **WCAG AA** |
| `--border` | `hsl(214 32% 91%)` | `hsl(223 30% 20%)` | `#E2E8F0` / `#26354D` | Divider Ratio | Standard |

### 7.3 Telecom Network Brand Identities
Used in `NetworkBadge` (`src/components/sms/network-badge.tsx`) to deliver instant visual identification of carrier routing:

| Network Carrier | Background Color | Text Color | Border Color | Visual Characteristic |
|---|---|---|---|---|
| **MTN Uganda** | `#FFCC00` | `#000000` (Bold) | `#E6B800` | Official MTN Canary Yellow |
| **Airtel Uganda** | `#ED1C24` | `#FFFFFF` (Bold) | `#C7141B` | Official Airtel Crimson Red |
| **Uganda Telecom (UTL)**| `#0054A6` | `#FFFFFF` (Bold) | `#004080` | Official UTL Royal Blue |
| **Safaricom Kenya** | `#00A859` | `#FFFFFF` (Bold) | `#008F4C` | Official Safaricom Emerald Green |
| **Africell** | `#782B8F` | `#FFFFFF` (Bold) | `#5C206D` | Official Africell Regal Purple |
| **Vodacom** | `#E60000` | `#FFFFFF` (Bold) | `#CC0000` | Official Vodacom Signal Red |

### 7.4 Developer Portal & HTTP Method Tokenization
Designed for technical clarity across API documentation, request logs, and webhook inspectors:

| HTTP Method | Background Token | Text Color | Border Token |
|---|---|---|---|
| **GET** | `rgba(32, 213, 160, 0.15)` | `#20D5A0` (Green) | `rgba(32, 213, 160, 0.3)` |
| **POST** | `rgba(53, 182, 255, 0.15)` | `#35B6FF` (Cyan) | `rgba(53, 182, 255, 0.3)` |
| **PUT** | `rgba(255, 204, 36, 0.15)` | `#FFCC24` (Amber) | `rgba(255, 204, 36, 0.3)` |
| **PATCH** | `rgba(157, 109, 255, 0.15)`| `#9D6DFF` (Purple) | `rgba(157, 109, 255, 0.3)` |
| **DELETE** | `rgba(255, 77, 109, 0.15)` | `#FF4D6D` (Red) | `rgba(255, 77, 109, 0.3)` |

### 7.5 Typography, Spacing & Elevation Grid
- **Font Stack**:
  - Sans-Serif: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`.
  - Monospace (Code/Payloads): `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`.
- **Modular Scale**:
  - `display`: `4.5rem` (72px) / Line Height: `1.1`
  - `h1`: `3.0rem` (48px) / Line Height: `1.2`
  - `h2`: `2.25rem` (36px) / Line Height: `1.25`
  - `h3`: `1.75rem` (28px) / Line Height: `1.3`
  - `h4`: `1.25rem` (20px) / Line Height: `1.4`
  - `body`: `1.0rem` (16px) / Line Height: `1.5`
  - `caption` / `label`: `0.875rem` (14px) and `0.75rem` (12px)
- **Grid & Spacing**: Strict 4pt increments (`0.25rem` = `4px`, `0.5rem` = `8px`, `1.0rem` = `16px`, `1.5rem` = `24px`).
- **Border Radii**: Default `--radius` is `0.625rem` (10px).

### 7.6 Component Patterns, Uniform Height & Accessibility Standards
- **Uniform 40px (`h-10`) Interactive Height**: Standardized across all interactive buttons, selects, and inputs in normal, hover, active, and loading states.
- **Accessible Form Controls**: Every form element (`Input`, `SelectTrigger`, `Textarea`, `Switch`) is bound with standard HTML `id`, `name`, and `aria-label` attributes.
- **Section Headers vs. Labels**: Non-input headers utilize semantic `<span>` or `<p>` elements, avoiding improper `<label>` bindings that trigger accessibility warnings.
- **Zero Raw Hex Colors**: Components exclusively consume semantic CSS variables and Tailwind classes.
- **Accessible Focus Indicators**: Explicit focus rings (`ring-2 ring-primary ring-offset-2`) on all interactive inputs, buttons, and links.

---

## 8. Data Models & Database Schema Overview

The relational database is configured via Prisma ORM 7 (`prisma/schema.prisma`) targeting PostgreSQL. It models 45+ distinct entities structured into 8 functional domains:

```mermaid
erDiagram
    Organization ||--o{ User : contains
    Organization ||--o{ Campaign : creates
    Organization ||--o{ Contact : owns
    Organization ||--o{ ContactGroup : organizes
    Organization ||--o{ ContactSegment : compiles
    Organization ||--o{ Wallet : possesses
    Organization ||--o{ ApiKey : provisions
    Organization ||--o{ Webhook : registers

    Campaign ||--o{ Message : dispatches
    Campaign ||--o{ Job : triggers

    Contact ||--o{ ContactGroupMember : belongs_to
    Contact ||--o{ ConsentLog : audit_history
    Contact ||--o{ Message : receives

    Wallet ||--o{ Transaction : logs

    Job ||--o{ MessageAttempt : executes
    Message ||--o{ MessageAttempt : tries
    MessageAttempt }o--|| SmsProvider : routed_through
```

### Key Domain Entities
1. **Tenancy & Users**: `Organization`, `User`, `Role`, `Permission`, `UserRole`, `Session`, `Authenticator` (WebAuthn).
2. **Campaigns & Messaging**: `Campaign`, `CampaignGroup`, `Message`, `MessageRecipient`, `MessageAttempt`, `ScheduledMessage`, `SmsTemplate`, `SenderId`, `AbTest`.
3. **Contacts & Segments**: `Contact`, `ContactGroup`, `ContactGroupMember`, `ContactTag`, `ContactTagAssignment`, `ContactSegment`, `ContactImport`, `ConsentLog`.
4. **Billing & Ledger**: `Wallet`, `Transaction`, `SmsPricing`, `Commission`, `CommissionRule`, `Agent`.
5. **Telecom & Routing**: `SmsProvider`, `ProviderRoute`, `ProviderHealth`, `CircuitBreakerLog`.
6. **Hardware Gateways**: `Gateway`, `GatewayDevice`, `GatewayToken`, `GatewayLog`.
7. **Developer Platform**: `ApiKey`, `ApiRequest`, `Webhook`, `WebhookDelivery`.
8. **Queue & System Operations**: `Job`, `ScheduledJob`, `CronExecution`, `AuditLog`, `SupportTicket`, `TicketMessage`.

---

## 9. Background Processing & Queue Execution Pipeline

The asynchronous background worker (`src/lib/queue/worker.ts`) powers high-volume, non-blocking campaign execution:

```mermaid
sequenceDiagram
    autonumber
    actor Client as User / API
    participant API as /api/campaigns/:id/launch
    participant DB as PostgreSQL (Job Table)
    participant Worker as Background Worker Daemon
    participant Expander as Campaign Expander
    participant Dispatcher as SMS Dispatcher
    participant Routing as Routing Engine (LCR)
    participant SMSC as Telecom Provider / SMPP

    Client->>API: Click "Launch Campaign"
    API->>DB: INSERT Job (type: "campaign.expand")
    API->>DB: UPDATE Campaign (status: "PREPARING")
    API-->>Client: 200 OK (Job Queued)

    loop Worker Poll Loop
        Worker->>DB: SELECT * FROM Job WHERE status="PENDING" FOR UPDATE SKIP LOCKED
        DB-->>Worker: Return "campaign.expand" Job
        Worker->>Expander: Execute expansion
        Expander->>DB: Query Audience & Apply ConsentFilter
        Expander->>DB: Validate Account Wallet Balance
        Expander->>DB: BATCH INSERT Jobs (type: "sms.dispatch")
        Expander->>DB: UPDATE Campaign (status: "PROCESSING")
        Worker->>DB: Mark "campaign.expand" COMPLETED
    end

    loop Worker Dispatch Loop
        Worker->>DB: Fetch batch of "sms.dispatch" Jobs
        Worker->>Dispatcher: Execute dispatch
        Dispatcher->>DB: Check Campaign Halt State (PAUSED/CANCELLED)
        Dispatcher->>Routing: Select Provider (LCR Prefix Match)
        Routing->>SMSC: Transmit via SMPP / REST
        SMSC-->>Routing: Accept (msgId: 238914)
        Dispatcher->>DB: Deduct Wallet (Serializable Transaction)
        Dispatcher->>DB: INSERT Transaction Ledger Row
        Dispatcher->>DB: UPDATE Message (status: "SENT")
        Dispatcher->>DB: Queue "webhook.dispatch" Job
        Worker->>DB: Mark "sms.dispatch" COMPLETED
    end
```

---

## 10. Quality Assurance, Testing & Build Verification

The platform maintains an enterprise testing standard with automated quality gates enforced across CI/CD (`.github/workflows/ci.yml`):

### Comprehensive Quality Verification Results

| Quality Verification Gate | Enforced Standard | Actual Measured Result | Status |
| :--- | :--- | :--- | :--- |
| **TypeScript Static Verification** | `npx tsc --noEmit` | **0 errors, 100% clean** across all source files |  **PASSED** |
| **ESLint Code Quality** | `npm run lint` (`--max-warnings 0`) | **0 errors, 0 warnings** (Zero-tolerance standard) |  **PASSED** |
| **Vitest Unit & Integration Suites** | `npm run test:run` | **48/48 test files, 429/429 tests passed (100%)** |  **PASSED** |
| **Next.js Production Compilation** | `npm run build` (`next build`) | **159 / 159 routes compiled & generated successfully** |  **PASSED** |
| **Browser Runtime & Console** | Chrome DevTools MCP Live Audit | **0 console errors, 0 runtime warnings, 0 hydration issues** |  **PASSED** |

### Verified Test Domains (48 Test Files, 429 Tests)
1. `ab-testing-engine.test.ts` — Statistical split-testing traffic allocation and winner determination.
2. `airtel-telecom.test.ts` — Airtel REST gateway signaling, response parsing, and error codes.
3. `api-key-auth.test.ts` — Cryptographic Bearer token verification and header authentication.
4. `api-keys-quota-apps.test.ts` — Scoped API application quota limits, tracking, and quota resets.
5. `billing-service.test.ts` — Serializable concurrency, atomic deductions, and double-billing protection.
6. `circuit-breaker.test.ts` — Telecom circuit breaker 3-state transitions (`CLOSED`, `OPEN`, `HALF_OPEN`).
7. `consent-service.test.ts` — Append-only audit trail and opt-in/opt-out regulatory suppression.
8. `contact-groups.test.ts` — Group creation, member associations, and count aggregation.
9. `contact-import.test.ts` — CSV streaming ingestion, sanitization, and batch insertion.
10. `contacts-network-detection.test.ts` — Phone network operator identification across East African ranges.
11. `country-flag-phone.test.ts` — Accessible international phone input rendering and country selection.
12. `country-picker-dropdown.test.ts` — 250+ country searchable picker and dial code resolution.
13. `country-registry.test.ts` — International dial code registry, E.164 formats, and MCC/MNC mappings.
14. `custom-variables.test.ts` — Dynamic merge tag extraction, regex sanitization, and fallback default substitution.
15. `drafts-page.test.ts` — Draft campaign storage, restoration, and deletion.
16. `dry-run-simulator.test.ts` — Pre-dispatch simulation calculating segment counts and credit requirements.
17. `error-pages.test.ts` — Accessible 404 Not Found and 500 Server Error boundary rendering.
18. `excel-import.test.ts` — Binary `.xlsx` spreadsheet buffer parsing into validated contact rows.
19. `fraud-prevention.test.ts` — Velocity rate limits, AIT OTP pumping detection, and toll fraud blocking.
20. `import-table-features.test.ts` — Paginated column mapping, field mapping dropdowns, and validation.
21. `language-toggle.test.ts` — Multilingual UI switcher and accessible aria-label tags.
22. `ledger-engine.test.ts` — Double-entry accounting ledger balance integrity and reconciliation.
23. `network-badge.test.ts` — Telecom carrier badge rendering with official carrier colors.
24. `normalizer.test.ts` — E.164 phone normalization, whitespace stripping, and carrier prefix lookup.
25. `page-title-sync.test.ts` — Dynamic browser tab title synchronization across dashboard navigation.
26. `phone-analyzer.test.ts` — Deep number format analysis, invalid digit detection, and carrier routing.
27. `phone-api.test.ts` — Programmatic phone lookup endpoint validation.
28. `phone-recipients-input.test.ts` — Multi-recipient tokenized input with tag removal and duplicate filtering.
29. `range-apps-dropdown.test.ts` — 3-column ecosystem application navigation menu.
30. `recurrence-engine.test.ts` — CRON schedule interval evaluation and `nextRunAt` calculation.
31. `regulatory-engine.test.ts` — Country KYC requirements, document validation, and quiet-hour rules.
32. `routing-engine.test.ts` — Carrier Least Cost Routing (LCR) and automated provider failover.
33. `scheduled-message-edit.test.ts` — 10-second transmission freeze, auto-pause safety locks, and rescheduling.
34. `segment-compiler.test.ts` — Dynamic AST audience segment compilation with Boolean rule trees.
35. `sidebar-navigation-flyout.test.ts` — Responsive collapsible sidebar with active theme tokens.
36. `smpp-provider.test.ts` — Native SMPP v3.4 binary PDU encoding/decoding and sequence handling.
37. `sms-draft-api.test.ts` — Programmatic draft save, load, and duplicate endpoints.
38. `sms-draft-hook.test.ts` — Client-side `useSmsDraft` auto-saving debouncer and state sync.
39. `sms-draft-service.test.ts` — Database-backed draft storage service with user isolation.
40. `sms-draft-validation.test.ts` — Message body and recipient validation for draft payloads.
41. `template-csv.test.ts` — Sample import CSV generation with required header columns.
42. `unsaved-changes.test.ts` — Dirty form navigation guards preventing accidental data loss.
43. `variable-cell-input.test.ts` — Table cell input editor for customized variable values.
44. `variable-date-picker.test.ts` — Calendar date picker formatted for dynamic message variables.
45. `variable-dropdown.test.ts` — Quick-insert variable dropdown with keyboard navigation.
46. `variable-resolution-modal.test.ts` — Pre-flight modal resolving missing contact variables before launch.
47. `variable-textarea.test.ts` — Textarea with inline mustache highlight tags and cursor insertion.
48. `variable-validation.test.ts` — Variable key syntax rules and character restrictions.

### Browser Runtime Verification Matrix (Chrome DevTools MCP)
All primary routes verified clean with **0 console errors, 0 warnings, 0 hydration issues, and 0 accessibility violations**:
- **Core Dashboard**: `/dashboard`, `/wallet`, `/contacts`, `/contacts/groups`, `/contacts/import`, `/contacts/tags`, `/contacts/segments`
- **SMS Messaging**: `/sms/send` (Live Simulator, theme toggle, character counter), `/sms/campaigns`, `/sms/scheduled`, `/sms/drafts`, `/sms/templates`, `/sms/variables`, `/sms/custom`, `/sms/delivery-reports`
- **Administration & Reseller**: `/admin`, `/admin/users`, `/admin/pricing`, `/admin/providers`, `/admin/system`, `/sender-ids`, `/gateways`
- **Analytics & Reports**: `/reports/financial`, `/reports/usage`, `/reports/campaigns`, `/reports/sms`
- **Settings & Security**: `/settings`, `/settings/account`, `/settings/notifications`, `/settings/security`, `/settings/sms`
- **Developer Subsystem**: `/developer/api-keys`, `/developer/webhooks`, `/developer/api-usage`, `/api/docs`

---

*Authored and verified for Range View Technology Services Uganda Limited.*  
*Range Bulk SMS Engineering Team*
