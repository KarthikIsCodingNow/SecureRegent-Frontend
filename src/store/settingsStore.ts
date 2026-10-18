import { create } from "zustand";
import { DEFAULT_CHART_PALETTE, DEFAULT_MONTHLY_TARGET } from "../domain/constants";
import { DEFAULT_SIMULATOR_CONFIG, SimulatorConfig } from "../domain/generator";
import { isProhibitedHue } from "../utils/colors";

export type ThemeMode = "light" | "dark" | "system";
export type ThemePreset = "graphite" | "signal" | "forest" | "sand" | "mono";

export interface ColorTokens {
  accent: string;
  accentSoft: string;
  canvas: string;
  sidebar: string;
  card: string;
  hairline: string;
  textPrimary: string;
  textSecondary: string;
  positive: string;
  negative: string;
  warning: string;
}

export interface ChartGlobalSettings {
  gridLines: boolean;
  dataLabels: boolean;
  legendPosition: "top-right" | "top-left" | "bottom" | "none";
  smoothLines: boolean;
  areaFillOpacity: number;
  barRadius: number;
  barWidth: number;
  animationDuration: number;
  axisLabelSize: number;
  numberFormat: "indian-compact" | "full" | "plain";
  decimals: number;
  currencySymbol: string;
  palette: string[];
}

export interface ChartOverride {
  chartType?: "bar" | "line" | "area" | "donut" | "horizontal-bar" | "funnel" | "gauge" | "stacked-bar";
  stacked?: boolean;
  showComparison?: boolean;
  topN?: number;
  sortOrder?: "asc" | "desc" | "none";
  granularity?: "auto" | "day" | "week" | "month";
  movingAverage?: 0 | 3 | 7;
  paletteOverride?: string[];
}

export interface WidgetLayoutItem {
  id: string;
  visible: boolean;
  width: "third" | "half" | "twoThirds" | "full";
}

export interface BusinessSettings {
  monthlyRevenueTarget: number;
  currency: string;
  weekStart: "Monday" | "Sunday";
  highPriorityDealThreshold: number;
}

export interface LandingSettings {
  productName: string;
  heroStatement: string;
  heroSubline: string;
  ctaLabel: string;
  stop1: string;
  stop2: string;
  stop3: string;
  stop4: string;
  noiseEnabled: boolean;
}

export interface SettingsState {
  version: number;
  themeMode: ThemeMode;
  activePreset: ThemePreset;
  lightColors: ColorTokens;
  darkColors: ColorTokens;
  cornerRadius: number;
  shadowMode: "none" | "soft" | "medium";
  density: "comfortable" | "compact";
  baseFontSize: number;
  fontPairing: "rethink-helvetica" | "helvetica-only" | "rethink-only";

  charts: ChartGlobalSettings;
  chartOverrides: Record<string, ChartOverride>;

  pageLayouts: Record<string, WidgetLayoutItem[]>;

  business: BusinessSettings;
  simulator: SimulatorConfig;
  landing: LandingSettings;

  setThemeMode: (mode: ThemeMode) => void;
  applyPreset: (preset: ThemePreset) => void;
  setColorToken: (mode: "light" | "dark", token: keyof ColorTokens, value: string) => boolean;
  setShape: (radius: number, shadow: "none" | "soft" | "medium", density: "comfortable" | "compact") => void;
  setFontSettings: (baseSize: number, pairing: "rethink-helvetica" | "helvetica-only" | "rethink-only") => void;

  setChartGlobal: (patch: Partial<ChartGlobalSettings>) => void;
  setChartPaletteSlot: (index: number, hex: string) => boolean;
  reorderChartPalette: (startIndex: number, endIndex: number) => void;
  setChartOverride: (chartId: string, override: Partial<ChartOverride>) => void;
  resetChartOverride: (chartId: string) => void;

  setLayoutItems: (page: string, items: WidgetLayoutItem[]) => void;
  resetLayout: (page: string) => void;

  setBusinessSettings: (patch: Partial<BusinessSettings>) => void;
  setSimulatorConfig: (patch: Partial<SimulatorConfig>) => void;
  setLandingSettings: (patch: Partial<LandingSettings>) => void;

  resetSection: (section: "theme" | "charts" | "layout" | "business" | "simulator" | "landing") => void;
  resetAll: () => void;
  exportSettingsJson: () => string;
  importSettingsJson: (json: string) => { success: boolean; error?: string };
}

const STORAGE_KEY = "meridian_settings_v1";

const DEFAULT_LIGHT_COLORS: ColorTokens = {
  accent: "#3E6AE1",
  accentSoft: "#E8EEFC",
  canvas: "#F7F7F8",
  sidebar: "#FAFAFA",
  card: "#FFFFFF",
  hairline: "#EDEDED",
  textPrimary: "#171A20",
  textSecondary: "#5C5E62",
  positive: "#2FBF71",
  negative: "#E5484D",
  warning: "#F5A524"
};

const DEFAULT_DARK_COLORS: ColorTokens = {
  accent: "#5B83F0",
  accentSoft: "#1E2942",
  canvas: "#0F1114",
  sidebar: "#131518",
  card: "#181B1F",
  hairline: "#262A30",
  textPrimary: "#F4F5F6",
  textSecondary: "#A0A5AB",
  positive: "#2FBF71",
  negative: "#E5484D",
  warning: "#F5A524"
};

const PRESETS: Record<ThemePreset, { light: Partial<ColorTokens>; dark: Partial<ColorTokens> }> = {
  graphite: {
    light: { accent: "#3E6AE1", accentSoft: "#E8EEFC" },
    dark: { accent: "#5B83F0", accentSoft: "#1E2942" }
  },
  signal: {
    light: { accent: "#D9383A", accentSoft: "#FCEBEB" },
    dark: { accent: "#F25557", accentSoft: "#381B1C" }
  },
  forest: {
    light: { accent: "#267E54", accentSoft: "#E6F4ED" },
    dark: { accent: "#3DB87E", accentSoft: "#163324" }
  },
  sand: {
    light: { accent: "#A67C46", accentSoft: "#F8F3EC" },
    dark: { accent: "#D4A567", accentSoft: "#362A1B" }
  },
  mono: {
    light: { accent: "#2D3139", accentSoft: "#EBECEE" },
    dark: { accent: "#D2D6DC", accentSoft: "#252930" }
  }
};

const DEFAULT_CHARTS_CONFIG: ChartGlobalSettings = {
  gridLines: true,
  dataLabels: false,
  legendPosition: "top-right",
  smoothLines: true,
  areaFillOpacity: 0.12,
  barRadius: 6,
  barWidth: 18,
  animationDuration: 600,
  axisLabelSize: 11,
  numberFormat: "indian-compact",
  decimals: 1,
  currencySymbol: "₹",
  palette: [...DEFAULT_CHART_PALETTE]
};

const DEFAULT_BUSINESS_CONFIG: BusinessSettings = {
  monthlyRevenueTarget: DEFAULT_MONTHLY_TARGET,
  currency: "₹",
  weekStart: "Monday",
  highPriorityDealThreshold: 30000
};

const DEFAULT_LANDING_CONFIG: LandingSettings = {
  productName: "Meridian",
  heroStatement: "From first enquiry to final payment.",
  heroSubline: "Track leads, quotations, deals, orders and collections across every service.",
  ctaLabel: "Open dashboard",
  stop1: "#F2C06A",
  stop2: "#B8C9D6",
  stop3: "#E8773E",
  stop4: "#B9C7D3",
  noiseEnabled: true
};

const DEFAULT_LAYOUTS: Record<string, WidgetLayoutItem[]> = {
  overview: [
    { id: "kpis", visible: true, width: "full" },
    { id: "targetRing", visible: true, width: "third" },
    { id: "revenueTrend", visible: true, width: "twoThirds" },
    { id: "leadFunnel", visible: true, width: "half" },
    { id: "leadSources", visible: true, width: "half" },
    { id: "salesLeaderboard", visible: true, width: "half" },
    { id: "activityFeed", visible: true, width: "half" }
  ],
  leads: [
    { id: "kpis", visible: true, width: "full" },
    { id: "leadFunnel", visible: true, width: "half" },
    { id: "leadStatusTrend", visible: true, width: "half" },
    { id: "leadSourceTrend", visible: true, width: "twoThirds" },
    { id: "leadSourceDonut", visible: true, width: "third" },
    { id: "leadsTable", visible: true, width: "full" }
  ],
  quotations: [
    { id: "kpis", visible: true, width: "full" },
    { id: "quotesByService", visible: true, width: "half" },
    { id: "quoteValueShare", visible: true, width: "half" },
    { id: "quoteStatusDonut", visible: true, width: "third" },
    { id: "quoteConversionGauge", visible: true, width: "third" },
    { id: "serviceSummaryTable", visible: true, width: "full" },
    { id: "leadQuoteHistory", visible: true, width: "full" }
  ],
  deals: [
    { id: "kpis", visible: true, width: "full" },
    { id: "dealsRevenueService", visible: true, width: "twoThirds" },
    { id: "revenueCategory", visible: true, width: "third" },
    { id: "priorityBreakdown", visible: true, width: "half" },
    { id: "dailyRevenueTrend", visible: true, width: "half" },
    { id: "collectionSummaryTiles", visible: true, width: "full" },
    { id: "dealProgressTable", visible: true, width: "full" }
  ],
  orders: [
    { id: "kpis", visible: true, width: "full" },
    { id: "orderStatusDonut", visible: true, width: "third" },
    { id: "orderServiceProgress", visible: true, width: "twoThirds" },
    { id: "completedOrdersTrend", visible: true, width: "half" },
    { id: "overdueOrdersList", visible: true, width: "half" },
    { id: "collectionTrends", visible: true, width: "twoThirds" },
    { id: "paymentMethodSplit", visible: true, width: "third" },
    { id: "operationsLeaderboard", visible: true, width: "half" },
    { id: "paymentHistoryTable", visible: true, width: "full" }
  ]
};

function applyCssTokensToDom(state: {
  themeMode: ThemeMode;
  lightColors: ColorTokens;
  darkColors: ColorTokens;
  cornerRadius: number;
  shadowMode: string;
}) {
  if (typeof document === "undefined") return;

  const isDark =
    state.themeMode === "dark" ||
    (state.themeMode === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const root = document.documentElement;
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  const colors = isDark ? state.darkColors : state.lightColors;
  root.style.setProperty("--canvas", colors.canvas);
  root.style.setProperty("--sidebar", colors.sidebar);
  root.style.setProperty("--card", colors.card);
  root.style.setProperty("--hairline", colors.hairline);
  root.style.setProperty("--text-primary", colors.textPrimary);
  root.style.setProperty("--text-secondary", colors.textSecondary);
  root.style.setProperty("--accent", colors.accent);
  root.style.setProperty("--accent-soft", colors.accentSoft);
  root.style.setProperty("--positive", colors.positive);
  root.style.setProperty("--negative", colors.negative);
  root.style.setProperty("--warning", colors.warning);
  root.style.setProperty("--radius-card", `${state.cornerRadius}px`);
  root.style.setProperty("--radius-tile", `${Math.max(8, state.cornerRadius - 6)}px`);

  if (state.shadowMode === "none") {
    root.style.setProperty("--shadow-card", "none");
  } else if (state.shadowMode === "medium") {
    root.style.setProperty(
      "--shadow-card",
      isDark
        ? "0 4px 12px rgba(0, 0, 0, 0.4), 0 16px 36px rgba(0, 0, 0, 0.45)"
        : "0 2px 4px rgba(16, 24, 40, 0.06), 0 12px 30px rgba(16, 24, 40, 0.08)"
    );
  } else {
    root.style.setProperty(
      "--shadow-card",
      isDark
        ? "0 1px 3px rgba(0, 0, 0, 0.25), 0 12px 32px rgba(0, 0, 0, 0.35)"
        : "0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px rgba(16, 24, 40, 0.04)"
    );
  }
}

function loadSavedState(): Partial<SettingsState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === 1) {
      return parsed;
    }
  } catch {
    return {};
  }
  return {};
}

function saveState(state: SettingsState) {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify({
      version: 1,
      themeMode: state.themeMode,
      activePreset: state.activePreset,
      lightColors: state.lightColors,
      darkColors: state.darkColors,
      cornerRadius: state.cornerRadius,
      shadowMode: state.shadowMode,
      density: state.density,
      baseFontSize: state.baseFontSize,
      fontPairing: state.fontPairing,
      charts: state.charts,
      chartOverrides: state.chartOverrides,
      pageLayouts: state.pageLayouts,
      business: state.business,
      simulator: state.simulator,
      landing: state.landing
    });
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    return;
  }
}

const saved = loadSavedState();

export const useSettingsStore = create<SettingsState>((set, get) => ({
  version: 1,
  themeMode: saved.themeMode || "light",
  activePreset: saved.activePreset || "graphite",
  lightColors: saved.lightColors || { ...DEFAULT_LIGHT_COLORS },
  darkColors: saved.darkColors || { ...DEFAULT_DARK_COLORS },
  cornerRadius: saved.cornerRadius || 20,
  shadowMode: saved.shadowMode || "soft",
  density: saved.density || "comfortable",
  baseFontSize: saved.baseFontSize || 14,
  fontPairing: saved.fontPairing || "rethink-helvetica",

  charts: saved.charts ? { ...DEFAULT_CHARTS_CONFIG, ...saved.charts } : { ...DEFAULT_CHARTS_CONFIG },
  chartOverrides: saved.chartOverrides || {},

  pageLayouts: saved.pageLayouts || { ...DEFAULT_LAYOUTS },

  business: saved.business ? { ...DEFAULT_BUSINESS_CONFIG, ...saved.business } : { ...DEFAULT_BUSINESS_CONFIG },
  simulator: saved.simulator ? { ...DEFAULT_SIMULATOR_CONFIG, ...saved.simulator } : { ...DEFAULT_SIMULATOR_CONFIG },
  landing: saved.landing ? { ...DEFAULT_LANDING_CONFIG, ...saved.landing } : { ...DEFAULT_LANDING_CONFIG },

  setThemeMode: (mode) => {
    set({ themeMode: mode });
    const s = get();
    applyCssTokensToDom(s);
    saveState(s);
  },

  applyPreset: (preset) => {
    const config = PRESETS[preset];
    if (!config) return;

    set((state) => ({
      activePreset: preset,
      lightColors: { ...state.lightColors, ...config.light },
      darkColors: { ...state.darkColors, ...config.dark }
    }));
    const s = get();
    applyCssTokensToDom(s);
    saveState(s);
  },

  setColorToken: (mode, token, value) => {
    if (isProhibitedHue(value)) {
      return false;
    }

    set((state) => {
      if (mode === "light") {
        return { lightColors: { ...state.lightColors, [token]: value } };
      }
      return { darkColors: { ...state.darkColors, [token]: value } };
    });
    const s = get();
    applyCssTokensToDom(s);
    saveState(s);
    return true;
  },

  setShape: (radius, shadow, density) => {
    set({ cornerRadius: radius, shadowMode: shadow, density });
    const s = get();
    applyCssTokensToDom(s);
    saveState(s);
  },

  setFontSettings: (baseSize, pairing) => {
    set({ baseFontSize: baseSize, fontPairing: pairing });
    const s = get();
    saveState(s);
  },

  setChartGlobal: (patch) => {
    set((state) => ({
      charts: { ...state.charts, ...patch }
    }));
    saveState(get());
  },

  setChartPaletteSlot: (index, hex) => {
    if (isProhibitedHue(hex)) {
      return false;
    }
    const current = [...get().charts.palette];
    current[index] = hex;
    set((state) => ({
      charts: { ...state.charts, palette: current }
    }));
    saveState(get());
    return true;
  },

  reorderChartPalette: (startIndex, endIndex) => {
    const palette = [...get().charts.palette];
    const [moved] = palette.splice(startIndex, 1);
    palette.splice(endIndex, 0, moved);
    set((state) => ({
      charts: { ...state.charts, palette }
    }));
    saveState(get());
  },

  setChartOverride: (chartId, override) => {
    set((state) => ({
      chartOverrides: {
        ...state.chartOverrides,
        [chartId]: { ...state.chartOverrides[chartId], ...override }
      }
    }));
    saveState(get());
  },

  resetChartOverride: (chartId) => {
    set((state) => {
      const next = { ...state.chartOverrides };
      delete next[chartId];
      return { chartOverrides: next };
    });
    saveState(get());
  },

  setLayoutItems: (page, items) => {
    set((state) => ({
      pageLayouts: {
        ...state.pageLayouts,
        [page]: items
      }
    }));
    saveState(get());
  },

  resetLayout: (page) => {
    set((state) => ({
      pageLayouts: {
        ...state.pageLayouts,
        [page]: DEFAULT_LAYOUTS[page] || []
      }
    }));
    saveState(get());
  },

  setBusinessSettings: (patch) => {
    set((state) => ({
      business: { ...state.business, ...patch }
    }));
    saveState(get());
  },

  setSimulatorConfig: (patch) => {
    set((state) => ({
      simulator: { ...state.simulator, ...patch }
    }));
    saveState(get());
  },

  setLandingSettings: (patch) => {
    set((state) => ({
      landing: { ...state.landing, ...patch }
    }));
    saveState(get());
  },

  resetSection: (section) => {
    if (section === "theme") {
      set({
        themeMode: "light",
        activePreset: "graphite",
        lightColors: { ...DEFAULT_LIGHT_COLORS },
        darkColors: { ...DEFAULT_DARK_COLORS },
        cornerRadius: 20,
        shadowMode: "soft",
        density: "comfortable",
        baseFontSize: 14,
        fontPairing: "rethink-helvetica"
      });
      applyCssTokensToDom(get());
    } else if (section === "charts") {
      set({
        charts: { ...DEFAULT_CHARTS_CONFIG },
        chartOverrides: {}
      });
    } else if (section === "layout") {
      set({ pageLayouts: { ...DEFAULT_LAYOUTS } });
    } else if (section === "business") {
      set({ business: { ...DEFAULT_BUSINESS_CONFIG } });
    } else if (section === "simulator") {
      set({ simulator: { ...DEFAULT_SIMULATOR_CONFIG } });
    } else if (section === "landing") {
      set({ landing: { ...DEFAULT_LANDING_CONFIG } });
    }
    saveState(get());
  },

  resetAll: () => {
    set({
      themeMode: "light",
      activePreset: "graphite",
      lightColors: { ...DEFAULT_LIGHT_COLORS },
      darkColors: { ...DEFAULT_DARK_COLORS },
      cornerRadius: 20,
      shadowMode: "soft",
      density: "comfortable",
      baseFontSize: 14,
      fontPairing: "rethink-helvetica",
      charts: { ...DEFAULT_CHARTS_CONFIG },
      chartOverrides: {},
      pageLayouts: { ...DEFAULT_LAYOUTS },
      business: { ...DEFAULT_BUSINESS_CONFIG },
      simulator: { ...DEFAULT_SIMULATOR_CONFIG },
      landing: { ...DEFAULT_LANDING_CONFIG }
    });
    applyCssTokensToDom(get());
    saveState(get());
  },

  exportSettingsJson: () => {
    const s = get();
    return JSON.stringify(
      {
        version: 1,
        themeMode: s.themeMode,
        activePreset: s.activePreset,
        lightColors: s.lightColors,
        darkColors: s.darkColors,
        cornerRadius: s.cornerRadius,
        shadowMode: s.shadowMode,
        density: s.density,
        baseFontSize: s.baseFontSize,
        fontPairing: s.fontPairing,
        charts: s.charts,
        chartOverrides: s.chartOverrides,
        pageLayouts: s.pageLayouts,
        business: s.business,
        simulator: s.simulator,
        landing: s.landing
      },
      null,
      2
    );
  },

  importSettingsJson: (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== "object") {
        return { success: false, error: "Invalid JSON file format." };
      }
      if (data.version !== 1) {
        return { success: false, error: "Incompatible settings schema version." };
      }

      set((state) => ({
        ...state,
        themeMode: data.themeMode || state.themeMode,
        activePreset: data.activePreset || state.activePreset,
        lightColors: { ...state.lightColors, ...(data.lightColors || {}) },
        darkColors: { ...state.darkColors, ...(data.darkColors || {}) },
        cornerRadius: typeof data.cornerRadius === "number" ? data.cornerRadius : state.cornerRadius,
        shadowMode: data.shadowMode || state.shadowMode,
        density: data.density || state.density,
        baseFontSize: data.baseFontSize || state.baseFontSize,
        fontPairing: data.fontPairing || state.fontPairing,
        charts: { ...state.charts, ...(data.charts || {}) },
        chartOverrides: data.chartOverrides || state.chartOverrides,
        pageLayouts: data.pageLayouts || state.pageLayouts,
        business: { ...state.business, ...(data.business || {}) },
        simulator: { ...state.simulator, ...(data.simulator || {}) },
        landing: { ...state.landing, ...(data.landing || {}) }
      }));

      const next = get();
      applyCssTokensToDom(next);
      saveState(next);
      return { success: true };
    } catch {
      return { success: false, error: "Failed to parse JSON file." };
    }
  }
}));

if (typeof window !== "undefined") {
  applyCssTokensToDom(useSettingsStore.getState());
}
