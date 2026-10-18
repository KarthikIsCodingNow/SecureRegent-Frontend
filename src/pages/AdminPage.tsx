import React, { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Switch from "@radix-ui/react-switch";
import * as Slider from "@radix-ui/react-slider";
import {
  ArrowCounterClockwise,
  DownloadSimple,
  UploadSimple,
  Trash,
  Image as ImageIcon,
  CheckCircle,
  WarningCircle,
  Tray,
  EnvelopeSimple,
  MagnifyingGlass,
  Sparkle,
  Check,
  ArrowSquareOut
} from "@phosphor-icons/react";
import { useSettingsStore, ThemePreset, ThemeMode, ColorTokens } from "@/store/settingsStore";
import { useDataStore } from "@/store/dataStore";
import { calculateContrast, getContrastBadge, isProhibitedHue } from "@/utils/colors";
import { formatCurrency } from "@/utils/formatters";
import { KpiCard } from "@/components/common/KpiCard";
import { BaseChart } from "@/components/charts/BaseChart";
import { EChartsOption } from "@/components/charts/echartsConfig";
import { BrandLogo } from "@/components/common/BrandLogo";

export const AdminPage: React.FC = () => {
  const settings = useSettingsStore();
  const { regenerate, reset: resetData } = useDataStore();
  const [activeTab, setActiveTab] = useState("theme");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonSuccess, setJsonSuccess] = useState(false);
  const [logoFeedback, setLogoFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  const [inboxSearch, setInboxSearch] = useState("");
  const [inboxFilter, setInboxFilter] = useState<"all" | "unread" | "read">("all");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [inboxFeedback, setInboxFeedback] = useState<string | null>(null);

  const unreadCount = settings.inboxMessages.filter((m) => !m.read).length;

  const filteredMessages = settings.inboxMessages.filter((msg) => {
    if (inboxFilter === "unread" && msg.read) return false;
    if (inboxFilter === "read" && !msg.read) return false;
    if (!inboxSearch.trim()) return true;
    const q = inboxSearch.toLowerCase();
    return (
      msg.name.toLowerCase().includes(q) ||
      msg.email.toLowerCase().includes(q) ||
      msg.subject.toLowerCase().includes(q) ||
      msg.message.toLowerCase().includes(q)
    );
  });

  const activeMessage =
    filteredMessages.find((m) => m.id === selectedMessageId) ||
    settings.inboxMessages.find((m) => m.id === selectedMessageId) ||
    filteredMessages[0] ||
    null;

  const handleMarkAllAsRead = () => {
    settings.inboxMessages.forEach((m) => {
      if (!m.read) settings.markInboxMessageAsRead(m.id, true);
    });
    setInboxFeedback("All inquiries marked as read.");
    setTimeout(() => setInboxFeedback(null), 3000);
  };

  const handleSendSampleInquiry = () => {
    const samples = [
      {
        name: "Aarav Singhania",
        email: "aarav@singhaniacapital.com",
        subject: "Secure-Regent Custom Dashboard Integration",
        message:
          "Hi Karthikeya,\n\nWe love the real-time simulation and drill-down metrics in Secure-Regent. Could we schedule a brief demo to discuss connecting our internal accounting feeds and quotation approval workflows?\n\nBest regards,\nAarav"
      },
      {
        name: "Pooja Hegde",
        email: "pooja.h@vertexfintech.io",
        subject: "White-label License and Dark Mode Customization",
        message:
          "Hello Karthikeya,\n\nOur team is exploring adopting Secure-Regent across our wealth advisory services. Does the admin panel support multi-client branding and customized CSV exports?\n\nThanks,\nPooja"
      },
      {
        name: "Rohan Patel",
        email: "rohan.p@catalystops.in",
        subject: "Direct Developer Contact: Technical Architecture Query",
        message:
          "Hello Karthikeya Ganugula,\n\nWe are impressed by the smooth page transitions and the analogue stopwatch KPI counters. What tech stack was chosen for the metrics engine?\n\nLooking forward to hearing from you,\nRohan"
      }
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    const created = settings.addInboxMessage(picked);
    setSelectedMessageId(created.id);
    setInboxFeedback(`Sample inquiry from ${created.name} added to inbox!`);
    setTimeout(() => setInboxFeedback(null), 3500);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = /\.(png|svg|jpe?g)$/i;
    if (!file.name.match(validExtensions) && !file.type.match(/^image\/(png|svg\+xml|jpeg|jpg)$/i)) {
      setLogoFeedback({ message: "Invalid format. Please select a PNG, SVG, JPEG, or JPG file.", isError: true });
      setTimeout(() => setLogoFeedback(null), 4000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLogoFeedback({ message: "Image exceeds 5MB limit. Please upload a smaller logo.", isError: true });
      setTimeout(() => setLogoFeedback(null), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        settings.setCustomLogo(dataUrl);
        setLogoFeedback({ message: "Logo updated successfully! Applied across website header, sidebar, and landing page." });
        setTimeout(() => setLogoFeedback(null), 4000);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveLogo = () => {
    settings.setCustomLogo(null);
    setLogoFeedback({ message: "Custom logo removed. Default Secure-Regent icon restored." });
    setTimeout(() => setLogoFeedback(null), 4000);
  };

  const previewOption: EChartsOption = {
    color: settings.charts.palette,
    grid: { left: 16, right: 16, top: 20, bottom: 20, containLabel: true },
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: settings.themeMode === "dark" ? "#A0A5AB" : "#5C5E62", fontSize: 11 }
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: settings.charts.gridLines,
        lineStyle: { color: settings.themeMode === "dark" ? "#262A30" : "#EDEDED" }
      },
      axisLabel: { color: settings.themeMode === "dark" ? "#A0A5AB" : "#5C5E62", fontSize: 11 }
    },
    series: [
      {
        name: "Preview",
        type: "bar",
        barMaxWidth: 16,
        itemStyle: {
          borderRadius: [settings.charts.barRadius, settings.charts.barRadius, 0, 0],
          color: settings.charts.palette[0]
        },
        data: [35, 48, 62, 54, 78, 65, 88]
      }
    ]
  };

  const handleExportJson = () => {
    const json = settings.exportSettingsJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `secureregent_settings_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJsonError(null);
    setJsonSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result;
      if (typeof content === "string") {
        const result = settings.importSettingsJson(content);
        if (result.success) {
          setJsonSuccess(true);
          setTimeout(() => setJsonSuccess(false), 3000);
        } else {
          setJsonError(result.error || "Failed to import settings.");
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const currentColors = settings.themeMode === "dark" ? settings.darkColors : settings.lightColors;
  const currentMode = settings.themeMode === "dark" ? "dark" : "light";

  const renderColorRow = (label: string, token: keyof ColorTokens, surfaceColor: string) => {
    const value = currentColors[token];
    const contrast = calculateContrast(value, surfaceColor);
    const badge = getContrastBadge(contrast);

    return (
      <div key={token} className="flex items-center justify-between py-2 border-b border-hairline last:border-0">
        <div>
          <span className="text-xs font-medium text-text-primary block">{label}</span>
          <span className="text-[11px] text-text-tertiary font-mono">{token}</span>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full tabular ${
              badge.pass ? "bg-positive/10 text-positive" : "bg-warning/15 text-warning"
            }`}
          >
            {badge.label}
          </span>

          <div className="flex items-center gap-1.5 bg-canvas border border-hairline rounded-full px-2 py-1">
            <input
              type="color"
              value={value}
              onChange={(e) => {
                if (!isProhibitedHue(e.target.value)) {
                  settings.setColorToken(currentMode, token, e.target.value);
                }
              }}
              className="w-4 h-4 rounded-full border-0 p-0 cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => {
                if (e.target.value.startsWith("#") && e.target.value.length <= 7) {
                  settings.setColorToken(currentMode, token, e.target.value);
                }
              }}
              className="w-16 bg-transparent text-xs font-mono text-text-primary focus:outline-none"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
        <div>
          <h1 className="text-[32px] leading-[40px] font-medium font-display text-text-primary tracking-tight">
            Admin console
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Live configuration for design tokens, visual aesthetics, layout orders and simulation parameters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => settings.resetAll()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-hairline text-xs font-medium text-text-secondary hover:text-negative hover:border-negative/30 hover:bg-negative/5 transition-colors"
          >
            <ArrowCounterClockwise size={13} />
            <span>Reset all settings</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className={activeTab === "inbox" ? "xl:col-span-12" : "xl:col-span-7"}>
          <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <Tabs.List className="flex items-center gap-1.5 p-1 bg-card rounded-full border border-hairline overflow-x-auto shadow-sm">
              {["theme", "charts", "layout", "business", "data", "landing", "inbox"].map((tab) => (
                <Tabs.Trigger
                  key={tab}
                  value={tab}
                  className="px-4 py-2 rounded-full text-xs font-medium capitalize text-text-secondary hover:text-text-primary transition-all data-[state=active]:bg-accent-soft data-[state=active]:text-accent whitespace-nowrap flex items-center gap-1.5"
                >
                  <span>{tab === "inbox" ? "Inquiries Inbox" : tab}</span>
                  {tab === "inbox" && unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-accent text-accent-contrast leading-none">
                      {unreadCount}
                    </span>
                  )}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <Tabs.Content value="theme" className="bg-card rounded-card shadow-card p-6 space-y-6 outline-none">
              <div className="flex items-center justify-between pb-4 border-b border-hairline">
                <div>
                  <h3 className="text-sm font-medium text-text-primary">Theme & surface aesthetics</h3>
                  <p className="text-xs text-text-secondary">Control appearance mode, curated presets and tokens</p>
                </div>
                <button
                  onClick={() => settings.resetSection("theme")}
                  className="text-xs text-text-tertiary hover:text-text-primary flex items-center gap-1"
                >
                  <ArrowCounterClockwise size={12} />
                  <span>Reset tab</span>
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium text-text-secondary block">Display mode</label>
                <div className="flex items-center gap-2">
                  {(["light", "dark", "system"] as ThemeMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => settings.setThemeMode(mode)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize border transition-all ${
                        settings.themeMode === mode
                          ? "bg-accent-soft border-accent text-accent"
                          : "border-hairline text-text-secondary hover:bg-canvas"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium text-text-secondary block">Curated preset palettes</label>
                <div className="flex flex-wrap items-center gap-2">
                  {(["graphite", "minima-beige", "signal", "forest", "sand", "mono"] as ThemePreset[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => settings.applyPreset(p)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize border transition-all ${
                        settings.activePreset === p
                          ? "bg-text-primary text-card border-text-primary shadow-sm"
                          : "border-hairline text-text-secondary hover:bg-canvas"
                      }`}
                    >
                      {p === "graphite" ? "Graphite Blue (Default)" : p === "minima-beige" ? "Minima Beige (Pastel)" : p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  Brand Tokens
                </div>
                {renderColorRow("Accent primary", "accent", currentColors.card)}
                {renderColorRow("Accent soft background", "accentSoft", currentColors.card)}

                <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider pt-3">
                  Surfaces
                </div>
                {renderColorRow("Canvas background", "canvas", currentColors.card)}
                {renderColorRow("Card surface", "card", currentColors.canvas)}
                {renderColorRow("Sidebar surface", "sidebar", currentColors.canvas)}
                {renderColorRow("Hairline divider", "hairline", currentColors.card)}

                <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider pt-3">
                  Typography & Contrast
                </div>
                {renderColorRow("Primary text", "textPrimary", currentColors.card)}
                {renderColorRow("Secondary text", "textSecondary", currentColors.card)}

                <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider pt-3">
                  Semantic Indicators
                </div>
                {renderColorRow("Positive metric", "positive", currentColors.card)}
                {renderColorRow("Negative metric", "negative", currentColors.card)}
                {renderColorRow("Warning metric", "warning", currentColors.card)}
              </div>

              <div className="pt-4 border-t border-hairline space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-text-secondary mb-2">
                    <span>Corner radius</span>
                    <span className="tabular">{settings.cornerRadius}px</span>
                  </div>
                  <Slider.Root
                    min={8}
                    max={32}
                    step={2}
                    value={[settings.cornerRadius]}
                    onValueChange={([val]) => settings.setShape(val, settings.shadowMode, settings.density)}
                    className="relative flex items-center select-none touch-none w-full h-5"
                  >
                    <Slider.Track className="bg-hairline relative grow rounded-full h-1.5">
                      <Slider.Range className="absolute bg-accent rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-4 h-4 bg-white border border-hairline shadow rounded-full focus:outline-none" />
                  </Slider.Root>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-text-primary block">Card shadow elevation</span>
                    <span className="text-[11px] text-text-secondary">Atmospheric card depth</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(["none", "soft", "medium"] as const).map((sh) => (
                      <button
                        key={sh}
                        onClick={() => settings.setShape(settings.cornerRadius, sh, settings.density)}
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${
                          settings.shadowMode === sh
                            ? "bg-accent-soft border-accent text-accent"
                            : "border-hairline text-text-secondary"
                        }`}
                      >
                        {sh}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Tabs.Content>

            <Tabs.Content value="charts" className="bg-card rounded-card shadow-card p-6 space-y-6 outline-none">
              <div className="flex items-center justify-between pb-4 border-b border-hairline">
                <div>
                  <h3 className="text-sm font-medium text-text-primary">Global chart defaults</h3>
                  <p className="text-xs text-text-secondary">Configure axes, curves, animation and palette slots</p>
                </div>
                <button
                  onClick={() => settings.resetSection("charts")}
                  className="text-xs text-text-tertiary hover:text-text-primary flex items-center gap-1"
                >
                  <ArrowCounterClockwise size={12} />
                  <span>Reset tab</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-hairline">
                  <div>
                    <span className="text-xs font-medium text-text-primary block">Horizontal grid lines</span>
                    <span className="text-[11px] text-text-secondary">Subtle reference dividers</span>
                  </div>
                  <Switch.Root
                    checked={settings.charts.gridLines}
                    onCheckedChange={(checked) => settings.setChartGlobal({ gridLines: checked })}
                    className="w-9 h-5 bg-hairline rounded-full relative data-[state=checked]:bg-accent transition-colors"
                  >
                    <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-100 translate-x-0.5 data-[state=checked]:translate-x-[18px]" />
                  </Switch.Root>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-hairline">
                  <div>
                    <span className="text-xs font-medium text-text-primary block">Smooth line curves</span>
                    <span className="text-[11px] text-text-secondary">Cubic bezier interpolation</span>
                  </div>
                  <Switch.Root
                    checked={settings.charts.smoothLines}
                    onCheckedChange={(checked) => settings.setChartGlobal({ smoothLines: checked })}
                    className="w-9 h-5 bg-hairline rounded-full relative data-[state=checked]:bg-accent transition-colors"
                  >
                    <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-100 translate-x-0.5 data-[state=checked]:translate-x-[18px]" />
                  </Switch.Root>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-xs font-medium text-text-secondary block">
                    Chart color palette (8 slots, purple-prohibited)
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {settings.charts.palette.map((color, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-tile bg-canvas border border-hairline"
                      >
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => settings.setChartPaletteSlot(idx, e.target.value)}
                          className="w-7 h-7 rounded-full border-0 p-0 cursor-pointer bg-transparent"
                        />
                        <span className="text-[10px] font-mono text-text-secondary">
                          {color.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Tabs.Content>

            <Tabs.Content value="layout" className="bg-card rounded-card shadow-card p-6 space-y-6 outline-none">
              <div className="flex items-center justify-between pb-4 border-b border-hairline">
                <div>
                  <h3 className="text-sm font-medium text-text-primary">Dashboard page layout</h3>
                  <p className="text-xs text-text-secondary">Toggle widget visibility and reorganize card order</p>
                </div>
                <button
                  onClick={() => settings.resetLayout("overview")}
                  className="text-xs text-text-tertiary hover:text-text-primary flex items-center gap-1"
                >
                  <ArrowCounterClockwise size={12} />
                  <span>Reset layout</span>
                </button>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider block">
                  Overview widgets
                </span>
                {(settings.pageLayouts.overview || []).map((w, idx) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between p-3 rounded-tile bg-canvas border border-hairline text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-text-tertiary w-4">{idx + 1}</span>
                      <span className="font-medium text-text-primary capitalize">{w.id}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={w.width}
                        onChange={(e) => {
                          const updated = [...(settings.pageLayouts.overview || [])];
                          updated[idx] = { ...w, width: e.target.value as "third" | "half" | "twoThirds" | "full" };
                          settings.setLayoutItems("overview", updated);
                        }}
                        className="px-2 py-1 rounded bg-card border border-hairline text-[11px] font-medium"
                      >
                        <option value="third">One third</option>
                        <option value="half">Half</option>
                        <option value="twoThirds">Two thirds</option>
                        <option value="full">Full width</option>
                      </select>

                      <Switch.Root
                        checked={w.visible}
                        onCheckedChange={(checked) => {
                          const updated = [...(settings.pageLayouts.overview || [])];
                          updated[idx] = { ...w, visible: checked };
                          settings.setLayoutItems("overview", updated);
                        }}
                        className="w-8 h-4 bg-hairline rounded-full relative data-[state=checked]:bg-accent transition-colors"
                      >
                        <Switch.Thumb className="block w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform duration-100 translate-x-0.5 data-[state=checked]:translate-x-[16px]" />
                      </Switch.Root>
                    </div>
                  </div>
                ))}
              </div>
            </Tabs.Content>

            <Tabs.Content value="business" className="bg-card rounded-card shadow-card p-6 space-y-6 outline-none">
              <div className="flex items-center justify-between pb-4 border-b border-hairline">
                <div>
                  <h3 className="text-sm font-medium text-text-primary">Business targets</h3>
                  <p className="text-xs text-text-secondary">Commercial revenue benchmarks and thresholds</p>
                </div>
                <button
                  onClick={() => settings.resetSection("business")}
                  className="text-xs text-text-tertiary hover:text-text-primary flex items-center gap-1"
                >
                  <ArrowCounterClockwise size={12} />
                  <span>Reset tab</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">
                    Monthly revenue target (INR)
                  </label>
                  <input
                    type="number"
                    value={settings.business.monthlyRevenueTarget}
                    onChange={(e) =>
                      settings.setBusinessSettings({ monthlyRevenueTarget: Number(e.target.value) })
                    }
                    className="w-full sm:w-64 px-3 py-1.5 rounded-tile bg-canvas border border-hairline text-sm font-medium tabular text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <span className="text-[11px] text-text-tertiary block mt-1">
                    Scaled automatically by days in selected timeframe
                  </span>
                </div>

                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">
                    High-priority deal value threshold (INR)
                  </label>
                  <input
                    type="number"
                    value={settings.business.highPriorityDealThreshold}
                    onChange={(e) =>
                      settings.setBusinessSettings({ highPriorityDealThreshold: Number(e.target.value) })
                    }
                    className="w-full sm:w-64 px-3 py-1.5 rounded-tile bg-canvas border border-hairline text-sm font-medium tabular text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            </Tabs.Content>

            <Tabs.Content value="data" className="bg-card rounded-card shadow-card p-6 space-y-6 outline-none">
              <div className="flex items-center justify-between pb-4 border-b border-hairline">
                <div>
                  <h3 className="text-sm font-medium text-text-primary">Data engine & PRNG simulator</h3>
                  <p className="text-xs text-text-secondary">Adjust calibration parameters and regenerate data</p>
                </div>
                <button
                  onClick={() => {
                    settings.resetSection("simulator");
                    resetData();
                  }}
                  className="text-xs text-text-tertiary hover:text-text-primary flex items-center gap-1"
                >
                  <ArrowCounterClockwise size={12} />
                  <span>Reset data</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">PRNG seed</label>
                  <input
                    type="number"
                    value={settings.simulator.seed}
                    onChange={(e) => settings.setSimulatorConfig({ seed: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-tile bg-canvas border border-hairline text-xs font-mono text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">History length (days)</label>
                  <input
                    type="number"
                    value={settings.simulator.historyDays}
                    onChange={(e) => settings.setSimulatorConfig({ historyDays: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-tile bg-canvas border border-hairline text-xs font-mono text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">Average leads / day</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.simulator.leadsPerDay}
                    onChange={(e) => settings.setSimulatorConfig({ leadsPerDay: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-tile bg-canvas border border-hairline text-xs font-mono text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">Qualification rate</label>
                  <input
                    type="number"
                    step="0.05"
                    value={settings.simulator.qualificationRate}
                    onChange={(e) => settings.setSimulatorConfig({ qualificationRate: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-tile bg-canvas border border-hairline text-xs font-mono text-text-primary"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-hairline flex flex-wrap items-center gap-3">
                <button
                  onClick={() => regenerate(settings.simulator)}
                  className="px-5 py-2 rounded-full bg-accent text-accent-contrast text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  Regenerate simulation dataset
                </button>
                <button
                  onClick={handleExportJson}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-hairline text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-canvas transition-colors"
                >
                  <DownloadSimple size={14} />
                  <span>Export settings JSON</span>
                </button>
                <label className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-hairline text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-canvas transition-colors cursor-pointer">
                  <UploadSimple size={14} />
                  <span>Import settings JSON</span>
                  <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                </label>
              </div>

              {jsonSuccess && (
                <div className="p-3 rounded-tile bg-positive/10 text-positive text-xs">
                  Settings imported successfully. All parameters updated.
                </div>
              )}
              {jsonError && (
                <div className="p-3 rounded-tile bg-negative/10 text-negative text-xs">
                  {jsonError}
                </div>
              )}
            </Tabs.Content>

            <Tabs.Content value="landing" className="bg-card rounded-card shadow-card p-6 space-y-6 outline-none">
              <div className="flex items-center justify-between pb-4 border-b border-hairline">
                <div>
                  <h3 className="text-sm font-medium text-text-primary">Landing page & branding</h3>
                  <p className="text-xs text-text-secondary">Custom logo, product name, hero copy and mesh gradient stops</p>
                </div>
                <button
                  onClick={() => settings.resetSection("landing")}
                  className="text-xs text-text-tertiary hover:text-text-primary flex items-center gap-1"
                >
                  <ArrowCounterClockwise size={12} />
                  <span>Reset tab</span>
                </button>
              </div>

              {/* Website Logo Upload Section */}
              <div className="p-4 rounded-tile bg-canvas/60 border border-hairline space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-accent" />
                      <span>Website Logo (PNG, SVG, JPEG, JPG)</span>
                    </h4>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      Upload your official logo to be displayed throughout the website (Sidebar, Landing page header & hero, Mobile navbar, and Footers).
                    </p>
                  </div>
                  {settings.customLogo && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-positive/10 text-positive border border-positive/20">
                      Custom Logo Active
                    </span>
                  )}
                </div>

                {/* Previews and Upload Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-6 flex items-center gap-4">
                    {/* Light preview card */}
                    <div className="p-3 rounded-tile bg-[#FFFFFF] border border-[#EDEDED] shadow-sm flex flex-col items-center justify-center min-w-[100px] text-center">
                      <BrandLogo size={36} />
                      <span className="text-[10px] font-medium text-[#5C5E62] mt-1.5">
                        Light Mode
                      </span>
                    </div>

                    {/* Dark preview card */}
                    <div className="p-3 rounded-tile bg-[#181B1F] border border-[#262A30] shadow-sm flex flex-col items-center justify-center min-w-[100px] text-center">
                      <BrandLogo size={36} />
                      <span className="text-[10px] font-medium text-[#A0A5AB] mt-1.5">
                        Dark Mode
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-6 flex flex-wrap items-center gap-2 sm:justify-end">
                    <label className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-accent-contrast text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-sm">
                      <UploadSimple size={14} weight="bold" />
                      <span>Upload Logo</span>
                      <input
                        type="file"
                        accept=".png,.svg,.jpeg,.jpg,image/png,image/svg+xml,image/jpeg"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    {settings.customLogo && (
                      <button
                        onClick={handleRemoveLogo}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-hairline text-xs font-medium text-text-secondary hover:text-negative hover:border-negative/30 hover:bg-negative/5 transition-colors"
                        title="Remove custom logo and restore default"
                      >
                        <Trash size={14} />
                        <span>Revert to default</span>
                      </button>
                    )}
                  </div>
                </div>

                {logoFeedback && (
                  <div
                    className={`p-3 rounded-tile text-xs flex items-center gap-2 animate-in fade-in duration-150 ${
                      logoFeedback.isError
                        ? "bg-negative/10 text-negative border border-negative/20"
                        : "bg-positive/10 text-positive border border-positive/20"
                    }`}
                  >
                    {logoFeedback.isError ? (
                      <WarningCircle size={15} weight="fill" className="shrink-0" />
                    ) : (
                      <CheckCircle size={15} weight="fill" className="shrink-0" />
                    )}
                    <span>{logoFeedback.message}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">Product name</label>
                  <input
                    type="text"
                    value={settings.landing.productName}
                    onChange={(e) => settings.setLandingSettings({ productName: e.target.value })}
                    className="w-full sm:w-80 px-3 py-1.5 rounded-tile bg-canvas border border-hairline text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">Hero statement</label>
                  <input
                    type="text"
                    value={settings.landing.heroStatement}
                    onChange={(e) => settings.setLandingSettings({ heroStatement: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-tile bg-canvas border border-hairline text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">Hero subline</label>
                  <textarea
                    value={settings.landing.heroSubline}
                    onChange={(e) => settings.setLandingSettings({ heroSubline: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-1.5 rounded-tile bg-canvas border border-hairline text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] text-text-secondary block mb-1">Stop 1 (Base)</label>
                    <input
                      type="color"
                      value={settings.landing.stop1}
                      onChange={(e) => settings.setLandingSettings({ stop1: e.target.value })}
                      className="w-full h-8 rounded-tile border border-hairline cursor-pointer bg-transparent p-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-text-secondary block mb-1">Stop 2 (Left edge)</label>
                    <input
                      type="color"
                      value={settings.landing.stop2}
                      onChange={(e) => settings.setLandingSettings({ stop2: e.target.value })}
                      className="w-full h-8 rounded-tile border border-hairline cursor-pointer bg-transparent p-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-text-secondary block mb-1">Stop 3 (Right edge)</label>
                    <input
                      type="color"
                      value={settings.landing.stop3}
                      onChange={(e) => settings.setLandingSettings({ stop3: e.target.value })}
                      className="w-full h-8 rounded-tile border border-hairline cursor-pointer bg-transparent p-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-text-secondary block mb-1">Stop 4 (Top-right)</label>
                    <input
                      type="color"
                      value={settings.landing.stop4}
                      onChange={(e) => settings.setLandingSettings({ stop4: e.target.value })}
                      className="w-full h-8 rounded-tile border border-hairline cursor-pointer bg-transparent p-0.5"
                    />
                  </div>
                </div>
              </div>
            </Tabs.Content>

            <Tabs.Content value="inbox" className="bg-card rounded-card shadow-card p-6 space-y-6 outline-none">
              {/* Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-hairline">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-text-primary font-display flex items-center gap-2">
                      <Tray size={18} className="text-accent" />
                      <span>Inquiries & Developer Contact Inbox</span>
                    </h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-accent-soft text-accent border border-accent/20">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    Messages submitted via website contact & developer section, addressed to{" "}
                    <strong className="text-text-primary font-medium">Karthikeya Ganugula (karthikeyaganugula07@gmail.com)</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleSendSampleInquiry}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-hairline text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-canvas transition-colors"
                    title="Simulate receiving a new website visitor inquiry"
                  >
                    <Sparkle size={13} className="text-accent" />
                    <span>Generate Sample Inquiry</span>
                  </button>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-hairline text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-canvas transition-colors"
                    >
                      <Check size={13} className="text-positive" />
                      <span>Mark all as read</span>
                    </button>
                  )}

                  {settings.inboxMessages.length > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm("Are you sure you want to clear all inquiries?")) {
                          settings.clearInboxMessages();
                          setSelectedMessageId(null);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-hairline text-xs font-medium text-text-secondary hover:text-negative hover:border-negative/30 hover:bg-negative/5 transition-colors"
                    >
                      <Trash size={13} />
                      <span>Clear inbox</span>
                    </button>
                  )}
                </div>
              </div>

              {inboxFeedback && (
                <div className="p-3 rounded-tile bg-positive/10 border border-positive/20 text-xs text-positive flex items-center gap-2 animate-in fade-in duration-150">
                  <CheckCircle size={15} weight="fill" className="shrink-0" />
                  <span>{inboxFeedback}</span>
                </div>
              )}

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input
                    type="text"
                    placeholder="Search inquiries by name, email, subject..."
                    value={inboxSearch}
                    onChange={(e) => setInboxSearch(e.target.value)}
                    className="w-full pl-9 pr-7 py-1.5 rounded-full bg-canvas border border-hairline text-xs font-medium text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  {inboxSearch && (
                    <button
                      onClick={() => setInboxSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-canvas rounded-full border border-hairline shrink-0">
                  {(["all", "unread", "read"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setInboxFilter(filter)}
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                        inboxFilter === filter
                          ? "bg-card text-text-primary shadow-sm"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {filter === "all"
                        ? `All (${settings.inboxMessages.length})`
                        : filter === "unread"
                        ? `Unread (${unreadCount})`
                        : `Read (${settings.inboxMessages.length - unreadCount})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Two-Column Inbox View */}
              {settings.inboxMessages.length === 0 ? (
                <div className="p-12 text-center rounded-card bg-canvas/40 border border-hairline space-y-4">
                  <div className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
                    <Tray size={24} weight="duotone" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary">Inbox is Empty</h4>
                    <p className="text-xs text-text-secondary mt-1 max-w-md mx-auto">
                      When website visitors or clients submit inquiries in the Developer Contact form, their messages will arrive here.
                    </p>
                  </div>
                  <button
                    onClick={handleSendSampleInquiry}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-accent-contrast text-xs font-medium hover:opacity-90 shadow-sm"
                  >
                    <Sparkle size={14} weight="bold" />
                    <span>Create Sample Inquiry</span>
                  </button>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="p-8 text-center rounded-tile bg-canvas/40 border border-hairline text-xs text-text-secondary">
                  No messages match your current search or filter.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Messages List (Left column) */}
                  <div className="lg:col-span-5 space-y-2 max-h-[600px] overflow-y-auto pr-1">
                    {filteredMessages.map((msg) => {
                      const isSelected = activeMessage?.id === msg.id;
                      return (
                        <div
                          key={msg.id}
                          onClick={() => {
                            setSelectedMessageId(msg.id);
                            if (!msg.read) {
                              settings.markInboxMessageAsRead(msg.id, true);
                            }
                          }}
                          className={`p-3.5 rounded-tile border transition-all cursor-pointer text-left relative group ${
                            isSelected
                              ? "bg-accent-soft/40 border-accent shadow-sm"
                              : msg.read
                              ? "bg-card border-hairline hover:border-text-secondary/30"
                              : "bg-card border-accent/40 shadow-sm hover:border-accent"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${msg.read ? "bg-transparent" : "bg-accent"}`} />
                              <span className={`text-xs truncate ${msg.read ? "font-medium text-text-secondary" : "font-bold text-text-primary"}`}>
                                {msg.name}
                              </span>
                            </div>
                            <span className="text-[10px] text-text-tertiary whitespace-nowrap">
                              {new Date(msg.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                            </span>
                          </div>

                          <div className={`text-xs truncate mb-1 ${msg.read ? "text-text-primary" : "font-semibold text-text-primary"}`}>
                            {msg.subject}
                          </div>

                          <div className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                            {msg.message}
                          </div>

                          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-hairline/60 text-[10px] text-text-tertiary">
                            <span className="truncate">{msg.email}</span>
                            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-canvas border border-hairline">
                              {msg.id}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Message Reader Pane (Right column) */}
                  <div className="lg:col-span-7 bg-canvas/40 rounded-card border border-hairline p-5 space-y-5">
                    {activeMessage ? (
                      <>
                        {/* Header / Actions */}
                        <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-hairline">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-accent-soft text-accent border border-accent/20">
                                {activeMessage.id}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                activeMessage.read
                                  ? "bg-hairline text-text-secondary"
                                  : "bg-positive/10 text-positive border border-positive/20"
                              }`}>
                                {activeMessage.read ? "Read" : "Unread"}
                              </span>
                              <span className="text-[11px] text-text-tertiary">
                                {new Date(activeMessage.createdAt).toLocaleString(undefined, {
                                  dateStyle: "medium",
                                  timeStyle: "short"
                                })}
                              </span>
                            </div>
                            <h3 className="text-base font-semibold text-text-primary font-display">
                              {activeMessage.subject}
                            </h3>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => settings.markInboxMessageAsRead(activeMessage.id, !activeMessage.read)}
                              className="px-2.5 py-1 rounded-full border border-hairline text-[11px] font-medium text-text-secondary hover:text-text-primary hover:bg-card transition-colors"
                              title="Toggle read status"
                            >
                              {activeMessage.read ? "Mark unread" : "Mark read"}
                            </button>
                            <button
                              onClick={() => {
                                settings.deleteInboxMessage(activeMessage.id);
                                if (selectedMessageId === activeMessage.id) {
                                  setSelectedMessageId(null);
                                }
                              }}
                              className="p-1.5 rounded-full border border-hairline text-text-tertiary hover:text-negative hover:border-negative/30 hover:bg-negative/5 transition-colors"
                              title="Delete inquiry"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Sender details card */}
                        <div className="p-3.5 rounded-tile bg-card border border-hairline space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-accent-soft text-accent font-semibold text-xs flex items-center justify-center shrink-0">
                                {activeMessage.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-text-primary">
                                  {activeMessage.name}
                                </div>
                                <a
                                  href={`mailto:${activeMessage.email}`}
                                  className="text-[11px] text-accent hover:underline flex items-center gap-1 font-mono"
                                >
                                  <span>{activeMessage.email}</span>
                                  <ArrowSquareOut size={12} />
                                </a>
                              </div>
                            </div>

                            <a
                              href={`mailto:${activeMessage.email}?subject=${encodeURIComponent(
                                `Re: ${activeMessage.subject}`
                              )}&body=${encodeURIComponent(
                                `Hi ${activeMessage.name},\n\nThank you for reaching out regarding "${activeMessage.subject}".\n\nBest regards,\nKarthikeya Ganugula\nPlatform Architect · Secure-Regent`
                              )}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-accent-contrast text-xs font-medium hover:opacity-90 shadow-sm transition-opacity"
                            >
                              <EnvelopeSimple size={14} weight="bold" />
                              <span>Reply via Email</span>
                            </a>
                          </div>

                          <div className="text-[11px] text-text-tertiary pt-2 border-t border-hairline flex items-center justify-between">
                            <span>Addressed to: <strong className="text-text-secondary font-medium">karthikeyaganugula07@gmail.com</strong></span>
                            <span>Developer: Karthikeya Ganugula · India 🇮🇳</span>
                          </div>
                        </div>

                        {/* Message Body */}
                        <div className="p-5 rounded-tile bg-card border border-hairline">
                          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                            Message Content
                          </div>
                          <div className="text-xs text-text-primary whitespace-pre-wrap leading-relaxed font-sans">
                            {activeMessage.message}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-12 text-center text-xs text-text-secondary">
                        Select an inquiry from the list on the left to read its full message and reply.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Tabs.Content>
          </Tabs.Root>
        </div>

        {activeTab !== "inbox" && (
          <div className="xl:col-span-5 sticky top-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                Live Component Preview
              </span>
              <span className="text-[11px] text-text-secondary">Updates instantly</span>
            </div>

            <KpiCard
              label="Revenue booked preview"
              value={3450000}
              formattedValue={formatCurrency(3450000, true, settings.charts.currencySymbol)}
              delta={{
                text: "+14.2%",
                value: 14.2,
                isNew: false,
                isNeutral: false,
                isPositive: true,
                inverted: false
              }}
              sparklineData={[30, 42, 38, 55, 62, 75, 88]}
            />

            <div className="bg-card rounded-card p-6 shadow-card">
              <div className="text-xs text-text-secondary font-medium mb-3">Activity weekly velocity</div>
              <BaseChart
                option={previewOption}
                height={190}
                ariaLabel="Admin preview chart"
              />
            </div>

            <div className="bg-card rounded-card p-5 shadow-card">
              <div className="text-xs text-text-secondary font-medium mb-3">Live table preview</div>
              <div className="overflow-hidden rounded-tile border border-hairline">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-canvas border-b border-hairline text-text-secondary">
                      <th className="py-2 px-3 font-medium">Service</th>
                      <th className="py-2 px-3 font-medium text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    <tr>
                      <td className="py-2 px-3 font-medium text-text-primary">Private Limited Company</td>
                      <td className="py-2 px-3 text-right tabular text-text-primary">₹14,500</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-text-primary">GST Annual Compliance</td>
                      <td className="py-2 px-3 text-right tabular text-text-primary">₹28,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
