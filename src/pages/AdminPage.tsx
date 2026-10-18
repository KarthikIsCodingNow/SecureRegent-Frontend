import React, { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Switch from "@radix-ui/react-switch";
import * as Slider from "@radix-ui/react-slider";
import { ArrowCounterClockwise, DownloadSimple, UploadSimple } from "@phosphor-icons/react";
import { useSettingsStore, ThemePreset, ThemeMode, ColorTokens } from "@/store/settingsStore";
import { useDataStore } from "@/store/dataStore";
import { calculateContrast, getContrastBadge, isProhibitedHue } from "@/utils/colors";
import { formatCurrency } from "@/utils/formatters";
import { KpiCard } from "@/components/common/KpiCard";
import { BaseChart } from "@/components/charts/BaseChart";
import { EChartsOption } from "@/components/charts/echartsConfig";

export const AdminPage: React.FC = () => {
  const settings = useSettingsStore();
  const { regenerate, reset: resetData } = useDataStore();
  const [activeTab, setActiveTab] = useState("theme");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonSuccess, setJsonSuccess] = useState(false);

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
    link.download = `meridian_settings_${new Date().toISOString().slice(0, 10)}.json`;
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
        <div className="xl:col-span-7">
          <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <Tabs.List className="flex items-center gap-1.5 p-1 bg-card rounded-full border border-hairline overflow-x-auto shadow-sm">
              {["theme", "charts", "layout", "business", "data", "landing"].map((tab) => (
                <Tabs.Trigger
                  key={tab}
                  value={tab}
                  className="px-4 py-2 rounded-full text-xs font-medium capitalize text-text-secondary hover:text-text-primary transition-all data-[state=active]:bg-accent-soft data-[state=active]:text-accent whitespace-nowrap"
                >
                  {tab}
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
                  {(["graphite", "signal", "forest", "sand", "mono"] as ThemePreset[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => settings.applyPreset(p)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize border transition-all ${
                        settings.activePreset === p
                          ? "bg-text-primary text-card border-text-primary"
                          : "border-hairline text-text-secondary hover:bg-canvas"
                      }`}
                    >
                      {p === "graphite" ? "Graphite Blue (Default)" : p}
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
                  className="px-5 py-2 rounded-full bg-accent text-white text-xs font-medium hover:opacity-90 transition-opacity"
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
                  <p className="text-xs text-text-secondary">Custom product name, hero copy and mesh gradient stops</p>
                </div>
                <button
                  onClick={() => settings.resetSection("landing")}
                  className="text-xs text-text-tertiary hover:text-text-primary flex items-center gap-1"
                >
                  <ArrowCounterClockwise size={12} />
                  <span>Reset tab</span>
                </button>
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
          </Tabs.Root>
        </div>

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
      </div>
    </div>
  );
};
