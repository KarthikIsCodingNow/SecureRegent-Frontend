import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Dataset, DateRange, FilterState } from "../domain/types";
import { useDataStore } from "../store/dataStore";
import { useSettingsStore } from "../store/settingsStore";
import { computeMetricDeltas, computeMetrics, MetricDeltas, MetricSummary } from "../domain/metrics";
import { DrillDownDrawer, DrillDownItem } from "../components/common/DrillDownDrawer";

export interface DrillDownOrigin {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface FilterContextType {
  filter: FilterState;
  setFilter: (patch: Partial<FilterState>) => void;
  resetFilter: () => void;
  currentRange: DateRange;
  previousRange: DateRange;
  currentDataset: Dataset;
  previousDataset: Dataset;
  currentMetrics: MetricSummary;
  previousMetrics: MetricSummary;
  deltas: MetricDeltas;
  openDrillDown: (
    title: string,
    subtitle: string,
    items: DrillDownItem[],
    origin?: DrillDownOrigin | null
  ) => void;
}

const FilterContext = createContext<FilterContextType | null>(null);

let lastPointerOrigin: DrillDownOrigin | null = null;

if (typeof window !== "undefined") {
  window.addEventListener(
    "pointerdown",
    (e) => {
      const target = e.target as HTMLElement | null;
      const cardEl = target?.closest('[role="button"], button, .group, [tabindex="0"]');
      if (cardEl) {
        const rect = cardEl.getBoundingClientRect();
        lastPointerOrigin = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height
        };
      } else {
        lastPointerOrigin = {
          x: e.clientX,
          y: e.clientY
        };
      }
    },
    { capture: true, passive: true }
  );
}


const DEFAULT_FILTER: FilterState = {
  timeframe: "last30",
  customStart: null,
  customEnd: null,
  compare: true,
  user: "all",
  department: "all",
  service: "all"
};

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { dataset, getFilteredData } = useDataStore();
  const monthlyTarget = useSettingsStore((s) => s.business.monthlyRevenueTarget);

  const initialFilter: FilterState = useMemo(() => {
    const rangeParam = searchParams.get("range");
    const tf: FilterState["timeframe"] =
      rangeParam === "today" || rangeParam === "last7" || rangeParam === "last30" || rangeParam === "custom"
        ? rangeParam
        : "last30";

    return {
      timeframe: tf,
      customStart: searchParams.get("from"),
      customEnd: searchParams.get("to"),
      compare: searchParams.get("compare") !== "false",
      user: searchParams.get("user") || "all",
      department: (searchParams.get("dept") as FilterState["department"]) || "all",
      service: searchParams.get("service") || "all"
    };
  }, [searchParams]);

  const [filter, setFilterState] = useState<FilterState>(initialFilter);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.timeframe !== "last30") params.set("range", filter.timeframe);
    if (filter.customStart) params.set("from", filter.customStart);
    if (filter.customEnd) params.set("to", filter.customEnd);
    if (!filter.compare) params.set("compare", "false");
    if (filter.user !== "all") params.set("user", filter.user);
    if (filter.department !== "all") params.set("dept", filter.department);
    if (filter.service !== "all") params.set("service", filter.service);

    setSearchParams(params, { replace: true });
  }, [filter, setSearchParams]);

  const setFilter = (patch: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...patch }));
  };

  const resetFilter = () => {
    setFilterState({ ...DEFAULT_FILTER });
  };

  const { current, previous, currentRange, previousRange } = useMemo(() => {
    return getFilteredData(filter);
  }, [filter, getFilteredData, dataset]);

  const currentMetrics = useMemo(() => {
    return computeMetrics(current, dataset.payments, currentRange, monthlyTarget);
  }, [current, dataset.payments, currentRange, monthlyTarget]);

  const previousMetrics = useMemo(() => {
    return computeMetrics(previous, dataset.payments, previousRange, monthlyTarget);
  }, [previous, dataset.payments, previousRange, monthlyTarget]);

  const deltas = useMemo(() => {
    return computeMetricDeltas(currentMetrics, previousMetrics);
  }, [currentMetrics, previousMetrics]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState<{
    title: string;
    subtitle: string;
    items: DrillDownItem[];
    origin?: DrillDownOrigin | null;
  }>({
    title: "",
    subtitle: "",
    items: [],
    origin: null
  });

  const openDrillDown = (
    title: string,
    subtitle: string,
    items: DrillDownItem[],
    origin?: DrillDownOrigin | null
  ) => {
    const resolvedOrigin =
      origin ||
      (typeof window !== "undefined" && (window as unknown as { __lastDrillDownOrigin?: DrillDownOrigin }).__lastDrillDownOrigin) ||
      lastPointerOrigin ||
      null;
    setDrawerData({ title, subtitle, items, origin: resolvedOrigin });
    setDrawerOpen(true);
  };

  return (
    <FilterContext.Provider
      value={{
        filter,
        setFilter,
        resetFilter,
        currentRange,
        previousRange,
        currentDataset: current,
        previousDataset: previous,
        currentMetrics,
        previousMetrics,
        deltas,
        openDrillDown
      }}
    >
      {children}
      <DrillDownDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={drawerData.title}
        subtitle={drawerData.subtitle}
        items={drawerData.items}
        originRect={drawerData.origin}
      />
    </FilterContext.Provider>
  );
};

export function useFilterContext() {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error("useFilterContext must be used within FilterProvider");
  }
  return ctx;
}
