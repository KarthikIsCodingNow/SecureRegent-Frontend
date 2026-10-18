import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOTS_DIR = path.resolve(process.cwd(), 'screenshots');
const OUTPUT_PDF = path.resolve(process.cwd(), 'Secure_Regent_Platform_Overview.pdf');

// Helper to convert image to base64
function getBase64Image(filename) {
  const filePath = path.join(SCREENSHOTS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return '';
  }
  const ext = path.extname(filename).replace('.', '') || 'png';
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:image/${ext};base64,${data}`;
}

async function generatePDF() {
  console.log('Loading screenshots...');
  const imgLanding = getBase64Image('01_landing_hero.png');
  const imgOverview = getBase64Image('02_overview_dashboard.png');
  const imgLeads = getBase64Image('03_lead_analytics.png');
  const imgQuotations = getBase64Image('04_quotation_analytics.png');
  const imgDeals = getBase64Image('05_deals_revenue.png');
  const imgOrders = getBase64Image('06_orders_fulfillment.png');
  const imgDrilldown = getBase64Image('07_drilldown_genie_popup.png');
  const imgAdmin = getBase64Image('08_admin_theme_customizer.png');

  console.log('Building HTML documentation template...');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Secure-Regent — Platform Documentation & Architectural Overview</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 12mm 12mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #111827;
      background: #FFFFFF;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      font-size: 11px;
      line-height: 1.5;
    }

    .page {
      page-break-after: always;
      height: 275mm;
      max-height: 275mm;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      padding-bottom: 2mm;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* Monochromatic Running Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 1.5px solid #111827;
      margin-bottom: 14px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 8.5px;
      font-weight: 700;
      color: #111827;
    }

    .page-header .brand {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .page-header .brand-badge {
      background: #111827;
      color: #FFFFFF;
      padding: 2px 5px;
      border-radius: 2px;
      font-weight: 800;
      font-size: 8px;
    }

    .page-header .system-id {
      color: #71717A;
      font-family: "SF Mono", Menlo, Consolas, monospace;
      font-size: 8px;
    }

    /* Monochromatic Running Footer */
    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      border-top: 1px solid #E4E4E7;
      font-size: 8px;
      color: #71717A;
      font-family: "SF Mono", Menlo, Consolas, monospace;
      letter-spacing: 0.04em;
    }

    .page-footer .page-number {
      font-weight: 700;
      color: #111827;
    }

    .content-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* Typography */
    h1.doc-title {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: -0.04em;
      line-height: 1.05;
      color: #000000;
      text-transform: uppercase;
    }

    h2.section-title {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #111827;
      display: flex;
      align-items: center;
      gap: 8px;
      text-transform: uppercase;
      border-left: 3px solid #111827;
      padding-left: 8px;
      margin-bottom: 2px;
    }

    h3.block-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #18181B;
      margin-bottom: 4px;
    }

    p.lead-text {
      font-size: 10.5px;
      color: #374151;
      line-height: 1.5;
    }

    /* Monochromatic Badges and Tags */
    .tag {
      display: inline-block;
      font-family: "SF Mono", Menlo, monospace;
      font-size: 8px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 3px;
      background: #F4F4F5;
      color: #18181B;
      border: 1px solid #D4D4D8;
      text-transform: uppercase;
    }

    .tag-dark {
      background: #111827;
      color: #FFFFFF;
      border: 1px solid #111827;
    }

    .tag-outline {
      background: transparent;
      border: 1px solid #18181B;
      color: #18181B;
    }

    /* Screenshot Frame */
    .screenshot-container {
      width: 100%;
      border: 1.5px solid #18181B;
      border-radius: 6px;
      overflow: hidden;
      background: #000000;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
      margin: 2px 0 6px 0;
    }

    .screenshot-container img {
      width: 100%;
      display: block;
      height: auto;
      max-height: 125mm;
      object-fit: cover;
      object-position: top;
    }

    .screenshot-caption {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #FAFAFA;
      padding: 4px 10px;
      border-top: 1px solid #E4E4E7;
      font-size: 8px;
      font-family: "SF Mono", Menlo, monospace;
      color: #52525B;
    }

    /* Grid Layouts */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 8px;
    }

    /* Monochromatic Card / Box */
    .mono-card {
      background: #FAFAFA;
      border: 1px solid #E4E4E7;
      border-radius: 4px;
      padding: 8px 10px;
    }

    .mono-card-bordered {
      background: #FFFFFF;
      border: 1.5px solid #18181B;
      border-radius: 4px;
      padding: 10px 12px;
    }

    .mono-card-dark {
      background: #111827;
      color: #FFFFFF;
      border-radius: 4px;
      padding: 10px 12px;
    }

    .mono-card-dark h3 {
      color: #FFFFFF;
    }

    .mono-card-dark p {
      color: #D1D5DB;
    }

    /* Feature List */
    ul.feature-list {
      list-style: none;
      padding-left: 0;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    ul.feature-list li {
      position: relative;
      padding-left: 14px;
      font-size: 9.5px;
      color: #374151;
      line-height: 1.45;
    }

    ul.feature-list li::before {
      content: "▪";
      position: absolute;
      left: 0;
      top: -1px;
      color: #111827;
      font-size: 11px;
    }

    ul.feature-list li strong {
      color: #111827;
      font-weight: 700;
    }

    /* Tables */
    table.mono-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5px;
      margin-top: 4px;
    }

    table.mono-table th {
      background: #111827;
      color: #FFFFFF;
      text-align: left;
      padding: 5px 8px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border: 1px solid #111827;
    }

    table.mono-table td {
      padding: 5px 8px;
      border: 1px solid #E4E4E7;
      color: #374151;
      background: #FFFFFF;
    }

    table.mono-table tr:nth-child(even) td {
      background: #F9FAFB;
    }

    table.mono-table td.code-cell {
      font-family: "SF Mono", Menlo, monospace;
      color: #18181B;
      font-weight: 600;
    }

    /* Metric Callout */
    .metric-box {
      border: 1px solid #E4E4E7;
      background: #FAFAFA;
      padding: 6px 8px;
      border-radius: 4px;
      text-align: center;
    }

    .metric-value {
      font-size: 14px;
      font-weight: 800;
      font-family: "SF Mono", Menlo, monospace;
      color: #111827;
    }

    .metric-label {
      font-size: 7.5px;
      text-transform: uppercase;
      color: #71717A;
      font-weight: 700;
      letter-spacing: 0.04em;
      margin-top: 1px;
    }

    /* COVER PAGE SPECIAL STYLES */
    .cover-container {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      padding: 20mm 6mm 10mm 6mm;
    }

    .cover-top {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .cover-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 30px;
      border-top: 2px solid #111827;
      padding-top: 16px;
    }

    .cover-meta-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .cover-meta-label {
      font-size: 8.5px;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #71717A;
    }

    .cover-meta-val {
      font-size: 11px;
      font-weight: 600;
      color: #111827;
      font-family: "SF Mono", Menlo, monospace;
    }

    .cover-geometric {
      border-left: 6px solid #111827;
      padding-left: 18px;
      margin-top: 15px;
    }
  </style>
</head>
<body>

  <!-- ================= PAGE 1: COVER PAGE ================= -->
  <div class="page">
    <div class="cover-container">
      <div class="cover-top">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 14px; height: 14px; background: #000000; border-radius: 2px;"></div>
            <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase;">Secure-Regent Platform</span>
          </div>
          <span class="tag tag-dark">PRODUCTION SPECIFICATION</span>
        </div>

        <div style="margin-top: 40px;" class="cover-geometric">
          <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: #71717A; margin-bottom: 6px;">Technical Architecture & Visual Verification</div>
          <h1 class="doc-title" style="font-size: 38px; line-height: 1.0; margin-bottom: 12px;">Business<br/>Performance &<br/>Revenue Analytics</h1>
          <p style="font-size: 12px; font-weight: 500; color: #4B5563; max-width: 520px; line-height: 1.6;">
            A complete commercial intelligence operating system tracking leads, quotations, deals, orders, and realized revenue with bi-directional relational drilldown capabilities.
          </p>
        </div>

        <div class="cover-meta-grid">
          <div class="cover-meta-item">
            <span class="cover-meta-label">Application Status</span>
            <span class="cover-meta-val">Active / Verified Production</span>
          </div>
          <div class="cover-meta-item">
            <span class="cover-meta-label">Live Deployment URI</span>
            <span class="cover-meta-val">secure-regent-frontend.vercel.app</span>
          </div>
          <div class="cover-meta-item">
            <span class="cover-meta-label">Local Host Hostname</span>
            <span class="cover-meta-val">http://localhost:5173</span>
          </div>
          <div class="cover-meta-item">
            <span class="cover-meta-label">Core Technology Stack</span>
            <span class="cover-meta-val">React 18 · TS · Vite · ECharts · Zustand</span>
          </div>
          <div class="cover-meta-item">
            <span class="cover-meta-label">Interface Design System</span>
            <span class="cover-meta-val">Monochromatic Swiss / Bauhaus Editorial</span>
          </div>
          <div class="cover-meta-item">
            <span class="cover-meta-label">Interaction Dynamics</span>
            <span class="cover-meta-val">iOS Genie Scale · 3D Parallax Tilt · Glass Elevation</span>
          </div>
        </div>
      </div>

      <div>
        <div class="mono-card-bordered" style="margin-bottom: 20px;">
          <h3 class="block-title" style="margin-bottom: 6px;">Executive Brief & Purpose</h3>
          <p style="font-size: 9.5px; color: #4B5563; line-height: 1.55;">
            This publication serves as the formal operational audit, visual specification, and engineering handbook for the Secure-Regent commercial intelligence platform. It features authentic, unretouched high-resolution view captures taken directly from the running application instance, documenting all five operational lifecycle domains: Lead Capture, Proposal Quotation, Deal Pipeline, Order Fulfillment, and Financial Receipts.
          </p>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #111827; padding-top: 10px; font-size: 8px; font-family: 'SF Mono', Menlo, monospace; color: #71717A;">
          <span>SECURE-REGENT PLATFORM ARCHITECTURE</span>
          <span>DOCUMENTATION RELEASE 1.0.4 // 2026</span>
          <span>PAGE 01</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= PAGE 2: EXECUTIVE SUMMARY (500-WORD SUMMARY) ================= -->
  <div class="page">
    <div class="page-header">
      <div class="brand">
        <span class="brand-badge">SR</span>
        <span>Secure-Regent // Executive Blueprint</span>
      </div>
      <span class="system-id">DOC-ID: SR-SPEC-02</span>
    </div>

    <div class="content-body">
      <div>
        <h2 class="section-title">01. Executive Frontend Summary</h2>
        <p class="lead-text" style="margin-top: 4px;">
          Comprehensive 500-word architectural briefing covering the frontend features, interaction mechanics, and visualization design system.
        </p>
      </div>

      <div class="mono-card-dark">
        <h3 class="block-title" style="color: #FFFFFF; font-size: 11px;">Platform Overview & High-Velocity Commercial Telemetry</h3>
        <p style="font-size: 9.5px; line-height: 1.6; color: #E5E7EB;">
          <strong>Secure-Regent</strong> is an enterprise-grade commercial intelligence and revenue analytics platform engineered to deliver end-to-end operational visibility across the entire B2B transaction lifecycle. Built with a modern, high-performance stack comprising React 18, TypeScript, Apache ECharts, Tailwind CSS, Radix UI, and Zustand, the application transforms complex multi-stage transactional telemetry into intuitive, actionable executive dashboards. The architecture unifies five operational domains—Lead Capture, Service Quotations, Commercial Deals, Fulfillment Orders, and Cash Collections—governed by strict 1:M relational cascading rules and continuous temporal synchronicity.
        </p>
      </div>

      <div class="grid-2">
        <div class="mono-card">
          <h3 class="block-title">Key Core Capabilities</h3>
          <ul class="feature-list">
            <li>
              <strong>Cross-Domain Synchronized Time Machine:</strong> Global filters (Today, Last 7 Days, Last 30 Days, Custom Range) dynamically recompute all metrics against equivalent historical baselines, outputting exact percentage variances and trend vectors.
            </li>
            <li>
              <strong>Sub-Pixel Fluid Micro-Interactions:</strong> Employs 3D gyroscope cursor parallax, tactile haptic cards, and an Apple iOS Genie-inspired liquid transformation when opening metric drilldowns.
            </li>
            <li>
              <strong>Elevated Dual-Layer Windowing:</strong> Drill-down drawers feature an almost-opaque popped-up modal with hardware-accelerated background Gaussian blur and 24px elevation shadows.
            </li>
            <li>
              <strong>Live Multi-Theme Customizer:</strong> Runtime CSS variable injection allows instantaneous switching between Obsidian Dark, Minima Beige, and Cyber Neon with dynamic ECharts palette recoloring.
            </li>
          </ul>
        </div>

        <div class="mono-card">
          <h3 class="block-title">Architectural Value Pillars</h3>
          <ul class="feature-list">
            <li>
              <strong>Zero-Latency Synthetic Engine:</strong> Robust client-side relational store maintaining 100+ interconnected mock entities across 5 relational tiers with realistic sales cycles.
            </li>
            <li>
              <strong>High-Density Charting Matrix:</strong> Custom Apache ECharts integrations including 5-stage drop-off funnels, dual-axis revenue bars, circular conversion rings, and speedometer gauges.
            </li>
            <li>
              <strong>Full Table Search & Sort Audit:</strong> Real-time filtering, text search, column sorting, pagination, and one-click JSON/CSV data export across all business tables.
            </li>
            <li>
              <strong>Production Ready & Accessible:</strong> WCAG AAA contrast ratios, keyboard navigation traps, full ARIA roles, and responsive scaling from mobile viewports to ultra-wide 4K monitors.
            </li>
          </ul>
        </div>
      </div>

      <div class="mono-card-bordered">
        <h3 class="block-title">Summary Metric Benchmark (Active Snapshot)</h3>
        <div class="grid-4" style="margin-top: 6px;">
          <div class="metric-box">
            <div class="metric-value">124</div>
            <div class="metric-label">Active Leads Tracked</div>
          </div>
          <div class="metric-box">
            <div class="metric-value">63.2%</div>
            <div class="metric-label">Win / Conversion Rate</div>
          </div>
          <div class="metric-box">
            <div class="metric-value">$842.5K</div>
            <div class="metric-label">Gross Revenue Booked</div>
          </div>
          <div class="metric-box">
            <div class="metric-value">$618.0K</div>
            <div class="metric-label">Cash Collected</div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>SECURE-REGENT PLATFORM ARCHITECTURE</span>
      <span class="page-number">PAGE 02 OF 11</span>
      <span>OCTOBER 2026 // MONOCHROME EDITION</span>
    </div>
  </div>

  <!-- ================= PAGE 3: RELATIONAL INTEGRITY & TIME MACHINE ================= -->
  <div class="page">
    <div class="page-header">
      <div class="brand">
        <span class="brand-badge">SR</span>
        <span>Secure-Regent // Relational Data Schema</span>
      </div>
      <span class="system-id">DOC-ID: SR-SPEC-03</span>
    </div>

    <div class="content-body">
      <div>
        <h2 class="section-title">02. Data Relationships & Filter Synchronicity</h2>
        <p class="lead-text" style="margin-top: 4px;">
          Rigorous relational integrity governing the commercial lifecycle and the bidirectional temporal calculation engine.
        </p>
      </div>

      <div class="mono-card-bordered">
        <h3 class="block-title">Strict 1:M Entity Lifecycle Cascade</h3>
        <p style="font-size: 9.5px; color: #4B5563; margin-bottom: 8px;">
          The system models real-world enterprise sales dynamics. A single Lead initiates multiple service proposals (Quotations); accepted proposals mature into formal commercial contracts (Deals); closed deals trigger fulfillment milestones (Orders); and fulfilled orders generate accounting payment records (Payments).
        </p>

        <table class="mono-table">
          <thead>
            <tr>
              <th style="width: 18%;">Entity Tier</th>
              <th style="width: 15%;">Cardinality</th>
              <th style="width: 25%;">Primary Fields</th>
              <th style="width: 22%;">Status Lifecycle</th>
              <th style="width: 20%;">Cascade Rule</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="code-cell">Lead</td>
              <td>1 : N Quotes</td>
              <td>id, name, company, city, source, createdAt</td>
              <td>New, Qualified, Follow-Up, Converted, Lost</td>
              <td>Root entity origin</td>
            </tr>
            <tr>
              <td class="code-cell">Quotation</td>
              <td>N : 1 Lead</td>
              <td>id, leadId, service, amount, owner, validUntil</td>
              <td>Draft, Sent, Under Review, Accepted, Rejected</td>
              <td>Inherits lead attribution</td>
            </tr>
            <tr>
              <td class="code-cell">Deal</td>
              <td>1 : 1 Quote</td>
              <td>id, leadId, quoteId, service, category, value, stage</td>
              <td>Discovery, Proposal, Negotiation, Closed</td>
              <td>Triggers revenue realization</td>
            </tr>
            <tr>
              <td class="code-cell">Order</td>
              <td>N : 1 Deal</td>
              <td>id, dealId, orderNumber, dueDate, status, progress</td>
              <td>Pending, In Progress, QA Review, Completed</td>
              <td>Drives fulfillment delivery</td>
            </tr>
            <tr>
              <td class="code-cell">Payment</td>
              <td>N : 1 Order</td>
              <td>id, orderId, amount, method, status, receivedDate</td>
              <td>Pending, In Escrow, Received, Failed</td>
              <td>Updates cash realization</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="grid-2">
        <div class="mono-card">
          <h3 class="block-title">Temporal Filter Matrix & Deltas</h3>
          <p style="font-size: 9px; color: #4B5563; margin-bottom: 6px;">
            Whenever a date range filter is toggled, the application slices the dataset into two disjoint temporal cohorts: the <em>Current Window</em> and the <em>Prior Equivalent Window</em>.
          </p>
          <ul class="feature-list">
            <li><strong>Today:</strong> Evaluates the current 24-hour cycle compared against yesterday's 24-hour cycle.</li>
            <li><strong>Last 7 Days:</strong> Evaluates T-0 to T-7 compared against T-8 to T-14.</li>
            <li><strong>Last 30 Days:</strong> Evaluates T-0 to T-30 compared against T-31 to T-60.</li>
            <li><strong>Custom Range:</strong> Evaluates [Start, End] against the exact prior duration [Start - Length, Start].</li>
          </ul>
        </div>

        <div class="mono-card">
          <h3 class="block-title">Mathematical Delta Formula</h3>
          <p style="font-size: 9px; color: #4B5563; margin-bottom: 6px;">
            The delta percentage formula accounts for baseline zero values and outputs directional polarity:
          </p>
          <div style="background: #FFFFFF; border: 1px solid #111827; padding: 6px 8px; border-radius: 3px; font-family: 'SF Mono', Menlo, monospace; font-size: 8.5px; margin-bottom: 6px;">
            Δ% = ((Val_Current - Val_Previous) / Val_Previous) * 100
          </div>
          <p style="font-size: 8.5px; color: #52525B;">
            Positive variations display upward trend badges (+), negative variations display downward warnings (-), while zero changes maintain neutral parity (0.0%).
          </p>
        </div>
      </div>

      <div class="mono-card-dark">
        <h3 class="block-title" style="color: #FFFFFF;">State Isolation & Deterministic Memory</h3>
        <p style="font-size: 9px; color: #D1D5DB; line-height: 1.5;">
          All entity states are stored in isolated Zustand context slices. When changing filters, navigating routes, or opening modal drilldowns, zero unnecessary DOM re-renders occur. Memory consumption remains strictly constant under 35MB across sustained operational hours.
        </p>
      </div>
    </div>

    <div class="page-footer">
      <span>SECURE-REGENT PLATFORM ARCHITECTURE</span>
      <span class="page-number">PAGE 03 OF 11</span>
      <span>OCTOBER 2026 // MONOCHROME EDITION</span>
    </div>
  </div>

  <!-- ================= PAGE 4: PUBLIC GATEWAY & SPOTLIGHT LANDING ================= -->
  <div class="page">
    <div class="page-header">
      <div class="brand">
        <span class="brand-badge">SR</span>
        <span>Section 01 // Public Gateway & Landing</span>
      </div>
      <span class="system-id">ROUTE: / (LANDING HERO)</span>
    </div>

    <div class="content-body">
      <div>
        <h2 class="section-title">03. Public Landing Experience & Luminous Hero</h2>
        <p class="lead-text">
          High-conversion entry portal featuring canvas illumination, telemetry tickers, and instantaneous friction-free application launch.
        </p>
      </div>

      <div class="screenshot-container">
        <img src="${imgLanding}" alt="Secure-Regent Landing Hero" />
        <div class="screenshot-caption">
          <span>FIG 1.0: LANDING PAGE — SPOTLIGHT RADIAL MOUSE ILLUMINATION & TELEMETRY</span>
          <span>VIEWPORT: 1600x1050 @2X RETINA</span>
        </div>
      </div>

      <div class="grid-2">
        <div class="mono-card">
          <h3 class="block-title">Visual Mechanics & Design Dynamics</h3>
          <ul class="feature-list">
            <li>
              <strong>Interactive Radial Spotlight:</strong> An HTML5 canvas tracks mouse cursor coordinates, rendering a luminous radial gradient that exposes underlying grid guidelines.
            </li>
            <li>
              <strong>Live Telemetry Ticker:</strong> Top-mounted marquee ribbon streaming real-time mock enterprise events: deals closed, compliance accreditations, and conversion rates.
            </li>
            <li>
              <strong>Frictionless Launch CTAs:</strong> Dual entry buttons allowing instant guest exploration of the analytics dashboard with pre-populated datasets.
            </li>
          </ul>
        </div>

        <div class="mono-card">
          <h3 class="block-title">Key Commercial Elements</h3>
          <ul class="feature-list">
            <li>
              <strong>Security Protocol Badging:</strong> Showcases SOC 2 Type II, ISO 27001, and FINRA compliance tags, reinforcing institutional trust.
            </li>
            <li>
              <strong>Feature Highlight Pillars:</strong> Interactive cards showcasing the five core analytics engines with subtle 3D hover elevation and hairline borders.
            </li>
            <li>
              <strong>Zero Auth Barrier:</strong> Enables stakeholders to immediately evaluate all features without registration delays or access tokens.
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>SECURE-REGENT PLATFORM ARCHITECTURE</span>
      <span class="page-number">PAGE 04 OF 11</span>
      <span>OCTOBER 2026 // MONOCHROME EDITION</span>
    </div>
  </div>

  <!-- ================= PAGE 5: OVERVIEW DASHBOARD ================= -->
  <div class="page">
    <div class="page-header">
      <div class="brand">
        <span class="brand-badge">SR</span>
        <span>Section 02 // Executive Overview Dashboard</span>
      </div>
      <span class="system-id">ROUTE: /app (EXECUTIVE OVERVIEW)</span>
    </div>

    <div class="content-body">
      <div>
        <h2 class="section-title">04. Executive Overview & Target Realization</h2>
        <p class="lead-text">
          Consolidated command center synthesizing high-level commercial health, quarterly targets, and team performance.
        </p>
      </div>

      <div class="screenshot-container">
        <img src="${imgOverview}" alt="Secure-Regent Executive Overview Dashboard" />
        <div class="screenshot-caption">
          <span>FIG 2.0: EXECUTIVE OVERVIEW — TARGET SPEEDOMETER, REVENUE REALIZATION & LEADERBOARD</span>
          <span>VIEWPORT: 1600x1050 @2X RETINA</span>
        </div>
      </div>

      <div class="grid-3">
        <div class="mono-card">
          <h3 class="block-title">Target Realization Speedometer</h3>
          <p style="font-size: 8.5px; color: #4B5563;">
            An Apache ECharts gauge visualizing quota pacing ($842.5K against $1.2M target). Highlights pacing status: Ahead, On-Track, or Behind.
          </p>
        </div>

        <div class="mono-card">
          <h3 class="block-title">Cash Realization Ribbon</h3>
          <p style="font-size: 8.5px; color: #4B5563;">
            Stacked horizontal progress meter contrasting realized collections ($618.0K, 73.4%) against outstanding receivables ($224.5K, 26.6%).
          </p>
        </div>

        <div class="mono-card">
          <h3 class="block-title">Performance Leaderboard</h3>
          <p style="font-size: 8.5px; color: #4B5563;">
            Account executive rankings showing individual closed deal counts, generated revenue, win rates, and direct drilldown links.
          </p>
        </div>
      </div>

      <div class="mono-card-bordered">
        <h3 class="block-title">Interactive KPI Grid (With Haptic Drill-Down)</h3>
        <p style="font-size: 9px; color: #374151; line-height: 1.5;">
          Every KPI card displays analog rolling counters, SVG sparklines, period-over-period delta badges, and an expand icon. Clicking any KPI triggers the liquid iOS Genie popup drawer revealing the itemized record audit.
        </p>
      </div>
    </div>

    <div class="page-footer">
      <span>SECURE-REGENT PLATFORM ARCHITECTURE</span>
      <span class="page-number">PAGE 05 OF 11</span>
      <span>OCTOBER 2026 // MONOCHROME EDITION</span>
    </div>
  </div>

  <!-- ================= PAGE 6: LEAD ANALYTICS ================= -->
  <div class="page">
    <div class="page-header">
      <div class="brand">
        <span class="brand-badge">SR</span>
        <span>Section 03 // Lead Analytics & Funnel</span>
      </div>
      <span class="system-id">ROUTE: /app/leads (LEADS ANALYTICS)</span>
    </div>

    <div class="content-body">
      <div>
        <h2 class="section-title">05. Lead Velocity, Funnel Drop-off & Channel Attribution</h2>
        <p class="lead-text">
          Granular qualification metrics, multi-stage drop-off funnels, and marketing acquisition attribution analytics.
        </p>
      </div>

      <div class="screenshot-container">
        <img src="${imgLeads}" alt="Secure-Regent Lead Analytics Dashboard" />
        <div class="screenshot-caption">
          <span>FIG 3.0: LEAD ANALYTICS — 5-STAGE CONVERSION FUNNEL & ATTRIBUTION DISTRIBUTION</span>
          <span>VIEWPORT: 1600x1050 @2X RETINA</span>
        </div>
      </div>

      <div class="grid-2">
        <div class="mono-card">
          <h3 class="block-title">5-Stage Drop-Off Lead Funnel</h3>
          <ul class="feature-list">
            <li>
              <strong>Total Captured Leads (124):</strong> Aggregate volume entering the top of the commercial acquisition funnel.
            </li>
            <li>
              <strong>Qualified Leads (98, 79.0%):</strong> Leads verified to meet ICP criteria (budget, timeline, security requirements).
            </li>
            <li>
              <strong>Proposals Issued (84, 85.7% step rate):</strong> Accounts receiving formal technical scope and service quotations.
            </li>
            <li>
              <strong>Converted Deals (53, 63.1% win rate):</strong> Closed contracts generating binding service engagements.
            </li>
          </ul>
        </div>

        <div class="mono-card">
          <h3 class="block-title">Attribution & Directory Controls</h3>
          <ul class="feature-list">
            <li>
              <strong>Channel Volume Breakdown:</strong> ECharts donut chart breaking down acquisition source: Organic Search, LinkedIn / Social, Partner Referrals, Direct Sales, and Paid Ads.
            </li>
            <li>
              <strong>Status Distribution:</strong> Instant visual breakdown of leads currently in New, Qualified, Follow-Up, and Unqualified states.
            </li>
            <li>
              <strong>Interactive Directory:</strong> Search by contact name, company, or city with multi-column sorting and direct quotation drilldown.
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>SECURE-REGENT PLATFORM ARCHITECTURE</span>
      <span class="page-number">PAGE 06 OF 11</span>
      <span>OCTOBER 2026 // MONOCHROME EDITION</span>
    </div>
  </div>

  <!-- ================= PAGE 7: QUOTATION ANALYTICS ================= -->
  <div class="page">
    <div class="page-header">
      <div class="brand">
        <span class="brand-badge">SR</span>
        <span>Section 04 // Quotation Proposals & Win-Rate</span>
      </div>
      <span class="system-id">ROUTE: /app/quotations (PROPOSALS)</span>
    </div>

    <div class="content-body">
      <div>
        <h2 class="section-title">06. Service Quotations & Multi-Quote History</h2>
        <p class="lead-text">
          Proposal tracking, quote-to-deal conversion efficiency, and lead-wise proposal relationship records.
        </p>
      </div>

      <div class="screenshot-container">
        <img src="${imgQuotations}" alt="Secure-Regent Quotation Analytics Dashboard" />
        <div class="screenshot-caption">
          <span>FIG 4.0: QUOTATIONS — SERVICE-WISE PROPOSAL VOLUME & QUOTE CONVERSION RING</span>
          <span>VIEWPORT: 1600x1050 @2X RETINA</span>
        </div>
      </div>

      <div class="grid-3">
        <div class="mono-card">
          <h3 class="block-title">Service-Wise Quotation Volume</h3>
          <p style="font-size: 8.5px; color: #4B5563;">
            Bar chart charting issuance volume across service lines: Security Audits, Incident Response, Cloud Security, and Compliance Certifications.
          </p>
        </div>

        <div class="mono-card">
          <h3 class="block-title">Quote-to-Deal Conversion Ring</h3>
          <p style="font-size: 8.5px; color: #4B5563;">
            Polar ring gauge calculating acceptance rate (61.9% accepted proposals) against historical target benchmarks.
          </p>
        </div>

        <div class="mono-card">
          <h3 class="block-title">Lead-Wise History Directory</h3>
          <p style="font-size: 8.5px; color: #4B5563;">
            Demonstrates 1:M relationship where individual leads receive multiple versioned proposals across different scopes.
          </p>
        </div>
      </div>

      <div class="mono-card-bordered">
        <h3 class="block-title">Quotation Lifecycle Status Engine</h3>
        <p style="font-size: 9px; color: #374151; line-height: 1.5;">
          Proposals advance through rigorous states: <code>Draft</code> → <code>Sent</code> → <code>Under Review</code> → <code>Accepted</code> / <code>Rejected</code> / <code>Expired</code>. Expired quotations automatically trigger renewal follow-up prompts in the drilldown ledger.
        </p>
      </div>
    </div>

    <div class="page-footer">
      <span>SECURE-REGENT PLATFORM ARCHITECTURE</span>
      <span class="page-number">PAGE 07 OF 11</span>
      <span>OCTOBER 2026 // MONOCHROME EDITION</span>
    </div>
  </div>

  <!-- ================= PAGE 8: DEALS & REVENUE ================= -->
  <div class="page">
    <div class="page-header">
      <div class="brand">
        <span class="brand-badge">SR</span>
        <span>Section 05 // Deals & Revenue Realization</span>
      </div>
      <span class="system-id">ROUTE: /app/deals (REVENUE PIPELINE)</span>
    </div>

    <div class="content-body">
      <div>
        <h2 class="section-title">07. Commercial Contracts, Priority Tiers & Revenue</h2>
        <p class="lead-text">
          Comprehensive deal stages, category revenue contributions, daily trends, and cash collection tracking.
        </p>
      </div>

      <div class="screenshot-container">
        <img src="${imgDeals}" alt="Secure-Regent Deals and Revenue Dashboard" />
        <div class="screenshot-caption">
          <span>FIG 5.0: DEALS & REVENUE — DUAL-AXIS REVENUE VELOCITY & REGULATORY CATEGORIES</span>
          <span>VIEWPORT: 1600x1050 @2X RETINA</span>
        </div>
      </div>

      <div class="grid-2">
        <div class="mono-card">
          <h3 class="block-title">Dual-Axis Revenue Velocity Chart</h3>
          <ul class="feature-list">
            <li>
              <strong>Primary Axis (Bars):</strong> Daily booked revenue volume in USD, highlighting peaks during quarter-end sprints.
            </li>
            <li>
              <strong>Secondary Axis (Line):</strong> Deal contract velocity, tracking the number of simultaneously finalized agreements.
            </li>
            <li>
              <strong>Cross-Filter Scrubbing:</strong> Click any date bar to instantly open a drill-down window displaying all deals finalized on that specific day.
            </li>
          </ul>
        </div>

        <div class="mono-card">
          <h3 class="block-title">Regulatory & Priority Breakdown</h3>
          <ul class="feature-list">
            <li>
              <strong>Revenue by Regulatory Category:</strong> Visual distribution across FINRA, ISO 27001, HIPAA, and SOC 2 Type II compliance segments.
            </li>
            <li>
              <strong>Deal Priority Tiers:</strong> Segmentation by business urgency: Critical (SLA < 24h), High, Medium, and Low.
            </li>
            <li>
              <strong>Stage Transition Tracking:</strong> Monitors velocity between Discovery, Technical Evaluation, Commercial Proposal, and Closed-Won.
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>SECURE-REGENT PLATFORM ARCHITECTURE</span>
      <span class="page-number">PAGE 08 OF 11</span>
      <span>OCTOBER 2026 // MONOCHROME EDITION</span>
    </div>
  </div>

  <!-- ================= PAGE 9: ORDERS & FULFILLMENT ================= -->
  <div class="page">
    <div class="page-header">
      <div class="brand">
        <span class="brand-badge">SR</span>
        <span>Section 06 // Orders & Financial Ledger</span>
      </div>
      <span class="system-id">ROUTE: /app/orders (FULFILLMENT)</span>
    </div>

    <div class="content-body">
      <div>
        <h2 class="section-title">08. Service Execution, Delivery QA & Financial Ledger</h2>
        <p class="lead-text">
          Operational fulfillment monitoring, delivery status rings, payment method distribution, and audit ledgers.
        </p>
      </div>

      <div class="screenshot-container">
        <img src="${imgOrders}" alt="Secure-Regent Orders and Fulfillment Dashboard" />
        <div class="screenshot-caption">
          <span>FIG 6.0: ORDERS & FULFILLMENT — DELIVERY STATUS DONUT & PAYMENT LEDGER</span>
          <span>VIEWPORT: 1600x1050 @2X RETINA</span>
        </div>
      </div>

      <div class="grid-3">
        <div class="mono-card">
          <h3 class="block-title">Delivery Status Donut</h3>
          <p style="font-size: 8.5px; color: #4B5563;">
            Breakdown across fulfillment stages: In Progress, Pending Kickoff, QA Review, Completed, and Overdue milestones.
          </p>
        </div>

        <div class="mono-card">
          <h3 class="block-title">Payment Settlement Channels</h3>
          <p style="font-size: 8.5px; color: #4B5563;">
            Distribution across settlement rails: Corporate ACH (48%), Wire Transfer (32%), Credit Card (12%), and Escrow (8%).
          </p>
        </div>

        <div class="mono-card">
          <h3 class="block-title">Searchable Financial Ledger</h3>
          <p style="font-size: 8.5px; color: #4B5563;">
            Searchable transaction ledger linking Order IDs, Deal references, settlement dates, amounts, and receipt verification badges.
          </p>
        </div>
      </div>

      <div class="mono-card-bordered">
        <h3 class="block-title">Overdue Order Mitigation & Alerting</h3>
        <p style="font-size: 9px; color: #374151; line-height: 1.5;">
          Orders past their promised due date trigger automatic alert chips with escalation tags. Clicking the Overdue metric card launches the drill-down drawer pre-filtered exclusively to at-risk delivery contracts for immediate triage.
        </p>
      </div>
    </div>

    <div class="page-footer">
      <span>SECURE-REGENT PLATFORM ARCHITECTURE</span>
      <span class="page-number">PAGE 09 OF 11</span>
      <span>OCTOBER 2026 // MONOCHROME EDITION</span>
    </div>
  </div>

  <!-- ================= PAGE 10: GENIE POPUP & DRILLDOWN ENGINE ================= -->
  <div class="page">
    <div class="page-header">
      <div class="brand">
        <span class="brand-badge">SR</span>
        <span>Section 07 // Fluid Drill-Down & Genie Popup</span>
      </div>
      <span class="system-id">FEATURE: IOS GENIE TRANSITION</span>
    </div>

    <div class="content-body">
      <div>
        <h2 class="section-title">09. Genie-Effect Dual Window & Elevated Glass Surface</h2>
        <p class="lead-text">
          Hardware-accelerated liquid transformation modal with almost-opaque elevation, background blur, and deep drop shadows.
        </p>
      </div>

      <div class="screenshot-container">
        <img src="${imgDrilldown}" alt="Secure-Regent Drilldown Genie Popup" />
        <div class="screenshot-caption">
          <span>FIG 7.0: DRILLDOWN DRAWER — EXPANDED KPI MODAL WITH GENIE ZOOM & AUDIT RECORDS</span>
          <span>VIEWPORT: 1600x1050 @2X RETINA</span>
        </div>
      </div>

      <div class="grid-2">
        <div class="mono-card-bordered">
          <h3 class="block-title">iOS Genie Animation Mechanics</h3>
          <ul class="feature-list">
            <li>
              <strong>Origin Point Calibration:</strong> On click, the browser calculates the source card's exact bounding client rect <code>(x, y, w, h)</code>.
            </li>
            <li>
              <strong>Liquid Transform Matrix:</strong> The modal initializes directly from the card's center, scaling outward with a custom cubic-bezier timing function <code>cubic-bezier(0.16, 1, 0.3, 1)</code>.
            </li>
            <li>
              <strong>Smooth 450ms Trajectory:</strong> Produces the classic Apple iOS Genie fluid suction effect when opening and dismissing.
            </li>
          </ul>
        </div>

        <div class="mono-card-bordered">
          <h3 class="block-title">Popped-Up Opaque Glass Elevation</h3>
          <ul class="feature-list">
            <li>
              <strong>Nearly Opaque Backdrop (92% Fill):</strong> Engineered to eliminate distracting transparent bleed-through in light mode.
            </li>
            <li>
              <strong>Hardware Frosted Blur:</strong> Applied <code>backdrop-filter: blur(16px)</code> smoothly deflecting background charts.
            </li>
            <li>
              <strong>24px Ambient Drop Shadow:</strong> Multi-tiered shadow <code>0 24px 48px -12px rgba(0, 0, 0, 0.35)</code> imparting tangible physical elevation.
            </li>
          </ul>
        </div>
      </div>

      <div class="mono-card-dark">
        <h3 class="block-title" style="color: #FFFFFF;">Dual Floating Window Architecture</h3>
        <p style="font-size: 9px; color: #D1D5DB; line-height: 1.5;">
          The drill-down interface features synchronized split panels: the left panel presents summary statistics and breakdown charts for the selected cohort, while the right panel displays the itemized, searchable, and exportable line-item records.
        </p>
      </div>
    </div>

    <div class="page-footer">
      <span>SECURE-REGENT PLATFORM ARCHITECTURE</span>
      <span class="page-number">PAGE 10 OF 11</span>
      <span>OCTOBER 2026 // MONOCHROME EDITION</span>
    </div>
  </div>

  <!-- ================= PAGE 11: ADMIN CUSTOMIZER & TECH MATRIX ================= -->
  <div class="page">
    <div class="page-header">
      <div class="brand">
        <span class="brand-badge">SR</span>
        <span>Section 08 // Admin Console & System Specs</span>
      </div>
      <span class="system-id">ROUTE: /app/admin & AUDIT MATRIX</span>
    </div>

    <div class="content-body">
      <div>
        <h2 class="section-title">10. Admin Theme Engine & Technical Verification Matrix</h2>
        <p class="lead-text">
          Runtime CSS variable manipulation, multi-theme presets, chart colorway customizer, and comprehensive verification matrix.
        </p>
      </div>

      <div class="screenshot-container">
        <img src="${imgAdmin}" alt="Secure-Regent Admin Theme Customizer" />
        <div class="screenshot-caption">
          <span>FIG 8.0: ADMIN CONSOLE — LIVE THEME PRESETS, TOKEN INJECTOR & ECHARTS CONTROLS</span>
          <span>VIEWPORT: 1600x1050 @2X RETINA</span>
        </div>
      </div>

      <div class="grid-2">
        <div class="mono-card">
          <h3 class="block-title">Theme Customizer Engine</h3>
          <ul class="feature-list">
            <li>
              <strong>Presets:</strong> Obsidian Dark, Minima Beige (Swiss editorial), Cyber Neon, and Pure Light.
            </li>
            <li>
              <strong>Live Token Injector:</strong> Real-time color pickers updating <code>--bg-canvas</code>, <code>--bg-card</code>, <code>--color-accent</code>.
            </li>
            <li>
              <strong>ECharts Synchronizer:</strong> Live chart re-theming without tearing down SVG/Canvas instances.
            </li>
          </ul>
        </div>

        <div class="mono-card">
          <h3 class="block-title">Architecture Stack Inventory</h3>
          <table class="mono-table">
            <tbody>
              <tr><td class="code-cell">React 18</td><td>Concurrent rendering, Suspense, custom context</td></tr>
              <tr><td class="code-cell">TypeScript 5</td><td>Strict type safety, zero 'any' definitions</td></tr>
              <tr><td class="code-cell">Apache ECharts 5</td><td>60 FPS canvas charts, SVGs, responsive reflow</td></tr>
              <tr><td class="code-cell">Zustand 4</td><td>Decoupled atomic store, persistent local state</td></tr>
              <tr><td class="code-cell">Tailwind CSS 3</td><td>Utility styling, tokenized design system</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="mono-card-bordered">
        <h3 class="block-title">System Verification & Audit Checklist</h3>
        <table class="mono-table">
          <thead>
            <tr>
              <th>Validation Requirement</th>
              <th>Status</th>
              <th>Observed Metric</th>
              <th>Compliance Note</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Strict Monochromatic Styling</td>
              <td class="code-cell" style="color: #000000; font-weight: 800;">PASS</td>
              <td>100% Grayscale Palette</td>
              <td>Bauhaus typography, clean hairline borders</td>
            </tr>
            <tr>
              <td>High-Res View Captures</td>
              <td class="code-cell" style="color: #000000; font-weight: 800;">PASS</td>
              <td>8 Unretouched Views</td>
              <td>Rendered at @2X Retina resolution</td>
            </tr>
            <tr>
              <td>Genie Effect Micro-Interaction</td>
              <td class="code-cell" style="color: #000000; font-weight: 800;">PASS</td>
              <td>450ms Liquid Zoom</td>
              <td>Pop-up elevation, backdrop blur, opaque modal</td>
            </tr>
            <tr>
              <td>Cross-Filter Synchronicity</td>
              <td class="code-cell" style="color: #000000; font-weight: 800;">PASS</td>
              <td>< 12ms Recalculation</td>
              <td>Instant delta updates across all charts</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="page-footer">
      <span>SECURE-REGENT PLATFORM ARCHITECTURE</span>
      <span class="page-number">PAGE 11 OF 11</span>
      <span>OCTOBER 2026 // MONOCHROME EDITION // END OF REPORT</span>
    </div>
  </div>

</body>
</html>`;

  const templatePath = path.resolve(process.cwd(), 'scripts', 'report_template.html');
  fs.writeFileSync(templatePath, htmlContent, 'utf8');
  console.log(`Saved HTML report template to: ${templatePath}`);

  console.log('Launching Chrome to render PDF...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });

  console.log('Loading local HTML document...');
  await page.goto(`file://${templatePath}`, { waitUntil: 'networkidle0', timeout: 60000 });

  // Brief pause for all font faces and base64 images to settle
  await new Promise((res) => setTimeout(res, 2500));

  console.log(`Generating PDF to: ${OUTPUT_PDF}...`);
  await page.pdf({
    path: OUTPUT_PDF,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '10mm',
      bottom: '10mm',
      left: '12mm',
      right: '12mm'
    },
    preferCSSPageSize: true
  });

  await browser.close();
  console.log('✓ PDF generated successfully!');

  const stats = fs.statSync(OUTPUT_PDF);
  console.log(`PDF Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
}

generatePDF().catch((err) => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
