import React, { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ArrowRight, MagnifyingGlass, ChartLineUp, CalendarBlank, Coins, ListChecks } from "@phosphor-icons/react";
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
}

export const DrillDownDrawer: React.FC<DrillDownDrawerProps> = ({
  open,
  onOpenChange,
  title,
  subtitle,
  items
}) => {
  const navigate = useNavigate();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const isDark = themeMode === "dark";
  const lightColors = useSettingsStore((s) => s.lightColors);
  const darkColors = useSettingsStore((s) => s.darkColors);
  const accentColor = isDark ? darkColors.accent : lightColors.accent;
  const currencySymbol = useSettingsStore((s) => s.charts.currencySymbol) || "₹";

  const [searchTerm, setSearchTerm] = useState("");
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

    // If only 1 date exists, generate a 3-point contextual span so line/area or bar renders visually
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

  // Filtered items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const q = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q)
    );
  }, [items, searchTerm]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-0 left-0 bottom-0 w-full sm:w-[580px] lg:w-[620px] bg-card shadow-2xl z-50 flex flex-col sm:rounded-r-[28px] outline-none animate-in slide-in-from-left duration-300 ease-out border-r border-hairline">
          {/* iOS sheet handle for mobile */}
          <div className="pt-2.5 pb-0 flex justify-center sm:hidden">
            <div className="w-12 h-1 bg-text-tertiary/30 rounded-full" />
          </div>

          {/* Header */}
          <div className="p-6 border-b border-hairline flex items-start justify-between gap-4 shrink-0 bg-card">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-accent-soft text-accent">
                  <ChartLineUp size={12} weight="bold" />
                  <span>Analytical Drilldown</span>
                </span>
                <span className="text-xs text-text-tertiary">
                  {items.length} records in view
                </span>
              </div>
              <Dialog.Title className="text-xl font-medium font-display text-text-primary">
                {title}
              </Dialog.Title>
              {subtitle && (
                <Dialog.Description className="text-xs text-text-secondary mt-1">
                  {subtitle}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-canvas transition-colors shrink-0"
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Analytical Graph Section */}
            <div className="p-5 border-b border-hairline bg-canvas/40 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    <ChartLineUp size={14} className="text-accent" />
                    <span>Distribution & Trend Analysis</span>
                  </div>
                  {isDummyData && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent-soft text-accent border border-accent/20">
                      Baseline Sample Preview
                    </span>
                  )}
                </div>

                {hasAmounts && (
                  <div className="flex items-center gap-1 p-0.5 bg-card border border-hairline rounded-full text-xs">
                    <button
                      onClick={() => setActiveMetricView("count")}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                        activeMetricView === "count"
                          ? "bg-accent text-accent-contrast shadow-sm"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      Count
                    </button>
                    <button
                      onClick={() => setActiveMetricView("amount")}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
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

                {/* Analytical Summary Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 bg-card rounded-tile border border-hairline">
                    <div className="text-[10px] font-medium text-text-tertiary uppercase flex items-center gap-1">
                      <ListChecks size={12} />
                      <span>Total Volume</span>
                    </div>
                    <div className="text-lg font-medium text-text-primary mt-0.5 tabular">
                      {formatNumber(items.length)}
                    </div>
                  </div>

                  {hasAmounts ? (
                    <div className="p-3 bg-card rounded-tile border border-hairline">
                      <div className="text-[10px] font-medium text-text-tertiary uppercase flex items-center gap-1">
                        <Coins size={12} />
                        <span>Total Realized</span>
                      </div>
                      <div className="text-lg font-medium text-text-primary mt-0.5 tabular truncate">
                        {formatCurrency(totalAmount, false, currencySymbol)}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-card rounded-tile border border-hairline">
                      <div className="text-[10px] font-medium text-text-tertiary uppercase flex items-center gap-1">
                        <CalendarBlank size={12} />
                        <span>Peak Date</span>
                      </div>
                      <div className="text-lg font-medium text-text-primary mt-0.5 tabular">
                        {peakDay}
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-card rounded-tile border border-hairline col-span-2 sm:col-span-1">
                    <div className="text-[10px] font-medium text-text-tertiary uppercase">
                      Top Segment
                    </div>
                    <div className="text-sm font-medium text-text-primary mt-1 truncate">
                      {statusCounts[0] ? `${statusCounts[0][0]} (${statusCounts[0][1]})` : "N/A"}
                    </div>
                  </div>
                </div>

                {/* ECharts Area Graph */}
                <div className="bg-card p-3 rounded-tile border border-hairline shadow-sm w-full min-h-[185px]">
                  <BaseChart
                    option={chartOption}
                    height={175}
                    ariaLabel={`${title} analytical trend chart`}
                  />
                </div>

                {/* Status distribution chips */}
                {statusCounts.length > 1 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-medium text-text-tertiary mr-1">
                      Status breakdown:
                    </span>
                    {statusCounts.map(([st, cnt]) => (
                      <span
                        key={st}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-card border border-hairline text-text-secondary"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <span>{st}</span>
                        <span className="font-semibold text-text-primary tabular">({cnt})</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

            {/* List of Values Section */}
            <div className="p-4 bg-canvas/60 border-b border-hairline sticky top-0 z-10 flex items-center justify-between gap-3 backdrop-blur-sm">
              <div className="relative flex-1 max-w-xs">
                <MagnifyingGlass
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter records..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-full bg-card border border-hairline text-xs font-medium text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="text-xs text-text-secondary tabular shrink-0">
                <span>
                  Showing {filteredItems.length} of {items.length} records
                </span>
              </div>
            </div>

            <div className="divide-y divide-hairline">
              {filteredItems.length === 0 ? (
                <div className="p-10 text-center text-sm text-text-secondary">
                  No matching records found.
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
                    className="p-4 hover:bg-canvas/50 transition-colors cursor-pointer flex items-center justify-between gap-4 group"
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
                      <div className="text-sm font-medium text-text-primary truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-text-secondary truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div>
                        {item.amount !== undefined && (
                          <div className="text-sm font-medium text-text-primary tabular">
                            {formatCurrency(item.amount, false, currencySymbol)}
                          </div>
                        )}
                        <div className="text-xs text-text-tertiary tabular">
                          {item.date}
                        </div>
                      </div>
                      <ArrowRight
                        size={16}
                        className="text-text-tertiary group-hover:text-accent group-hover:translate-x-0.5 transition-all"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
