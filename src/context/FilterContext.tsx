import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Dataset, DateRange, FilterState } from "../domain/types";
import { useDataStore } from "../store/dataStore";
import { useSettingsStore } from "../store/settingsStore";
import { computeMetricDeltas, computeMetrics, MetricDeltas, MetricSummary } from "../domain/metrics";
import { DrillDownDrawer, DrillDownItem } from "../components/common/DrillDownDrawer";

interface FilterContextType {
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
  openDrillDown: (title: string, subtitle: string, items: DrillDownItem[]) => void;
}

const FilterContext = createContext<FilterContextType | null>(null);

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
  }>({
    title: "",
    subtitle: "",
    items: []
  });

  const openDrillDown = (title: string, subtitle: string, items: DrillDownItem[]) => {
    setDrawerData({ title, subtitle, items });
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
