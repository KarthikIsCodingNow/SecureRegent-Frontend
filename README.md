# Secure-Regent ⚡️
### Enterprise CRM Telemetry, Revenue Analytics & Deterministic Simulation Engine

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ECharts](https://img.shields.io/badge/Apache_ECharts-5.5-AA344D?style=flat-square&logo=apacheecharts&logoColor=white)](https://echarts.apache.org/)
[![Zustand](https://img.shields.io/badge/Zustand-4.5-443E38?style=flat-square)](https://github.com/pmndrs/zustand)
[![Vitest](https://img.shields.io/badge/Vitest-2.1-729B1B?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)

---

## 🌟 Overview

**Secure-Regent** is an executive-grade front-end analytics application engineered for professional service enterprises operating in India (accounting, statutory compliance, company registrations, trademarks, and corporate consulting). 

It bridges commercial enquiry tracking with downstream revenue realization, providing instant drilldowns across leads, quotations, deals, orders, and UPI/bank collections—all powered by a deterministic in-memory CRM simulator and a hardware-accelerated design system.

---

## 🚀 Key Feature Highlights

### 1. 💡 Reactive Ambient Light Source & Dynamic Typography
- **Interactive Background Spotlight**: The landing page background tracks pointer and touch coordinates in real time, projecting a multi-layered luminous spotlight (`radial-gradient`) and ambient color auras that illuminate the canvas like a moving physical light source.
- **Specular Title Physics**: Headline letterforms dynamically calculate the angle and proximity to the cursor light beam, casting real-time 3D parallax tilt and soft directional drop shadows away from the light.
- **Fail-Safe High Contrast**: Typography is rendered with solid CSS fill and dynamic drop-shadow filters, guaranteeing crisp readability with zero background-clipping artifacts across all browsers.

### 2. 🎴 3D Balance-Losing Tilt Physics
- **Physical "Lose Balance" Hover**: Elements (buttons, KPI cards, feature tiles) implement a custom 3D perspective transform where hovering over a corner tilts the element towards that corner as if losing balance under weight (`rotateX`, `rotateY`, `translateZ(14px)`, `scale(1.03)`).
- **Dynamic Counter-Shadow**: Drop shadows dynamically project to the opposite quadrant (`-normX`, `-normY`), paired with an interactive specular surface glare that tracks mouse travel before snapping back with smooth spring damping (`cubic-bezier(0.175, 0.885, 0.32, 1.275)`).

### 3. 📈 Interactive Graph Node Pop-Up System
- **Node Emphasis**: All ECharts series (Line, Bar, Donut, Funnel, Gauge) automatically intercept hover and focus states, scaling nodes up by **2.6×** with glowing drop shadows (`shadowBlur: 22-28`) and high-contrast border halos.
- **Comparative Cadence**: Revenue realization trends display dual-period comparisons against previous cycles with dashed reference lines and compact Indian currency formatting (`₹`, Lakhs, Crores).

### 4. 📱 Left-Docked iOS-Style Dynamic Expansion Sheet
- **Non-Obtrusive Analytics View**: Clicking any KPI button or metric ("New leads", "Conversions", "Deals created", "Cash received") triggers an iOS-style spring press and dynamically expands an analytical sheet on the **left side** of the viewport (`slide-in-from-left duration-300`).
- **Context Preservation**: By expanding on the left, the right-hand dashboard analytical graphs and telemetry remain visible and unobstructed.
- **Drilldown Telemetry**: Each drawer features an embedded chronological trend graph, volumetric breakdown, status filters, and instant deep-links to entity detail pages.

### 5. 🎨 Curated Theme Engine & `minima-beige` Pastel Palette
- **Minima Beige Preset**: A luxury pastel earthy palette inspired by warm editorial design:
  - **Cream Off-White** (`#FAF0E6`): Ambient canvas background.
  - **Light Beige** (`#FFF0DB`): Card and surface elevation.
  - **Sandstone** (`#EED9C4`): Hairline dividers and borders.
  - **Warm Tan** (`#E4D5B7`): Soft badge tints and hover washes.
  - **Muted Clay** (`#D9B99B` / `#9E6238`): Accent glow with guaranteed WCAG AA/AAA contrast.
- **6 Built-in Presets**: `minima-beige`, `graphite`, `signal`, `forest`, `sand`, and `mono`.
- **Live Token Customizer**: The Admin Console includes live color pickers, corner radius sliders (8px–32px), shadow elevation modes, and real-time contrast ratio auditing.

### 6. 📱 Top-Notch Mobile Experience
- **Left-Aligned Mobile Menu**: Mobile header places the three-line hamburger menu on the left side, opening a smooth left-docked navigation drawer (`slide-in-from-left`).
- **Frosted Glassmorphism Header**: Floating pill navigation bar with backdrop blur (`backdrop-blur-xl`), quick page links, and responsive theme selectors.
- **Touch-and-Hold (Long Press)**: Touching and holding KPI cards for >350ms activates an elevated 3D tactile inspection state with haptic feedback.

### 7. ⚡ Eco / Low-Power Mode (Weaker Machines Toggle)
- An administrative switch allows users to disable continuous `requestAnimationFrame` loops, 3D tilt calculations, and dynamic cursor spotlights.
- Minimizes CPU/GPU consumption, enabling extended battery life on laptops and smooth operation on low-spec hardware.

### 8. 🖨️ Pristine Print & PDF Export Engine
- Dedicated `@media print` stylesheet automatically hides interactive buttons, dropdowns, navigation sidebars, and filter toolbars (`.no-print`).
- Re-flows multi-column grids to prevent chart cutoff and page-clipping, outputting clean, full-width reports formatted for A4 portrait and landscape printing.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework** | React 18 + TypeScript | Strict mode, zero external UI component bloat |
| **Build Tool** | Vite 5 | Sub-second HMR, optimized Rollup chunking (<3.2s build) |
| **State Management** | Zustand | Persistent local storage sync with schema versioning |
| **Styling** | TailwindCSS + CSS Variables | Dynamic CSS token injection, glassmorphism, 3D perspective |
| **Visualizations** | Apache ECharts 5 | Responsive Canvas renderer with custom node popups |
| **Icons** | Phosphor Icons | Feather-light SVG icons across all views |
| **Primitives** | Radix UI | Accessible Popover, Dialog, Dropdown, Slider, and Switch |
| **Testing** | Vitest | Comprehensive metric, generator, and formatter unit test suite |

---

## 📁 Repository Directory Structure

```text
SecureRegent-Frontend/
├── src/
│   ├── components/
│   │   ├── charts/           # ECharts configurations, BaseChart, and chart themes
│   │   ├── common/           # TiltElement, KpiCard, BrandLogo, SiteFooter, DrillDownDrawer
│   │   └── layout/           # AppLayout, Sidebar, GlobalFilterBar, PageHeader, PillSelect
│   ├── context/              # Global FilterContext (timeframe, department, user filters)
│   ├── domain/               # Synthetic deterministic generator, constants, entity types
│   ├── pages/                # LandingPage, OverviewPage, LeadsPage, QuotationsPage, DealsPage, OrdersPage, AdminPage
│   ├── store/                # Zustand settingsStore (theme presets, tokens, eco mode) and dataStore
│   ├── utils/                # Formatters (Indian currency, numbers, dates) and color contrast calculators
│   ├── App.tsx               # Client-side routing with lazy suspense boundaries
│   ├── index.css             # Design tokens, print engine, 3D tilt styles, and eco mode rules
│   └── main.tsx              # Application entry point
├── public/                   # Static assets & web manifest
├── package.json              # Project dependencies and build scripts
└── vite.config.ts            # Vite bundle configuration and manual chunking rules
```

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Clone the repository
git clone git@github.com:KarthikIsCodingNow/SecureRegent-Frontend.git
cd SecureRegent-Frontend

# Install dependencies
npm install
```

### Development Server
```bash
# Start the local development server at http://localhost:5173
npm run dev
```

### Production Build & Test
```bash
# Run unit tests
npm run test -- --run

# Compile TypeScript and build production bundle
npm run build
```

---

## 👤 Developer & Contact Information

| Property | Details |
|---|---|
| **Author** | **Karthikeya Ganugula** |
| **Email** | [karthikeyaganugula07@gmail.com](mailto:karthikeyaganugula07@gmail.com) |
| **Phone** | [+91 9281461306](tel:+919281461306) |
| **LinkedIn** | [linkedin.com/in/karthikeya-ganugula](https://www.linkedin.com/in/karthikeya-ganugula) |
| **Country** | India |

---

## 📜 License
This project is proprietary and developed by **Karthikeya Ganugula**. All rights reserved.
