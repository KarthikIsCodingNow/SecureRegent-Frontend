import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChartLineUp, UsersThree, FileText, Handshake, ListChecks } from "@phosphor-icons/react";
import { useSettingsStore } from "../store/settingsStore";
import { useDataStore } from "../store/dataStore";
import { formatCurrency, formatNumber } from "../utils/formatters";

export const LandingPage: React.FC = () => {
  const landing = useSettingsStore((s) => s.landing);
  const { dataset } = useDataStore();

  const totalLeads = dataset.leads.length;
  const totalRevenue = dataset.deals.reduce((sum, d) => sum + d.value, 0);
  const totalQuotes = dataset.quotations.length;
  const totalOrders = dataset.orders.length;

  const gradientStyle: React.CSSProperties = {
    backgroundColor: landing.stop1,
    backgroundImage: `
      radial-gradient(circle at 10% 45%, ${landing.stop2} 0%, transparent 55%),
      radial-gradient(circle at 90% 50%, ${landing.stop3} 0%, transparent 60%),
      radial-gradient(circle at 85% 15%, ${landing.stop4} 0%, transparent 45%)
    `
  };

  const capabilities = [
    {
      title: "Leads",
      sentence: "Capture and qualify commercial enquiries across Google Ads, Just Dial and organic referrals.",
      icon: UsersThree,
      sparkline: [12, 19, 15, 24, 28, 32, 40],
      stat: `${formatNumber(totalLeads)} captured`
    },
    {
      title: "Quotations",
      sentence: "Issue service-wise commercial estimates and track real-time acceptance rates.",
      icon: FileText,
      sparkline: [8, 14, 18, 16, 22, 29, 35],
      stat: `${formatNumber(totalQuotes)} quoted`
    },
    {
      title: "Deals and revenue",
      sentence: "Monitor booked contract value, outstanding receivables and realization velocity.",
      icon: Handshake,
      sparkline: [25, 30, 42, 38, 55, 62, 78],
      stat: formatCurrency(totalRevenue, true)
    },
    {
      title: "Orders and payments",
      sentence: "Orchestrate fulfillment milestones, operational SLA deadlines and UPI collections.",
      icon: ListChecks,
      sparkline: [14, 18, 22, 28, 34, 41, 48],
      stat: `${formatNumber(totalOrders)} fulfilled`
    }
  ];

  return (
    <div className="min-h-screen bg-canvas text-text-primary selection:bg-accent selection:text-white">
      <section
        style={gradientStyle}
        className="relative min-h-screen flex flex-col justify-between p-6 sm:p-10 overflow-hidden"
      >
        {landing.noiseEnabled && (
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.045] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }}
          />
        )}

        <header className="relative z-10 flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-text-primary flex items-center justify-center shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="3" width="5" height="18" rx="2.5" fill="white" />
                <rect x="15" y="8" width="5" height="13" rx="2.5" fill="#3E6AE1" />
              </svg>
            </div>
            <span className="font-display font-semibold text-xs tracking-[0.25em] uppercase text-text-primary">
              {landing.productName}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              to="/app"
              className="text-xs font-medium text-text-primary/80 hover:text-text-primary transition-colors hidden sm:inline-block"
            >
              Dashboard
            </Link>
            <Link
              to="/app/admin"
              className="text-xs font-medium text-text-primary/80 hover:text-text-primary transition-colors hidden sm:inline-block"
            >
              Admin
            </Link>
            <Link
              to="/app"
              className="px-5 py-2 rounded-full bg-text-primary text-white text-xs font-medium hover:bg-black/90 shadow-sm transition-all"
            >
              {landing.ctaLabel}
            </Link>
          </div>
        </header>

        <div className="relative z-10 max-w-4xl mx-auto w-full text-center py-16 sm:py-24 my-auto">
          <div className="inline-flex items-center justify-center gap-4 mb-6">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="drop-shadow-sm">
              <rect x="8" y="6" width="10" height="36" rx="5" fill="#FFFFFF" />
              <rect x="30" y="16" width="10" height="26" rx="5" fill="#FFFFFF" opacity="0.9" />
            </svg>
            <h1 className="text-white text-5xl sm:text-7xl font-display font-semibold tracking-tight">
              {landing.productName}
            </h1>
          </div>

          <p className="text-text-primary text-2xl sm:text-4xl font-display font-medium tracking-tight mb-4 max-w-2xl mx-auto">
            {landing.heroStatement}
          </p>

          <p className="text-text-primary/80 text-base sm:text-lg max-w-xl mx-auto mb-8 font-normal leading-relaxed">
            {landing.heroSubline}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/app"
              className="px-7 py-3.5 rounded-full bg-text-primary text-white text-sm font-medium hover:bg-black transition-transform hover:-translate-y-0.5 shadow-md flex items-center gap-2"
            >
              <span>{landing.ctaLabel}</span>
              <ArrowRight size={15} weight="bold" />
            </Link>
            <Link
              to="/app/admin"
              className="text-xs font-medium text-text-primary/75 hover:text-text-primary transition-colors py-2 px-3"
            >
              Explore the admin console
            </Link>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between text-xs text-text-primary/60 pt-6">
          <span>Enterprise edition for Indian professional services</span>
          <span>Zero external dependencies</span>
        </div>
      </section>

      <section className="relative -mt-20 pt-20 pb-28 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="relative mx-auto w-full max-w-6xl mb-24 overflow-hidden py-10">
          <div className="flex items-center justify-center relative min-h-[460px] sm:min-h-[580px]">
            <div className="hidden lg:block absolute left-[-60px] top-12 w-[480px] bg-card rounded-[32px] p-6 shadow-2xl border border-hairline/80 opacity-40 -rotate-3 scale-90 pointer-events-none select-none">
              <div className="h-4 w-28 bg-hairline rounded-full mb-6" />
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-canvas p-4 rounded-card h-24" />
                <div className="bg-canvas p-4 rounded-card h-24" />
              </div>
              <div className="bg-canvas p-4 rounded-card h-52" />
            </div>

            <div className="relative z-20 w-full max-w-4xl bg-card rounded-[32px] p-6 sm:p-8 shadow-2xl border border-hairline/60">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-hairline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-xs">
                    <ChartLineUp size={16} />
                  </div>
                  <div>
                    <div className="text-base font-display font-medium text-text-primary">
                      Executive Overview
                    </div>
                    <div className="text-xs text-text-secondary">
                      Last 30 days vs previous period
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium bg-positive/10 text-positive px-3 py-1 rounded-full tabular">
                    +18.4% revenue
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-card bg-canvas/60">
                  <span className="text-xs text-text-secondary block mb-1">New leads</span>
                  <span className="text-xl sm:text-2xl font-display font-medium text-text-primary tabular">
                    {formatNumber(totalLeads)}
                  </span>
                </div>
                <div className="p-4 rounded-card bg-canvas/60">
                  <span className="text-xs text-text-secondary block mb-1">Quotes issued</span>
                  <span className="text-xl sm:text-2xl font-display font-medium text-text-primary tabular">
                    {formatNumber(totalQuotes)}
                  </span>
                </div>
                <div className="p-4 rounded-card bg-canvas/60">
                  <span className="text-xs text-text-secondary block mb-1">Deals closed</span>
                  <span className="text-xl sm:text-2xl font-display font-medium text-text-primary tabular">
                    {formatNumber(dataset.deals.length)}
                  </span>
                </div>
                <div className="p-4 rounded-card bg-canvas/60">
                  <span className="text-xs text-text-secondary block mb-1">Revenue booked</span>
                  <span className="text-xl sm:text-2xl font-display font-medium text-text-primary tabular">
                    {formatCurrency(totalRevenue, true)}
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-card bg-canvas/40 border border-hairline flex flex-col justify-between h-48">
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>Revenue realization cadence</span>
                  <span className="tabular font-medium text-text-primary">82.4% target met</span>
                </div>
                <div className="flex items-end gap-2 h-28 pt-4">
                  {[35, 45, 60, 52, 70, 65, 80, 75, 90, 85, 95, 100].map((h, i) => (
                    <div key={i} className="flex-1 bg-hairline/50 rounded-full h-full flex items-end">
                      <div
                        className="w-full bg-accent rounded-full transition-all"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:block absolute right-[-60px] top-12 w-[480px] bg-card rounded-[32px] p-6 shadow-2xl border border-hairline/80 opacity-40 rotate-3 scale-90 pointer-events-none select-none">
              <div className="h-4 w-28 bg-hairline rounded-full mb-6" />
              <div className="space-y-3 mb-6">
                <div className="h-9 bg-canvas rounded-tile" />
                <div className="h-9 bg-canvas rounded-tile" />
                <div className="h-9 bg-canvas rounded-tile" />
              </div>
              <div className="bg-canvas p-4 rounded-card h-48" />
            </div>
          </div>
        </div>

        <div className="mb-24">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-display font-medium text-text-primary mb-3">
              Full lifecycle operations
            </h2>
            <p className="text-sm text-text-secondary">
              Connected telemetry from initial enquiry capture through statutory delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((cap) => (
              <div
                key={cap.title}
                className="bg-card rounded-card p-6 shadow-card hover:shadow-flyout transition-all flex flex-col justify-between border border-hairline/40"
              >
                <div>
                  <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center mb-5">
                    <cap.icon size={20} weight="fill" />
                  </div>
                  <h3 className="text-base font-display font-medium text-text-primary mb-2">
                    {cap.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed mb-6">
                    {cap.sentence}
                  </p>
                </div>

                <div className="pt-4 border-t border-hairline flex items-end justify-between">
                  <span className="text-sm font-medium font-display text-text-primary tabular">
                    {cap.stat}
                  </span>
                  <div className="w-16 h-6">
                    <svg viewBox="0 0 64 24" className="w-full h-full overflow-visible">
                      <polyline
                        points={cap.sparkline
                          .map((val, idx) => `${idx * 10},${24 - (val / 100) * 20}`)
                          .join(" ")}
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={gradientStyle}
          className="rounded-[32px] p-8 sm:p-14 text-center text-text-primary relative overflow-hidden shadow-lg"
        >
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-display font-medium tracking-tight mb-4">
              Explore live business analytics
            </h2>
            <p className="text-sm text-text-primary/80 mb-8 leading-relaxed">
              Fully interactive dashboard with deterministic CRM data simulation, cohort tracking and instant theme adjustments.
            </p>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-text-primary text-white text-sm font-medium hover:bg-black transition-all shadow-md"
            >
              <span>{landing.ctaLabel}</span>
              <ArrowRight size={15} weight="bold" />
            </Link>
          </div>
        </div>

        <footer className="mt-20 pt-8 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <span className="font-display font-medium text-text-primary">
              {landing.productName}
            </span>
            <span>—</span>
            <span>Business Performance & Revenue Analytics</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/app" className="hover:text-text-primary transition-colors">
              Dashboard
            </Link>
            <Link to="/app/leads" className="hover:text-text-primary transition-colors">
              Leads
            </Link>
            <Link to="/app/admin" className="hover:text-text-primary transition-colors">
              Admin console
            </Link>
          </div>
        </footer>
      </section>
    </div>
  );
};
