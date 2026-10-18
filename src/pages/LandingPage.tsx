import React, { useRef, useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChartLineUp,
  UsersThree,
  FileText,
  Handshake,
  ListChecks,
  List,
  X,
  Palette,
  Check
} from "@phosphor-icons/react";
import { useSettingsStore, ThemePreset } from "../store/settingsStore";
import { useDataStore } from "../store/dataStore";
import { formatCurrency, formatNumber } from "../utils/formatters";
import { BrandLogo } from "../components/common/BrandLogo";
import { LandingFooter } from "../components/common/SiteFooter";
import { AnalogRollingCounter } from "../components/common/AnalogRollingCounter";
import { TiltElement } from "../components/common/TiltElement";

const DARK_LANDING_STOPS: Record<ThemePreset, { stop1: string; stop2: string; stop3: string; stop4: string }> = {
  graphite: { stop1: "#0F1114", stop2: "#161B26", stop3: "#1E2942", stop4: "#121A2E" },
  "minima-beige": { stop1: "#1B1613", stop2: "#251E19", stop3: "#352920", stop4: "#2A2018" },
  signal: { stop1: "#140D0D", stop2: "#261314", stop3: "#3D181A", stop4: "#200E10" },
  forest: { stop1: "#0C140F", stop2: "#122419", stop3: "#163825", stop4: "#0F1F15" },
  sand: { stop1: "#14110C", stop2: "#241D14", stop3: "#382B1B", stop4: "#1E1810" },
  mono: { stop1: "#0F1114", stop2: "#181A1F", stop3: "#252930", stop4: "#14161C" }
};

export const LandingPage: React.FC = () => {
  const landing = useSettingsStore((s) => s.landing);
  const activePreset = useSettingsStore((s) => s.activePreset);
  const themeMode = useSettingsStore((s) => s.themeMode);
  const animationsEnabled = useSettingsStore((s) => s.animationsEnabled);
  const applyPreset = useSettingsStore((s) => s.applyPreset);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const { dataset } = useDataStore();

  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  // Dynamic light source tracking state
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [lightPos, setLightPos] = useState({ x: 50, y: 38, active: false });
  const [titleProximity, setTitleProximity] = useState(0);
  const [titleOffset, setTitleOffset] = useState({ dx: 0, dy: 0 });

  const totalLeads = dataset.leads.length;
  const totalRevenue = dataset.deals.reduce((sum, d) => sum + d.value, 0);
  const totalQuotes = dataset.quotations.length;
  const totalOrders = dataset.orders.length;

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!animationsEnabled) return;
    const el = heroRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLightPos({ x, y, active: true });

    if (titleRef.current) {
      const tRect = titleRef.current.getBoundingClientRect();
      const titleCenterX = tRect.left + tRect.width / 2;
      const titleCenterY = tRect.top + tRect.height / 2;
      const dx = e.clientX - titleCenterX;
      const dy = e.clientY - titleCenterY;
      const dist = Math.hypot(dx, dy);
      const prox = Math.max(0, Math.min(1, 1 - dist / 800));

      setTitleProximity(prox);
      setTitleOffset({ dx, dy });
    }
  }, [animationsEnabled]);

  const handlePointerLeave = useCallback(() => {
    setLightPos({ x: 50, y: 38, active: false });
    setTitleProximity(0);
    setTitleOffset({ dx: 0, dy: 0 });
  }, []);

  // Ambient gentle pulse when idle (skipped in low-power mode)
  useEffect(() => {
    if (!animationsEnabled) return;
    let frameId: number;
    let time = 0;
    const animateIdle = () => {
      if (!lightPos.active) {
        time += 0.015;
        const idleX = 50 + Math.sin(time) * 12;
        const idleY = 38 + Math.cos(time * 0.8) * 8;
        setLightPos((prev) => (prev.active ? prev : { x: idleX, y: idleY, active: false }));
      }
      frameId = requestAnimationFrame(animateIdle);
    };
    frameId = requestAnimationFrame(animateIdle);
    return () => cancelAnimationFrame(frameId);
  }, [animationsEnabled, lightPos.active]);

  const stops = isDark
    ? (DARK_LANDING_STOPS[activePreset] || DARK_LANDING_STOPS.graphite)
    : {
        stop1: landing.stop1,
        stop2: landing.stop2,
        stop3: landing.stop3,
        stop4: landing.stop4
      };

  const gradientStyle: React.CSSProperties = {
    backgroundColor: stops.stop1,
    backgroundImage: animationsEnabled
      ? `
        radial-gradient(circle 680px at ${lightPos.x}% ${lightPos.y}%, ${isDark ? "rgba(255, 255, 255, 0.18)" : "rgba(255, 255, 255, 0.28)"} 0%, ${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.08)"} 28%, transparent 64%),
        radial-gradient(circle 850px at ${lightPos.x}% ${lightPos.y}%, ${stops.stop2} 0%, transparent 68%),
        radial-gradient(circle 950px at ${100 - lightPos.x * 0.35}% ${100 - lightPos.y * 0.35}%, ${stops.stop3} 0%, transparent 62%),
        radial-gradient(circle 600px at ${85 - (lightPos.x - 50) * 0.2}% ${15 - (lightPos.y - 50) * 0.2}%, ${stops.stop4} 0%, transparent 50%)
      `
      : `
        radial-gradient(circle at 10% 45%, ${stops.stop2} 0%, transparent 55%),
        radial-gradient(circle at 90% 50%, ${stops.stop3} 0%, transparent 60%),
        radial-gradient(circle at 85% 15%, ${stops.stop4} 0%, transparent 45%)
      `,
    transition: lightPos.active ? "none" : "background-image 0.6s ease-out, background-color 0.4s ease-out"
  };

  const isMinimaBeige = activePreset === "minima-beige";

  // Deep contrasting title colors in light mode, luminous light colors in dark mode
  const titleColor = isDark
    ? (isMinimaBeige ? "#FAF0E6" : "#FFFFFF")
    : (isMinimaBeige ? "#2D231A" : "#171A20");

  const titleShadow = isDark
    ? `${(-titleOffset.dx * 0.03).toFixed(1)}px ${(-titleOffset.dy * 0.03 + 3).toFixed(1)}px ${(8 + titleProximity * 14).toFixed(1)}px rgba(0, 0, 0, 0.5), 0 0 ${(titleProximity * 28).toFixed(1)}px ${isMinimaBeige ? "rgba(217, 185, 155, 0.45)" : "rgba(255, 255, 255, 0.55)"}`
    : `${(-titleOffset.dx * 0.03).toFixed(1)}px ${(-titleOffset.dy * 0.03 + 3).toFixed(1)}px ${(6 + titleProximity * 8).toFixed(1)}px rgba(0, 0, 0, 0.14), 0 0 ${(titleProximity * 16).toFixed(1)}px ${isMinimaBeige ? "rgba(158, 98, 56, 0.15)" : "rgba(0, 0, 0, 0.06)"}`;

  const reactiveTitleStyle: React.CSSProperties = animationsEnabled
    ? {
        color: titleColor,
        transform: `perspective(900px) rotateX(${(titleOffset.dy * 0.012).toFixed(2)}deg) rotateY(${(-titleOffset.dx * 0.012).toFixed(2)}deg) scale(${(1 + titleProximity * 0.02).toFixed(3)})`,
        textShadow: titleShadow,
        transition: lightPos.active ? "transform 0.08s ease-out, text-shadow 0.1s ease-out" : "transform 0.5s ease-out, text-shadow 0.5s ease-out",
        willChange: "transform, text-shadow"
      }
    : {
        color: titleColor,
        textShadow: isDark ? "0 4px 16px rgba(0, 0, 0, 0.45)" : "0 2px 8px rgba(0, 0, 0, 0.1)"
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

  const presetsList: { id: ThemePreset; label: string; swatches: string[] }[] = [
    {
      id: "minima-beige",
      label: "Minima Beige (Pastel)",
      swatches: ["#FAF0E6", "#FFF0DB", "#EED9C4", "#E4D5B7", "#D9B99B"]
    },
    {
      id: "graphite",
      label: "Graphite Blue (Default)",
      swatches: ["#3E6AE1", "#E8EEFC", "#171A20", "#5C5E62"]
    },
    {
      id: "forest",
      label: "Forest Green",
      swatches: ["#267E54", "#E6F4ED", "#171A20", "#3DB87E"]
    },
    {
      id: "sand",
      label: "Sandstone Earth",
      swatches: ["#A67C46", "#F8F3EC", "#D4A567", "#362A1B"]
    },
    {
      id: "mono",
      label: "Mono Slate",
      swatches: ["#2D3139", "#EBECEE", "#171A20", "#D2D6DC"]
    }
  ];

  return (
    <div className="min-h-screen bg-canvas text-text-primary selection:bg-accent selection:text-white transition-colors duration-300">
      <section
        ref={heroRef}
        style={gradientStyle}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative min-h-screen flex flex-col justify-between p-4 sm:p-8 md:p-10 overflow-hidden cursor-crosshair touch-manipulation"
      >
        {/* Dynamic luminous cursor aura light beam */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute w-[460px] h-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px] bg-white/20 mix-blend-soft-light transition-opacity duration-300"
          style={{
            left: `${lightPos.x}%`,
            top: `${lightPos.y}%`,
            opacity: lightPos.active ? 0.9 : 0.4
          }}
        />

        {landing.noiseEnabled && (
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.045] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }}
          />
        )}

        {/* Blushéra Inspired Frosted Glassmorphism Header */}
        <header className="relative z-30 max-w-7xl mx-auto w-full pt-2">
          <div className="bg-card/75 backdrop-blur-xl border border-hairline/80 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 shadow-lg flex items-center justify-between transition-all">
            <Link
              to="/"
              className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full px-1"
              aria-label={`Landing page - ${landing.productName}`}
              title="Landing page"
            >
              <BrandLogo size={28} className="transition-transform group-hover:scale-105" />
              <span className="font-display font-semibold text-xs tracking-[0.25em] uppercase text-text-primary">
                {landing.productName}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-7">
              <Link
                to="/app"
                className="text-xs font-medium text-text-primary/80 hover:text-text-primary transition-colors hover:scale-105"
              >
                Features
              </Link>
              <Link
                to="/app/leads"
                className="text-xs font-medium text-text-primary/80 hover:text-text-primary transition-colors hover:scale-105"
              >
                Telemetry
              </Link>
              <Link
                to="/app/deals"
                className="text-xs font-medium text-text-primary/80 hover:text-text-primary transition-colors hover:scale-105"
              >
                Revenue
              </Link>
              <Link
                to="/app/admin"
                className="text-xs font-medium text-text-primary/80 hover:text-text-primary transition-colors hover:scale-105"
              >
                Admin
              </Link>

              {/* Theme preset selector pill */}
              <div className="relative">
                <button
                  onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-canvas/80 text-text-secondary hover:text-text-primary border border-hairline text-xs font-medium transition-all"
                  aria-label="Change theme preset"
                >
                  <Palette size={14} className="text-accent" />
                  <span className="capitalize">{activePreset === "minima-beige" ? "Minima Beige" : activePreset}</span>
                </button>

                {themeDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-2xl shadow-2xl border border-hairline p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider px-2 py-1">
                      Theme Palettes
                    </div>
                    <div className="space-y-1">
                      {presetsList.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            applyPreset(p.id);
                            setThemeDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors text-left ${
                            activePreset === p.id ? "bg-accent-soft text-accent font-semibold" : "hover:bg-canvas text-text-primary"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1">
                              {p.swatches.slice(0, 3).map((sw, idx) => (
                                <span
                                  key={idx}
                                  className="w-3.5 h-3.5 rounded-full border border-card shadow-sm"
                                  style={{ backgroundColor: sw }}
                                />
                              ))}
                            </div>
                            <span className="truncate">{p.label.split(" ")[0]}</span>
                          </div>
                          {activePreset === p.id && <Check size={14} weight="bold" className="shrink-0 text-accent" />}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 mt-2 border-t border-hairline flex items-center justify-between px-2">
                      <span className="text-[11px] text-text-secondary">Dark Mode</span>
                      <button
                        onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
                        className="px-2.5 py-1 rounded-full text-[11px] bg-canvas border border-hairline hover:bg-hairline/30 text-text-primary transition-all font-medium"
                      >
                        {themeMode === "dark" ? "Dark" : "Light"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <TiltElement
                as={Link}
                to="/app"
                maxTilt={16}
                elevation={10}
                className="px-5 py-2 rounded-full bg-text-primary text-card text-xs font-medium hover:opacity-95 shadow-md flex items-center gap-2"
              >
                <span>{landing.ctaLabel}</span>
                <ArrowRight size={14} weight="bold" />
              </TiltElement>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-full bg-canvas/80 text-text-primary border border-hairline hover:bg-canvas transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X size={18} /> : <List size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-2 bg-card/95 backdrop-blur-2xl border border-hairline rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-top-4 duration-200">
              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-text-primary">
                <Link
                  to="/app"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-canvas/60 hover:bg-canvas transition-colors flex items-center gap-2"
                >
                  <ChartLineUp size={16} className="text-accent" />
                  <span>Overview</span>
                </Link>
                <Link
                  to="/app/leads"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-canvas/60 hover:bg-canvas transition-colors flex items-center gap-2"
                >
                  <UsersThree size={16} className="text-accent" />
                  <span>Leads</span>
                </Link>
                <Link
                  to="/app/quotations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-canvas/60 hover:bg-canvas transition-colors flex items-center gap-2"
                >
                  <FileText size={16} className="text-accent" />
                  <span>Quotations</span>
                </Link>
                <Link
                  to="/app/deals"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-canvas/60 hover:bg-canvas transition-colors flex items-center gap-2"
                >
                  <Handshake size={16} className="text-accent" />
                  <span>Deals</span>
                </Link>
                <Link
                  to="/app/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-canvas/60 hover:bg-canvas transition-colors flex items-center gap-2"
                >
                  <ListChecks size={16} className="text-accent" />
                  <span>Orders</span>
                </Link>
                <Link
                  to="/app/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-canvas/60 hover:bg-canvas transition-colors flex items-center gap-2"
                >
                  <Palette size={16} className="text-accent" />
                  <span>Admin</span>
                </Link>
              </div>

              {/* Mobile Theme Preset Switcher */}
              <div className="pt-2 border-t border-hairline">
                <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider block mb-2">
                  Theme Palette
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {presetsList.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => applyPreset(p.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                        activePreset === p.id
                          ? "bg-accent-soft border-accent text-accent"
                          : "border-hairline bg-canvas/50 text-text-secondary"
                      }`}
                    >
                      <div className="flex -space-x-1 shrink-0">
                        {p.swatches.slice(0, 3).map((sw, idx) => (
                          <span
                            key={idx}
                            className="w-3 h-3 rounded-full border border-card shadow-sm"
                            style={{ backgroundColor: sw }}
                          />
                        ))}
                      </div>
                      <span className="truncate">{p.label.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Appearance Mode</span>
                  <button
                    onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
                    className="px-3 py-1.5 rounded-full text-xs bg-canvas border border-hairline font-medium text-text-primary"
                  >
                    {themeMode === "dark" ? "🌙 Dark" : "☀️ Light"}
                  </button>
                </div>
              </div>

              <TiltElement
                as={Link}
                to="/app"
                onClick={() => setMobileMenuOpen(false)}
                maxTilt={16}
                elevation={12}
                className="w-full py-3.5 rounded-full bg-text-primary text-card text-center text-sm font-medium shadow-lg flex items-center justify-center gap-2"
              >
                <span>{landing.ctaLabel}</span>
                <ArrowRight size={15} weight="bold" />
              </TiltElement>
            </div>
          )}
        </header>

        {/* Hero Content with Reactive Title and Light Response */}
        <div className="relative z-10 max-w-5xl mx-auto w-full text-center py-14 sm:py-20 my-auto select-none">
          <div className="inline-flex items-center justify-center gap-3 sm:gap-4 mb-6">
            <BrandLogo size={52} className="shadow-2xl rounded-2xl transition-transform hover:scale-105" />
            <h1
              ref={titleRef}
              style={reactiveTitleStyle}
              className="text-4xl sm:text-6xl md:text-8xl font-display font-black tracking-tight uppercase transition-all duration-75 cursor-default select-none"
            >
              {landing.productName}
            </h1>
          </div>

          <p className="text-text-primary text-xl sm:text-3xl md:text-4xl font-display font-medium tracking-tight mb-4 max-w-3xl mx-auto drop-shadow-sm">
            {landing.heroStatement}
          </p>

          <p className="text-text-primary/80 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            {landing.heroSubline}
          </p>

          {/* Interactive CTAs with Dimensional 3D Tilt & Losing Balance Physics */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <TiltElement
              as={Link}
              to="/app"
              maxTilt={18}
              elevation={14}
              scale={1.04}
              className="px-8 py-4 rounded-full bg-text-primary text-card text-sm sm:text-base font-medium shadow-xl flex items-center gap-2.5 transition-all"
            >
              <span>{landing.ctaLabel}</span>
              <ArrowRight size={16} weight="bold" />
            </TiltElement>

            <TiltElement
              as={Link}
              to="/app/admin"
              maxTilt={14}
              elevation={8}
              className="text-xs sm:text-sm font-medium text-text-primary/80 hover:text-text-primary transition-colors py-2.5 px-4 rounded-full bg-card/40 backdrop-blur-md border border-hairline/60"
            >
              Explore admin console & presets
            </TiltElement>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between text-xs text-text-primary/70 pt-6">
          <span>Enterprise edition for Indian professional services</span>
          <span>Zero external dependencies • Deterministic CRM</span>
        </div>
      </section>

      {/* Main Showcase Section */}
      <section className="relative -mt-20 pt-20 pb-28 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="relative mx-auto w-full max-w-6xl mb-24 overflow-hidden py-10">
          <div className="flex items-center justify-center relative min-h-[460px] sm:min-h-[580px]">
            {/* Left Decorative Angled Card */}
            <div className="hidden lg:block absolute left-[-60px] top-12 w-[480px] bg-card rounded-[32px] p-6 shadow-2xl border border-hairline/80 opacity-40 -rotate-3 scale-90 pointer-events-none select-none">
              <div className="h-4 w-28 bg-hairline rounded-full mb-6" />
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-canvas p-4 rounded-card h-24" />
                <div className="bg-canvas p-4 rounded-card h-24" />
              </div>
              <div className="bg-canvas p-4 rounded-card h-52" />
            </div>

            {/* Central Interactive Tilt Card with Losing Balance Physics */}
            <TiltElement
              maxTilt={7}
              elevation={16}
              scale={1.01}
              className="relative z-20 w-full max-w-4xl bg-card rounded-[32px] p-6 sm:p-8 shadow-2xl border border-hairline/70"
            >
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
                        className="w-full bg-accent rounded-full transition-all duration-300 hover:brightness-110"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TiltElement>

            {/* Right Decorative Angled Card */}
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

        {/* Full Lifecycle Operations Cards with 3D Tilt */}
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
              <TiltElement
                key={cap.title}
                maxTilt={14}
                elevation={12}
                scale={1.025}
                className="bg-card rounded-card p-6 shadow-card hover:shadow-flyout flex flex-col justify-between border border-hairline/40 transition-colors"
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
                    <AnalogRollingCounter value={cap.stat} />
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
              </TiltElement>
            ))}
          </div>
        </div>

        {/* Live Analytics CTA Banner */}
        <div
          style={gradientStyle}
          className="rounded-[32px] p-8 sm:p-14 text-center text-text-primary relative overflow-hidden shadow-xl"
        >
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-display font-medium tracking-tight mb-4 drop-shadow-sm">
              Explore live business analytics
            </h2>
            <p className="text-sm text-text-primary/80 mb-8 leading-relaxed">
              Fully interactive dashboard with deterministic CRM data simulation, cohort tracking and instant theme adjustments.
            </p>
            <TiltElement
              as={Link}
              to="/app"
              maxTilt={16}
              elevation={12}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-text-primary text-card text-sm font-medium hover:opacity-90 transition-all shadow-lg"
            >
              <span>{landing.ctaLabel}</span>
              <ArrowRight size={15} weight="bold" />
            </TiltElement>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};
