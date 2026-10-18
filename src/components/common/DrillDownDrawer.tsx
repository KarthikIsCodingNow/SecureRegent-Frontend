import React, { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  ArrowRight,
  MagnifyingGlass,
  ChartLineUp,
  CalendarBlank,
  Coins,
  ListChecks
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { StatusChip, StatusTone } from "./StatusChip";
import { formatCurrency, formatNumber } from "../../utils/formatters";
import { BaseChart } from "../charts/BaseChart";
import { EChartsOption } from "../charts/echartsConfig";
import { useSettingsStore } from "../../store/settingsStore";

export interface DrillDownItem {
  id: string;
  type: "lead" | "deal" | "order" | "quotation";
  title: string;
  subtitle: string;
  date: string;
  amount?: number;
  status: string;
  statusTone?: StatusTone;
}

interface DrillDownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  items: DrillDownItem[];
  originRect?: { x: number; y: number; width?: number; height?: number } | null;
}

export const DrillDownDrawer: React.FC<DrillDownDrawerProps> = ({
  open,
  onOpenChange,
  title,
  subtitle,
  items,
  originRect
}) => {
  const navigate = useNavigate();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const isDark = themeMode === "dark";
  const lightColors = useSettingsStore((s) => s.lightColors);
  const darkColors = useSettingsStore((s) => s.darkColors);
  const accentColor = isDark ? darkColors.accent : lightColors.accent;
  const currencySymbol = useSettingsStore((s) => s.charts.currencySymbol) || "₹";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [activeMetricView, setActiveMetricView] = useState<"count" | "amount">("count");

  const handleRowClick = (item: DrillDownItem) => {
    onOpenChange(false);
    if (item.type === "lead") {
      navigate(`/app/leads/${item.id}`);
    } else if (item.type === "deal") {
      navigate(`/app/deals/${item.id}`);
    } else if (item.type === "order") {
      navigate(`/app/orders/${item.id}`);
    }
  };

  const hasAmounts = useMemo(() => {
    return items.some((i) => i.amount !== undefined && i.amount > 0);
  }, [items]);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, i) => sum + (i.amount || 0), 0);
  }, [items]);

  // Aggregate items chronologically for the analytical graph
  const { chartDates, chartCounts, chartAmounts, peakDay, isDummyData } = useMemo(() => {
    if (items.length === 0) {
      // Provide realistic 7-day dummy baseline distribution so graph is never blank
      const today = new Date();
      const dummyDates: string[] = [];
      const dummyCounts: number[] = [6, 11, 9, 15, 12, 18, 14];
      const dummyAmounts: number[] = [45000, 85000, 60000, 120000, 95000, 160000, 110000];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        dummyDates.push(d.toISOString().slice(5, 10));
      }

      return {
        chartDates: dummyDates,
        chartCounts: dummyCounts,
        chartAmounts: dummyAmounts,
        peakDay: dummyDates[5] || "Today",
        isDummyData: true
      };
    }

    const dateMap: Record<string, { count: number; amount: number }> = {};

    items.forEach((item) => {
      const d = item.date ? item.date.slice(0, 10) : new Date().toISOString().slice(0, 10);
      if (!dateMap[d]) {
        dateMap[d] = { count: 0, amount: 0 };
      }
      dateMap[d].count += 1;
      dateMap[d].amount += item.amount || 0;
    });

    let sortedDates = Object.keys(dateMap).sort();
    let counts = sortedDates.map((d) => dateMap[d].count);
    let amounts = sortedDates.map((d) => dateMap[d].amount);

    // If only 1 date exists, generate a 3-point contextual span so line/area renders cleanly
    if (sortedDates.length === 1) {
      const singleDate = sortedDates[0];
      const parsed = new Date(singleDate);
      const prevDate = new Date(parsed);
      prevDate.setDate(parsed.getDate() - 1);
      const nextDate = new Date(parsed);
      nextDate.setDate(parsed.getDate() + 1);

      const dPrevStr = prevDate.toISOString().slice(0, 10);
      const dNextStr = nextDate.toISOString().slice(0, 10);

      sortedDates = [dPrevStr, singleDate, dNextStr];
      counts = [0, counts[0], 0];
      amounts = [0, amounts[0], 0];
    }

    let maxCount = 0;
    let peak = sortedDates[0] || "N/A";
    Object.keys(dateMap).forEach((d) => {
      if (dateMap[d].count > maxCount) {
        maxCount = dateMap[d].count;
        peak = d;
      }
    });

    return {
      chartDates: sortedDates.map((d) => (d.length >= 10 ? d.slice(5) : d)),
      chartCounts: counts,
      chartAmounts: amounts,
      peakDay: peak,
      isDummyData: false
    };
  }, [items]);

  // Status breakdown stats
  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((i) => {
      map[i.status] = (map[i.status] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [items]);

  // ECharts Option for analytical timeline graph
  const chartOption: EChartsOption = useMemo(() => {
    const isAmountView = hasAmounts && activeMetricView === "amount";
    const dataValues = isAmountView ? chartAmounts : chartCounts;
    const isBarType = chartDates.length <= 3;

    return {
      tooltip: {
        trigger: "axis",
        backgroundColor: isDark ? "#181B1F" : "#FFFFFF",
        borderColor: isDark ? "#262A30" : "#EDEDED",
        borderWidth: 1,
        textStyle: {
          color: isDark ? "#F4F5F6" : "#171A20",
          fontSize: 12
        },
        formatter: (params: any) => {
          if (!params || !params[0]) return "";
          const p = params[0];
          const val = isAmountView
            ? formatCurrency(p.value, false, currencySymbol)
            : `${p.value} ${p.value === 1 ? "record" : "records"}`;
          return `
            <div style="font-weight: 600; margin-bottom: 2px;">${p.name}</div>
            <div style="color: ${accentColor}; font-weight: 600;">${val}</div>
          `;
        }
      },
      grid: {
        top: 24,
        right: 16,
        bottom: 24,
        left: 16,
        containLabel: true
      },
      xAxis: {
        type: "category",
        data: chartDates,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: isDark ? "#A0A5AB" : "#5C5E62",
          fontSize: 10
        }
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          lineStyle: {
            color: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
            type: "dashed"
          }
        },
        axisLabel: {
          color: isDark ? "#6E737A" : "#8E9196",
          fontSize: 10,
          formatter: (v: number) => {
            if (isAmountView) {
              if (v >= 100000) return `${currencySymbol}${(v / 100000).toFixed(0)}L`;
              if (v >= 1000) return `${currencySymbol}${(v / 1000).toFixed(0)}k`;
              return `${currencySymbol}${v}`;
            }
            return String(v);
          }
        }
      },
      series: [
        isBarType
          ? {
              name: isAmountView ? "Value" : "Volume",
              type: "bar",
              barMaxWidth: 32,
              data: dataValues,
              itemStyle: {
                color: accentColor,
                borderRadius: [4, 4, 0, 0]
              }
            }
          : {
              name: isAmountView ? "Value" : "Volume",
              type: "line",
              smooth: 0.35,
              showSymbol: true,
              symbol: "circle",
              symbolSize: 6,
              data: dataValues,
              itemStyle: {
                color: accentColor
              },
              lineStyle: {
                width: 2.5,
                color: accentColor
              },
              areaStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: accentColor },
                    { offset: 1, color: isDark ? "rgba(24, 27, 31, 0)" : "rgba(255, 255, 255, 0)" }
                  ]
                },
                opacity: 0.22
              }
            }
      ]
    };
  }, [chartDates, chartCounts, chartAmounts, hasAmounts, activeMetricView, isDark, currencySymbol, accentColor]);

  // Filtered items based on search term & selected status chip
  const filteredItems = useMemo(() => {
    let list = items;
    if (selectedStatus !== "all") {
      list = list.filter((i) => i.status.toLowerCase() === selectedStatus.toLowerCase());
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, searchTerm, selectedStatus]);

  const originStyle = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        "--origin-x": "50%",
        "--origin-y": "35%"
      } as React.CSSProperties;
    }
    const originX = originRect?.x ?? (window.innerWidth / 2);
    const originY = originRect?.y ?? (window.innerHeight * 0.35);
    const percentX = Math.round(Math.max(5, Math.min(95, (originX / window.innerWidth) * 100)));
    const percentY = Math.round(Math.max(5, Math.min(95, (originY / window.innerHeight) * 100)));
    return {
      "--origin-x": `${percentX}%`,
      "--origin-y": `${percentY}%`
    } as React.CSSProperties;
  }, [open, originRect]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Rich blurred background backdrop */}
        <Dialog.Overlay className="genie-backdrop fixed inset-0 z-40 transition-all" />

        {/* Modal expand container spanning almost full screen with iOS genie origin */}
        <Dialog.Content
          style={originStyle}
          className="genie-content fixed inset-2 sm:inset-4 md:inset-6 lg:inset-8 z-50 flex items-center justify-center outline-none pointer-events-none"
          aria-describedby={subtitle ? "drilldown-modal-subtitle" : undefined}
        >
          <div className="w-full h-full max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch gap-4 md:gap-5 pointer-events-auto overflow-y-auto lg:overflow-hidden p-1 sm:p-2">
            
            {/* =========================================================================
                FLOATING WINDOW 1: ANALYTICS GRAPH & TITLE WINDOW
                Slightly larger than regular dashboard boxes (~480-520px on desktop)
                Almost opaque, solid card with popped-up elevation shadow
               ========================================================================= */}
            <div className="w-full lg:w-[480px] xl:w-[520px] bg-card border border-hairline rounded-[24px] sm:rounded-[28px] shadow-popped-modal flex flex-col overflow-y-auto shrink-0 p-5 sm:p-6 genie-window-left">
              {/* Top row badge and mobile close */}
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-soft text-accent">
                  <ChartLineUp size={14} weight="bold" />
                  <span>Analytical Overview</span>
                </div>

                {isDummyData && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent-soft text-accent border border-accent/20">
                    Sample Preview
                  </span>
                )}

                {/* Mobile close button visible only on small screens */}
                <Dialog.Close asChild>
                  <button
                    className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary bg-canvas border border-hairline transition-colors ml-auto"
                    aria-label="Close"
                  >
                    <X size={16} weight="bold" />
                  </button>
                </Dialog.Close>
              </div>

              {/* Title & Description */}
              <Dialog.Title className="text-2xl sm:text-[26px] font-display font-medium text-text-primary tracking-tight">
                {title}
              </Dialog.Title>
              {subtitle && (
                <Dialog.Description
                  id="drilldown-modal-subtitle"
                  className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed"
                >
                  {subtitle}
                </Dialog.Description>
              )}

              {/* Analytical Summary Metric Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4">
                <div className="p-3 bg-canvas rounded-2xl border border-hairline shadow-sm">
                  <div className="text-[10px] font-semibold text-text-tertiary uppercase flex items-center gap-1">
                    <ListChecks size={12} weight="bold" />
                    <span>Total Volume</span>
                  </div>
                  <div className="text-lg font-medium text-text-primary mt-0.5 tabular font-display">
                    {formatNumber(items.length)}
                  </div>
                </div>

                {hasAmounts ? (
                  <div className="p-3 bg-canvas rounded-2xl border border-hairline shadow-sm">
                    <div className="text-[10px] font-semibold text-text-tertiary uppercase flex items-center gap-1">
                      <Coins size={12} weight="bold" />
                      <span>Total Realized</span>
                    </div>
                    <div className="text-lg font-medium text-text-primary mt-0.5 tabular font-display truncate">
                      {formatCurrency(totalAmount, false, currencySymbol)}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-canvas rounded-2xl border border-hairline shadow-sm">
                    <div className="text-[10px] font-semibold text-text-tertiary uppercase flex items-center gap-1">
                      <CalendarBlank size={12} weight="bold" />
                      <span>Peak Date</span>
                    </div>
                    <div className="text-lg font-medium text-text-primary mt-0.5 tabular font-display">
                      {peakDay}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-canvas rounded-2xl border border-hairline shadow-sm col-span-2 sm:col-span-1">
                  <div className="text-[10px] font-semibold text-text-tertiary uppercase">
                    Top Segment
                  </div>
                  <div className="text-sm font-medium text-text-primary mt-1 truncate">
                    {statusCounts[0] ? `${statusCounts[0][0]} (${statusCounts[0][1]})` : "N/A"}
                  </div>
                </div>
              </div>

              {/* Analytical Chart Header & Metric Toggle */}
              <div className="flex items-center justify-between gap-2 mb-2 mt-1">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <ChartLineUp size={13} className="text-accent" />
                  <span>Timeline Distribution</span>
                </span>

                {hasAmounts && (
                  <div className="flex items-center gap-1 p-0.5 bg-canvas border border-hairline rounded-full text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveMetricView("count")}
                      className={`px-3 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                        activeMetricView === "count"
                          ? "bg-accent text-accent-contrast shadow-sm"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      Count
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMetricView("amount")}
                      className={`px-3 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                        activeMetricView === "amount"
                          ? "bg-accent text-accent-contrast shadow-sm"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      Value ({currencySymbol})
                    </button>
                  </div>
                )}
              </div>

              {/* Analytical ECharts Container */}
              <div className="bg-canvas/90 dark:bg-canvas/40 border border-hairline rounded-2xl p-2.5 shadow-inner w-full min-h-[220px]">
                <BaseChart
                  option={chartOption}
                  height={220}
                  ariaLabel={`${title} analytical trend chart`}
                />
              </div>

              {/* Status Breakdown Filter Pills */}
              {statusCounts.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-hairline">
                  <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Status Breakdown</span>
                    <span className="text-[10px] font-normal lowercase text-text-tertiary">
                      Click to filter records
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {statusCounts.map(([st, cnt]) => {
                      const isSelected = selectedStatus.toLowerCase() === st.toLowerCase();
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setSelectedStatus(isSelected ? "all" : st)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                            isSelected
                              ? "bg-accent text-accent-contrast border-accent shadow-sm"
                              : "bg-canvas hover:bg-canvas/90 border-hairline text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? "bg-accent-contrast" : "bg-accent"
                            }`}
                          />
                          <span>{st}</span>
                          <span className="font-semibold tabular">({cnt})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Informative footer caption */}
              <div className="mt-auto pt-4 text-[11px] text-text-tertiary">
                Analytical drilldown covering {items.length} records.
              </div>
            </div>

            {/* =========================================================================
                FLOATING WINDOW 2: TOP-TO-BOTTOM RECORDS / VALUES WINDOW
                Full height panel presenting the list of records with search & filters
                Almost opaque, solid card with popped-up elevation shadow
               ========================================================================= */}
            <div className="flex-1 w-full h-full min-h-[500px] lg:min-h-0 bg-card border border-hairline rounded-[24px] sm:rounded-[28px] shadow-popped-modal flex flex-col overflow-hidden genie-window-right">
              
              {/* Header: Title, record count badge, and close button */}
              <div className="p-4 sm:p-5 border-b border-hairline bg-card flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
                    <ListChecks size={22} weight="bold" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-semibold font-display text-text-primary">
                        Records & Values
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-accent-soft text-accent">
                        {filteredItems.length} {filteredItems.length === 1 ? "record" : "records"}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Select any record to view its full details
                    </p>
                  </div>
                </div>

                <Dialog.Close asChild>
                  <button
                    className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary bg-canvas hover:bg-canvas/80 border border-hairline transition-all shrink-0 hover:rotate-90 duration-200"
                    aria-label="Close modal"
                  >
                    <X size={18} weight="bold" />
                  </button>
                </Dialog.Close>
              </div>

              {/* Filter and Search Bar */}
              <div className="p-3 sm:p-4 bg-canvas/80 dark:bg-canvas/40 border-b border-hairline shrink-0 flex flex-wrap items-center justify-between gap-2.5">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <MagnifyingGlass
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by ID, name, status, or keyword..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-card border border-hairline text-xs font-medium text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary p-0.5"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Quick filter pills */}
                {statusCounts.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                    <button
                      type="button"
                      onClick={() => setSelectedStatus("all")}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        selectedStatus === "all"
                          ? "bg-accent text-accent-contrast shadow-sm"
                          : "bg-card text-text-secondary hover:text-text-primary border border-hairline"
                      }`}
                    >
                      All ({items.length})
                    </button>
                    {statusCounts.slice(0, 4).map(([st, cnt]) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSelectedStatus(selectedStatus.toLowerCase() === st.toLowerCase() ? "all" : st)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          selectedStatus.toLowerCase() === st.toLowerCase()
                            ? "bg-accent text-accent-contrast shadow-sm"
                            : "bg-card text-text-secondary hover:text-text-primary border border-hairline"
                        }`}
                      >
                        {st} ({cnt})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Scrollable list of records */}
              <div className="flex-1 overflow-y-auto divide-y divide-hairline p-2 sm:p-3 space-y-1">
                {filteredItems.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-text-secondary">
                    <MagnifyingGlass size={32} className="text-text-tertiary mb-2 opacity-60" />
                    <p className="text-sm font-medium text-text-primary">No matching records found</p>
                    <p className="text-xs text-text-secondary mt-1 max-w-xs">
                      {searchTerm || selectedStatus !== "all"
                        ? "Try adjusting your search query or status filter."
                        : "There are no records in this dataset period."}
                    </p>
                    {(searchTerm || selectedStatus !== "all") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedStatus("all");
                        }}
                        className="mt-3 px-3 py-1.5 text-xs font-medium bg-accent-soft text-accent rounded-full hover:bg-accent hover:text-accent-contrast transition-colors"
                      >
                        Reset filters
                      </button>
                    )}
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      onClick={() => handleRowClick(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleRowClick(item);
                        }
                      }}
                      className="p-3.5 sm:p-4 rounded-xl hover:bg-canvas/70 hover:shadow-sm border border-transparent hover:border-hairline transition-all cursor-pointer flex items-center justify-between gap-4 group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-medium text-text-tertiary">
                            {item.id}
                          </span>
                          <StatusChip
                            label={item.status}
                            tone={item.statusTone || "neutral"}
                          />
                        </div>
                        <div className="text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                          {item.title}
                        </div>
                        <div className="text-xs text-text-secondary truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-3">
                        <div>
                          {item.amount !== undefined && (
                            <div className="text-sm font-medium font-display text-text-primary tabular">
                              {formatCurrency(item.amount, false, currencySymbol)}
                            </div>
                          )}
                          <div className="text-xs text-text-tertiary tabular mt-0.5">
                            {item.date}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-canvas group-hover:bg-accent group-hover:text-accent-contrast text-text-tertiary flex items-center justify-center transition-all shrink-0">
                          <ArrowRight
                            size={15}
                            className="group-hover:translate-x-0.5 transition-transform"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom footer bar */}
              <div className="px-4 py-3 border-t border-hairline bg-card flex items-center justify-between text-xs text-text-tertiary shrink-0">
                <span>
                  Showing {filteredItems.length} of {items.length} records
                </span>
                <span className="hidden sm:inline-block">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-canvas border border-hairline font-mono text-[10px]">ESC</kbd> to exit
                </span>
              </div>

            </div>

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
