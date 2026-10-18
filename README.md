# Secure-Regent ⚡️
### Business Performance, Revenue Telemetry & CRM Simulation Engine

[![Deployment Status](https://img.shields.io/badge/Deployment-Live-success?style=for-the-badge&logo=vercel&logoColor=white)](https://secure-regent-frontend.vercel.app/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ECharts](https://img.shields.io/badge/Apache_ECharts-5.5-AA344D?style=flat-square&logo=apacheecharts&logoColor=white)](https://echarts.apache.org/)
[![Zustand](https://img.shields.io/badge/Zustand-4.5-443E38?style=flat-square)](https://github.com/pmndrs/zustand)
[![Vitest](https://img.shields.io/badge/Vitest-2.1-729B1B?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)

> **Live Production Deployment**:  
> 🔗 **[https://secure-regent-frontend.vercel.app/](https://secure-regent-frontend.vercel.app/)**

---

## 🌟 Executive Overview

**Secure-Regent** is an executive-grade business performance and revenue analytics dashboard engineered for corporate service enterprises (statutory compliance, corporate registrations, intellectual property, tax advisory, and accounting).

It bridges commercial enquiry tracking with downstream revenue realization, providing seamless traceability from initial contact capture to paid invoice realization. The entire platform is backed by a deterministic in-memory CRM simulator, a hardware-accelerated design system, and an iOS-inspired fluid interaction engine.

---

## 🎯 Assignment Functional Modules & Core Capabilities

The application fulfills all assignment specifications with dedicated analytical pages, relational data integrity, and real-time interactive controls:

### 1. 🧲 Lead Analytics & Funnel Velocity (`/app/leads`)
- **Key Metric Indicators (KPIs)**:
  - **Total Leads**: Overall inquiry volume captured within the active timeframe.
  - **Qualified Leads**: Inquiries validated for commercial pursuit.
  - **Converted Leads**: Leads successfully converted into contracted deals.
  - **Unqualified Enquiries**: Dropped inquiries with actionable drop-off rationale.
  - **Conversion Rate**: Percentage ratio of converted contracts to total inquiries.
  - *All KPI cards display sparklines, percentage period-over-period delta carets, and instant drill-down triggers.*
- **4-Stage Lead Funnel Drop-off**:
  - Interactive pipeline gates: *Commercial Enquiries (100%)* → *Qualified (Gate 1)* → *Converted to Deals (Gate 2)* → *Unqualified Drop-offs*.
  - Displays conversion velocity and volume leakage at each gate.
- **Lead Status Trend**:
  - Stacked historical bar chart displaying temporal progression across `New`, `Contacted`, `Qualified`, `Converted`, and `Unqualified` stages.
- **Channel Source Attribution**:
  - Longitudinal line trend comparing acquisition channels: *Google Ads*, *Website*, *Just Dial*, *Referral*, *Social Media*, and *Other*.
  - Accompanying donut distribution chart with center volume counters.
- **Searchable Leads Directory**:
  - Filter by status chip, search by contact name, company, city, owner, or ID.
  - Sortable column headers, pagination controls, and one-click **CSV Export**.
  - Deep-link navigation directly into individual **Lead Detail Dossiers** (`/app/leads/:id`).

---

### 2. ⏱️ Temporal Filters & Period Comparisons (`GlobalFilterBar`)
- **Preset Timeframes**:
  - **Today**: Real-time snapshot of the current 24-hour cycle.
  - **Last 7 Days**: Trailing weekly rolling window.
  - **Last 30 Days**: Standard monthly baseline window.
  - **Custom Date Range**: Interactive two-calendar picker supporting flexible start and end dates with automatic reverse-date swap safety.
- **Comparative Analysis Engine**:
  - Automatically resolves the preceding equivalent historical timeframe (e.g., comparing the current 30 days against the prior 30 days).
  - Calculates percentage increase/decrease deltas for all volumetric metrics, revenue figures, and conversion rates.
  - Semantic color coding: **Green** for positive gains, **Red** for negative drops (with inverted polarity for negative indicators like overdue orders and unqualified leads), and **Neutral** for flat trends.
- **Secondary Multi-Dimensional Slicing**:
  - **Department Filter**: Switch between *All Departments*, *Sales*, and *Operations*.
  - **Team Member Filter**: Isolate metrics by individual owner (Sales Reps & Operations Managers).
  - **Service Line Filter**: Scope analytics to specific regulatory practices.
- **Reactive ECharts Pipeline**:
  - Every chart, ring gauge, progress bar, and summary metric automatically re-aggregates in memory upon any filter change with zero page refreshes.

---

### 3. 📄 Quotation Analytics & Proposal Realization (`/app/quotations`)
- **Quotation KPIs**:
  - **Quotations Created**: Aggregate proposal documents dispatched.
  - **Quoted Value**: Total prospective contract value in pipeline.
  - **Accepted**: Commercial proposals approved by clients.
  - **Pending Review**: Quotes awaiting customer sign-off.
  - **Rejected & Expired**: Estimates declined or timed out.
  - **Quote-to-Deal Rate**: Realization ratio of accepted quotes to total quotes.
- **Quotations by Service & Category**:
  - Horizontal bar chart sorting top commercial offerings by proposal volume.
  - Service pipeline share progress bars with clickable drill-down drawers.
- **Status Breakdown & Conversion Ring**:
  - Donut distribution of proposal outcomes (`Accepted`, `Pending`, `Rejected`, `Expired`).
  - Ring gauge illustrating the exact quote-to-deal conversion efficiency.
- **Service-Wise Details Audit Table**:
  - Granular matrix breaking down service lines by quote volume, aggregate value, accepted count, pending count, rejected count, and service-level conversion rate.
- **Lead-Wise Quotation History (Hierarchical Accordion)**:
  - Groups quotes under their parent lead account.
  - Expandable rows reveal individual estimate dates, amounts, status badges, and visual outcome distribution progress bars.
  - Instant navigation to parent lead dossiers.

---

### 4. 💼 Deals & Revenue Analytics (`/app/deals`)
- **Commercial Contract KPIs**:
  - **Deals Created**: Total booked commercial engagements.
  - **Revenue Booked**: Aggregate value of contracted agreements.
  - **Collected Against Deals**: Realized cash credited against period deals.
  - **Outstanding Revenue**: Uncollected receivables awaiting collection.
  - **Collection Rate**: Percentage of booked contract value realized in cash.
  - **Average Deal Value (ADV)**: Average monetary ticket size per agreement.
- **Dual-Axis Deals & Revenue by Service**:
  - Combines contract count bar columns with an overlaid line curve tracking aggregate booked revenue.
- **Revenue by Regulatory Category**:
  - Breakdown by practice area: *Corporate & Company Law*, *Tax & Financial Compliance*, *Intellectual Property*, *Licenses & Registrations*, and *Labour & Workplace Law*.
- **Daily Revenue Trend**:
  - Longitudinal multi-series chart comparing daily booked deal contracts against realized cash receipts.
- **Commercial Priority Breakdown**:
  - Segmented contract tiers: **High Priority** (>₹25,000 threshold), **Medium Priority**, and **Low Priority**.
  - Tiered progress bars and interactive drill-down cards.
- **Tri-Panel Realization Monitor**:
  - Side-by-side comparison cards: *Total Contract Value*, *Collected Against Deals*, and *Outstanding Receivables*, paired with an overall realization completion bar.
- **Deal Progress Lifecycle Table**:
  - Tracks contracts through progressive lifecycle stage gates: `Filing` (45%) → `Government Review` (70%) → `Delivery` (90%) → `Closed` (100%).
  - Direct deep-links to **Deal Detail Dossiers** (`/app/deals/:id`).

---

### 5. 📦 Orders Fulfillment & Cash Collections (`/app/orders`)
- **Operational Fulfillment KPIs**:
  - **Total Orders**: Operational service deliverables created.
  - **In Progress**: Active orders currently undergoing statutory filings or government review.
  - **Completed Orders**: Fully fulfilled deliverables with completion timestamps.
  - **Overdue Orders**: Orders exceeding target SLA delivery dates.
  - **Payments Received**: Realized inbound cash collections in period.
  - **Outstanding Collections**: Pending receivables under active monitoring.
- **Order Fulfillment Status Donut**:
  - Visual breakdown across `Completed`, `In progress`, `Pending`, and `On hold`.
- **Service Stage Execution**:
  - Stacked bar chart visualizing completed vs. pending fulfillment stages across each service vertical.
- **Collection Realization Trend**:
  - Dual-line visualization plotting daily collected receipts alongside a cumulative realization trajectory.
- **Payment Method Distribution**:
  - Inbound fund share segmented by payment channel: **UPI**, **Bank Transfer (NEFT/RTGS)**, **Credit/Debit Card**, **Cheque**, and **Cash**.
- **Operations Team Capacity Matrix**:
  - Team member performance table tracking assigned order loads, completed milestones, pending stages, and overdue counts.
- **Overdue Attention List**:
  - Priority queue of overdue service deliverables requiring expedited operational intervention.
- **Payment Transaction Audit Table**:
  - Complete searchable and filterable financial ledger detailing payment IDs, invoice numbers, linked deal references, payment methods, transaction statuses, and payment timestamps.

---

## 🔗 Relational Data Architecture

Secure-Regent enforces strict referential integrity across all entities:

```
[ Lead ] (Contact, Company, City, Source, Status)
   │
   ├── (1 : N) ──> [ Quotation ] (Service, Amount, Status, Timestamps)
   │
   └── (1 : N) ──> [ Deal ] (Service, Category, Value, Priority, Stage)
                      │
                      ├── (1 : N) ──> [ Order ] (Stages, Assignee, Status, SLA Due Date)
                      │
                      └── (1 : N) ──> [ Payment ] (Invoice No, Amount, Method, Status, Paid Date)
```

- **One Lead can have multiple Quotations and Deals**: A single enterprise client can request multiple quotes across different services (e.g., Private Limited Company Registration and Trademark Filing) and convert into distinct deals.
- **One Deal can have multiple Orders and Installment Payments**: High-value deals automatically generate multi-stage fulfillment orders and milestone-based invoice installments (e.g., 50% advance via UPI upon filing, 50% balance upon final government certificate delivery).
- **Dedicated Entity Detail Dossiers**:
  - `/app/leads/:id`: Complete client view with linked quotes, deals, activities, and communication notes.
  - `/app/deals/:id`: Comprehensive contract overview with linked orders, payment receipts, and debtor ledger.
  - `/app/orders/:id`: Step-by-step statutory execution checklist and assignee management.

---

## 🪟 Drill-Down System: Dual Floating Windows & iOS Genie Transition

Clicking any KPI card, metric tile, or chart element triggers an executive drill-down modal engineered with high-end interaction aesthetics:

1. **iOS Genie Liquid Transition Animation**:
   - **Dynamic Anchor Origin**: The animation calculates the exact screen coordinates (`--origin-x`, `--origin-y`) of the clicked trigger card.
   - **Liquid Spring Blooming**: The modal morphs outward from the card with an Apple-style spring curve (`cubic-bezier(0.16, 1, 0.3, 1)`), fluid non-linear scale stretching, and a 30ms cascade between the dual windows.
   - **Liquid Sucking Collapse**: Dismissing the modal smoothly collapses both windows right back into the originating card.
2. **Almost Opaque Solid Surfaces**:
   - Card surfaces are solid, opaque `bg-card` (`#FFFFFF` in light mode, `#181B1F` in dark mode) with opaque `bg-canvas` sub-tiles.
   - Eliminates see-through "liquid glass" text bleed, ensuring razor-sharp contrast and legibility.
3. **4-Tier Popped-Up Elevation Shadow (`.shadow-popped-modal`)**:
   - Multi-layered physical shadow featuring ambient diffusion (`0 30px 75px -12px`), direct drop elevation (`0 12px 28px -6px`), contact definition, and a 1px border rim.
4. **Frosted Background Backdrop (`.genie-backdrop`)**:
   - The dashboard behind the popup is blurred with `backdrop-filter: blur(20px) saturate(160%)` and an elegant dark tint, focusing attention entirely on the active records.
5. **Dual Window Layout**:
   - **Window 1 (Analytical Overview)**: Displays timeline distribution graphs, volumetric totals, peak realization dates, and clickable status breakdown filter pills.
   - **Window 2 (Records & Values)**: Houses the full record ledger with live keyword search, quick status filters, formatted amounts, and direct click-to-open links.

---

## ⚙️ Administrative Customization Console (`/app/admin`)

The Admin Control Center provides exhaustive controls to configure the design system, visualizations, business targets, and data simulation parameters:

### 🎨 Theme & Aesthetic Customization
- **Theme Modes**: **Light**, **Dark**, and **System** automatic preference detection.
- **6 Built-in Color Presets**:
  - **`minima-beige`**: Luxury editorial pastel earthy palette (cream `#FAF0E6`, light beige `#FFF0DB`, sandstone dividers, warm tan tints, and terracotta accents).
  - **`graphite`**: Modern dark slate executive theme.
  - **`signal`**: High-energy corporate electric blue.
  - **`forest`**: Sophisticated emerald green and sage.
  - **`sand`**: Warm desert tones and muted brass.
  - **`mono`**: Razor-sharp, high-contrast monochrome.
- **Live Color Token Pickers**:
  - Full granular control over individual design tokens: *Accent Color*, *Soft Accent*, *Canvas Background*, *Sidebar Background*, *Card Surface*, *Hairline Dividers*, *Primary Text*, *Secondary Text*, *Positive Green*, *Negative Red*, and *Warning Orange*.
  - Enforces WCAG AA/AAA contrast ratios with built-in prohibited hue validation.
- **Corner Radius Slider**: Adjust border radius dynamically from **0px (sharp square)** to **28px (ultra-rounded)** across cards, inputs, and modals.
- **Surface Density**: Toggle between **Comfortable** (relaxed enterprise spacing) and **Compact** (high-density data operations).
- **Typography Engine**:
  - Base font size scaling (12px to 18px).
  - Font pairings: *Rethink Sans + Helvetica*, *Helvetica Only*, or *Rethink Sans Only*.
- **Custom Brand Logo**: Upload custom PNG/SVG logos or provide image URLs with real-time sidebar and landing page synchronization.
- **3D Balance-Losing Tilt Physics**: Interactive 3D perspective tipping where cards tilt toward the mouse cursor with dynamic counter-shadows and surface glares.
- **Interactive Ambient Light Source**: Moving radial spotlight tracking pointer coordinates across the landing page.
- **Eco / Low-Power Mode**: Administratively disables continuous animation loops, 3D tilt calculations, and cursor gradients to conserve CPU/GPU and battery on low-spec hardware.

---

### 📊 Graph & ECharts Visualization Engine Settings
- **Grid Lines**: Toggle background Cartesian grid lines on or off.
- **Data Labels**: Display direct value labels on bar columns and line points.
- **Legend Positioning**: Configurable placement (`top-right`, `top-left`, `bottom`, or `none`).
- **Curve Smoothing**: Toggle smooth cubic splines vs. crisp linear line segments.
- **Area Fill Opacity**: Adjust line chart area gradient opacity from 0% to 100%.
- **Bar Styling**: Adjust bar corner radius (0px–16px) and bar column widths.
- **Animation Duration**: Set chart entrance animation speed (0ms to 2000ms).
- **Currency Symbol**: Switch between Indian Rupee (`₹`), US Dollar (`$`), Euro (`€`), British Pound (`£`), and Japanese Yen (`¥`).
- **Number Formatting Engine**:
  - **`indian-compact`**: Formats figures using standard Indian financial notation (e.g., `₹4.2L`, `₹1.8Cr`).
  - **`full`**: Formats with Indian comma separators (e.g., `₹4,20,000`).
  - **`plain`**: Standard unformatted integer/decimal output.
  - Decimal precision controls (0 to 3 decimal places).
- **Chart Palette Customizer**: Select from curated palette presets or define custom hex sequences for multi-series graphs.
- **Per-Chart Overrides**: Configure individual chart behaviors (bar vs. line, stacked vs. grouped, 3-day or 7-day moving averages).

---

### 🎲 Deterministic Simulation Engine & Business Parameters
- **Monthly Revenue Target**: Set monthly targets (default: `₹50,00,000`), automatically scaling targets according to the active timeframe.
- **High-Priority Threshold**: Configure deal value thresholds for high-priority classification (default: `₹25,000`).
- **Deterministic PRNG Seed**: Reproducible pseudo-random number generator ensuring identical dataset generation given the same seed.
- **History Generation Window**: Configure simulated business history from **30 days to 365 days** (default: 180 days).
- **Lead Volume Velocity**: Set average inquiries generated per day (default: 4.2 leads/day).
- **Conversion Probabilities**:
  - Qualification rate slider (default: 68%).
  - Quote acceptance rate slider (default: 42%).
  - Average deal value target (default: ₹24,000).
  - Payment delay turnaround days.
- **Acquisition Source Mix**: Sliders to rebalance channel distribution across Google Ads, Website, Just Dial, Referrals, Social Media, and Other.
- **Instant Live Regeneration**: One-click regeneration button updates all CRM telemetry, entity graphs, and financial ledgers instantly.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | **React 18.3** (Strict Mode) | Component-driven architecture with clean separation of concerns |
| **Language** | **TypeScript 5.6** | Complete type safety across all domain entities, metrics, and chart options |
| **Build Tool** | **Vite 5.4** | Instant hot module replacement and optimized Rollup chunking (<2.8s build) |
| **Styling** | **TailwindCSS 3.4** + CSS Variables | Dynamic CSS token injection, glassmorphism, 3D perspective |
| **Visualizations** | **Apache ECharts 5.5** | High-performance Canvas/SVG charts with custom tooltip formatting |
| **State Management** | **Zustand 4.5** | Reactive persistent state synchronized with `localStorage` |
| **Accessible Primitives** | **Radix UI** | Accessible Dialog, Popover, Dropdown, Slider, Switch, and Tooltip |
| **Icons** | **Phosphor Icons 2.1** | Consistent, lightweight SVG iconography |
| **Date Utilities** | **date-fns 3.6** | Precise date manipulation, ranges, and formatting |
| **Unit Testing** | **Vitest 2.1** | Automated test suite validating data generators, formatters, and metrics |

---

## 📁 Repository Structure

```text
Frontend-SecureRegent/
├── src/
│   ├── components/
│   │   ├── charts/               # ECharts wrappers, BaseChart, and chart theme generators
│   │   ├── common/               # KpiCard, DrillDownDrawer, TiltElement, StatusChip, BrandLogo
│   │   └── layout/               # AppLayout, GlobalFilterBar, PageHeader, TimeframePopover
│   ├── context/                  # FilterContext (timeframe, department, user, and origin anchors)
│   ├── domain/                   # Business types, deterministic generator, metrics & deltas engine
│   │   └── __tests__/            # Vitest test suite for domain invariants and formatters
│   ├── pages/                    # Overview, Leads, Quotations, Deals, Orders, Detail pages, Admin
│   ├── store/                    # Zustand stores: settingsStore (theme & charts) and dataStore
│   ├── utils/                    # Indian currency formatters, numbers, dates, WCAG color contrast
│   ├── App.tsx                   # Client-side router configuration with lazy loading
│   ├── index.css                 # Design tokens, iOS genie animations, popped-up shadows, print styles
│   └── main.tsx                  # Application bootstrap entry point
├── public/                       # Static web assets and manifests
├── index.html                    # HTML5 shell with Google Font preloads
├── package.json                  # Scripts and package manifests
├── tailwind.config.js            # Tailwind theme extensions using CSS variables
└── vite.config.ts                # Build configuration and chunking strategy
```

---

## 💻 Local Development & Verification

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### 1. Clone & Install
```bash
git clone git@github.com:KarthikIsCodingNow/SecureRegent-Frontend.git
cd SecureRegent-Frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

### 3. Run Automated Unit Tests
```bash
npm run test
```
Executes all 15 Vitest tests covering:
- Deterministic PRNG seed reproducibility and chronological date cascading.
- Referential integrity invariants (`converted <= qualified <= new leads`).
- Indian currency formatting (`₹`, Lakhs, Crores) and negative indicator delta semantics.
- Prohibited hue validation and high-contrast WCAG auditing.

### 4. Build for Production
```bash
npm run build
```
Compiles TypeScript with strict type checking and outputs the minified production bundle to `/dist`.

---

## 👤 Developer & Contact Information

| Property | Details |
|---|---|
| **Author** | **Karthikeya Ganugula** |
| **Email** | [karthikeyaganugula07@gmail.com](mailto:karthikeyaganugula07@gmail.com) |
| **Phone** | [+91 9281461306](tel:+919281461306) |
| **LinkedIn** | [linkedin.com/in/karthikeya-ganugula](https://www.linkedin.com/in/karthikeya-ganugula) |
| **Live App** | [https://secure-regent-frontend.vercel.app/](https://secure-regent-frontend.vercel.app/) |
| **Country** | India 🇮🇳 |

---

## 📜 License
Developed for the **Business Performance & Revenue Analytics Dashboard** Assignment.  
Author: **Karthikeya Ganugula**. All rights reserved.
