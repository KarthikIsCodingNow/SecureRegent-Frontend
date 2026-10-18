import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { useFilterContext } from "@/context/FilterContext";
import { useSettingsStore } from "@/store/settingsStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { ChartCard } from "@/components/common/ChartCard";
import { ProgressRow } from "@/components/common/ProgressRow";
import { StatusChip } from "@/components/common/StatusChip";
import { BaseChart } from "@/components/charts/BaseChart";
import { createTooltipFormatter, getBaseEChartsOption } from "@/components/charts/chartTheme";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { SERVICES, SERVICE_CATEGORIES } from "@/domain/constants";
import { Deal } from "@/domain/types";
import { EChartsOption } from "@/components/charts/echartsConfig";
import { DrillDownItem } from "@/components/common/DrillDownDrawer";

export const DealsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentDataset, currentMetrics, deltas, currentRange, openDrillDown } = useFilterContext();
  const isDark = useSettingsStore((s) => s.themeMode === "dark");
  const chartsConfig = useSettingsStore((s) => s.charts);

  const handleExportCsv = () => {
    const headers = ["Deal ID", "Lead ID", "Service", "Category", "Value", "Priority", "Stage", "Owner", "Created At"];
    const rows = currentDataset.deals.map((d) => [
      d.id,
      d.leadId,
      `"${d.service}"`,
      `"${d.category}"`,
      d.value,
      d.priority,
      d.stage,
      `"${d.owner}"`,
      d.createdAt
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `secureregent_deals_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dealsRevenueByServiceOption: EChartsOption = useMemo(() => {
    const serviceCounts: Record<string, { count: number; revenue: number }> = {};
    for (const s of SERVICES) {
      serviceCounts[s.name] = { count: 0, revenue: 0 };
    }
    for (const d of currentDataset.deals) {
      if (!serviceCounts[d.service]) {
        serviceCounts[d.service] = { count: 0, revenue: 0 };
      }
      serviceCounts[d.service].count++;
      serviceCounts[d.service].revenue += d.value;
    }

    const sorted = Object.entries(serviceCounts)
      .filter(([, v]) => v.count > 0 || v.revenue > 0)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 8);

    const categories = sorted.map(([name]) => (name.length > 14 ? `${name.substring(0, 12)}...` : name));
    const counts = sorted.map(([, v]) => v.count);
    const revenues = sorted.map(([, v]) => v.revenue);

    const base = getBaseEChartsOption({
      isDark,
      colors: chartsConfig.palette,
      gridLines: chartsConfig.gridLines,
      currencySymbol: chartsConfig.currencySymbol
    });

    return {
      ...base,
      tooltip: {
        trigger: "axis",
        backgroundColor: isDark ? "#181B1F" : "#FFFFFF",
        borderColor: isDark ? "#262A30" : "#EDEDED",
        borderRadius: 12,
        formatter: (params: unknown) => {
          const list = Array.isArray(params) ? (params as { name?: string; seriesName?: string; value: number }[]) : [];
          if (list.length === 0) return "";
          const title = list[0].name || "";
          let html = `<div style="padding: 10px 14px; min-width: 150px;">
            <div style="font-size: 12px; font-weight: 500; color: #8E9196; margin-bottom: 6px;">${title}</div>`;
          for (const item of list) {
            const isRev = item.seriesName === "Revenue";
            const valStr = isRev
              ? formatCurrency(item.value, false, chartsConfig.currencySymbol)
              : formatNumber(item.value);
            html += `<div style="display: flex; justify-content: space-between; gap: 12px; margin-top: 4px; font-size: 13px;">
              <span>${item.seriesName}:</span>
              <span style="font-weight: 500; font-variant-numeric: tabular-nums;">${valStr}</span>
            </div>`;
          }
          html += `</div>`;
          return html;
        }
      },
      legend: {
        show: chartsConfig.legendPosition !== "none",
        top: 0,
        right: 0,
        icon: "circle",
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { color: isDark ? "#A0A5AB" : "#5C5E62", fontSize: 11 }
      },
      xAxis: {
        type: "category",
        data: categories,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: isDark ? "#A0A5AB" : "#5C5E62", fontSize: 11 }
      },
      yAxis: [
        {
          type: "value",
          name: "Deals",
          nameTextStyle: { color: isDark ? "#A0A5AB" : "#5C5E62", fontSize: 11 },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: {
            show: chartsConfig.gridLines,
            lineStyle: { color: isDark ? "#262A30" : "#EDEDED" }
          },
          axisLabel: { color: isDark ? "#A0A5AB" : "#5C5E62", fontSize: 11 }
        },
        {
          type: "value",
          name: "Revenue",
          nameTextStyle: { color: isDark ? "#A0A5AB" : "#5C5E62", fontSize: 11 },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: {
            color: isDark ? "#A0A5AB" : "#5C5E62",
            fontSize: 11,
            formatter: (v: number) => formatCurrency(v, true, chartsConfig.currencySymbol)
          }
        }
      ],
      series: [
        {
          name: "Deal count",
          type: "bar",
          yAxisIndex: 0,
          barMaxWidth: 16,
          itemStyle: {
            borderRadius: [chartsConfig.barRadius, chartsConfig.barRadius, 0, 0],
            color: chartsConfig.palette[0]
          },
          data: counts
        },
        {
          name: "Revenue",
          type: "line",
          yAxisIndex: 1,
          smooth: chartsConfig.smoothLines,
          symbolSize: 6,
          itemStyle: { color: chartsConfig.palette[2] },
          lineStyle: { width: 2.5 },
          data: revenues
        }
      ]
    };
  }, [currentDataset.deals, isDark, chartsConfig]);

  const categoryRevenue = useMemo(() => {
    const catMap: Record<string, number> = {};
    for (const c of SERVICE_CATEGORIES) {
      catMap[c] = 0;
    }
    for (const d of currentDataset.deals) {
      if (catMap[d.category] !== undefined) {
        catMap[d.category] += d.value;
      }
    }
    const total = currentMetrics.revenueBooked || 1;
    return Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .map(([category, revenue], idx) => ({
        category,
        revenue,
        percent: Math.round((revenue / total) * 100),
        color: chartsConfig.palette[idx % chartsConfig.palette.length]
      }));
  }, [currentDataset.deals, currentMetrics.revenueBooked, chartsConfig.palette]);

  const priorityBreakdown = useMemo(() => {
    let high = 0;
    let med = 0;
    let low = 0;
    let highVal = 0;
    let medVal = 0;
    let lowVal = 0;

    for (const d of currentDataset.deals) {
      if (d.priority === "High") {
        high++;
        highVal += d.value;
      } else if (d.priority === "Medium") {
        med++;
        medVal += d.value;
      } else {
        low++;
        lowVal += d.value;
      }
    }

    const totalDeals = currentDataset.deals.length || 1;
    return [
      {
        priority: "High",
        count: high,
        value: highVal,
        percent: Math.round((high / totalDeals) * 100),
        color: chartsConfig.palette[3]
      },
      {
        priority: "Medium",
        count: med,
        value: medVal,
        percent: Math.round((med / totalDeals) * 100),
        color: chartsConfig.palette[2]
      },
      {
        priority: "Low",
        count: low,
        value: lowVal,
        percent: Math.round((low / totalDeals) * 100),
        color: chartsConfig.palette[0]
      }
    ];
  }, [currentDataset.deals, chartsConfig.palette]);

  const stageDistribution = useMemo(() => {
    const stages = ["Documentation", "Filing", "Government review", "Delivery", "Closed"] as const;
    const stageCounts: Record<string, number> = {};
    for (const s of stages) stageCounts[s] = 0;
    for (const d of currentDataset.deals) {
      if (stageCounts[d.stage] !== undefined) stageCounts[d.stage]++;
    }
    const total = currentDataset.deals.length || 1;
    return stages.map((s, idx) => ({
      stage: s,
      count: stageCounts[s],
      percent: Math.round((stageCounts[s] / total) * 100),
      color: chartsConfig.palette[idx % chartsConfig.palette.length]
    }));
  }, [currentDataset.deals, chartsConfig.palette]);

  const dailyRevenueTrendOption: EChartsOption = useMemo(() => {
    const base = getBaseEChartsOption({
      isDark,
      colors: chartsConfig.palette,
      gridLines: chartsConfig.gridLines,
      currencySymbol: chartsConfig.currencySymbol
    });

    const dayBuckets: Record<string, { booked: number; collected: number }> = {};
    const endMs = currentRange.end.getTime();

    const cur = new Date(currentRange.start);
    cur.setHours(0, 0, 0, 0);
    while (cur.getTime() <= endMs) {
      const key = cur.toISOString().slice(0, 10);
      dayBuckets[key] = { booked: 0, collected: 0 };
      cur.setDate(cur.getDate() + 1);
    }

    for (const d of currentDataset.deals) {
      const key = d.createdAt.slice(0, 10);
      if (dayBuckets[key]) dayBuckets[key].booked += d.value;
    }

    for (const p of currentDataset.payments) {
      if (p.paidAt && p.status === "Received") {
        const key = p.paidAt.slice(0, 10);
        if (dayBuckets[key]) dayBuckets[key].collected += p.amount;
      }
    }

    const categories = Object.keys(dayBuckets).map((k) => {
      const parts = k.split("-");
      return `${parts[1]}/${parts[2]}`;
    });

    return {
      ...base,
      tooltip: {
        ...base.tooltip,
        formatter: createTooltipFormatter(true, chartsConfig.currencySymbol)
      },
      legend: {
        show: chartsConfig.legendPosition !== "none",
        top: 0,
        right: 0,
        icon: "circle",
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { color: isDark ? "#A0A5AB" : "#5C5E62", fontSize: 11 }
      },
      xAxis: {
        ...base.xAxis,
        data: categories
      },
      yAxis: {
        ...base.yAxis,
        axisLabel: {
          formatter: (v: number) => formatCurrency(v, true, chartsConfig.currencySymbol)
        }
      },
      series: [
        {
          name: "Booked revenue",
          type: "bar",
          barMaxWidth: 14,
          itemStyle: {
            borderRadius: [chartsConfig.barRadius, chartsConfig.barRadius, 0, 0],
            color: chartsConfig.palette[0]
          },
          data: Object.values(dayBuckets).map((v) => v.booked)
        },
        {
          name: "Cash collected",
          type: "line",
          smooth: chartsConfig.smoothLines,
          symbolSize: 6,
          itemStyle: { color: "#2FBF71" },
          lineStyle: { width: 2.5 },
          data: Object.values(dayBuckets).map((v) => v.collected)
        }
      ]
    };
  }, [currentDataset, currentRange, isDark, chartsConfig]);

  const handleKpiClick = () => {
    const items: DrillDownItem[] = currentDataset.deals.map((d) => ({
      id: d.id,
      type: "deal",
      title: d.service,
      subtitle: `Owner: ${d.owner} · Category: ${d.category}`,
      date: d.createdAt.slice(0, 10),
      amount: d.value,
      status: d.stage,
      statusTone: d.stage === "Closed" ? "positive" : "accent"
    }));
    openDrillDown("All deals", `Showing ${currentDataset.deals.length} deals in period`, items);
  };

  const getStagePercent = (stage: Deal["stage"]): number => {
    switch (stage) {
      case "Documentation":
        return 20;
      case "Filing":
        return 45;
      case "Government review":
        return 70;
      case "Delivery":
        return 90;
      case "Closed":
        return 100;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deals and revenue"
        subtitle="Booked commercial contracts, realization rates and receivable tracking."
        onExportCsv={handleExportCsv}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
        <KpiCard
          label="Deals created"
          value={currentMetrics.dealsCreated}
          formattedValue={formatNumber(currentMetrics.dealsCreated)}
          delta={deltas.dealsCreated}
          sparklineData={[6, 9, 8, 12, 11, 15, currentMetrics.dealsCreated]}
          onClick={handleKpiClick}
        />
        <KpiCard
          label="Revenue booked"
          value={currentMetrics.revenueBooked}
          formattedValue={formatCurrency(currentMetrics.revenueBooked, true, chartsConfig.currencySymbol)}
          delta={deltas.revenueBooked}
          sparklineData={[30, 42, 38, 55, 62, 75, 88]}
          onClick={handleKpiClick}
        />
        <KpiCard
          label="Collected against deals"
          value={currentMetrics.totalCollectedForDeals}
          formattedValue={formatCurrency(currentMetrics.totalCollectedForDeals, true, chartsConfig.currencySymbol)}
          delta={deltas.cashReceived}
          sparklineData={[20, 28, 30, 42, 48, 58, 68]}
          onClick={handleKpiClick}
        />
        <KpiCard
          label="Outstanding revenue"
          value={currentMetrics.totalOutstandingForDeals}
          formattedValue={formatCurrency(currentMetrics.totalOutstandingForDeals, true, chartsConfig.currencySymbol)}
          delta={deltas.outstandingRevenue}
          sparklineData={[10, 14, 8, 13, 14, 17, 20]}
          onClick={handleKpiClick}
        />
        <KpiCard
          label="Collection rate"
          value={Math.round(currentMetrics.collectionRateForDeals)}
          formattedValue={`${currentMetrics.collectionRateForDeals.toFixed(1)}%`}
          delta={deltas.quoteToDealRate}
          sparklineData={[65, 70, 68, 74, 76, 80, Math.round(currentMetrics.collectionRateForDeals)]}
          onClick={handleKpiClick}
        />
        <KpiCard
          label="Average deal value"
          value={currentMetrics.averageDealValue}
          formattedValue={formatCurrency(currentMetrics.averageDealValue, true, chartsConfig.currencySymbol)}
          delta={deltas.averageDealValue}
          sparklineData={[21000, 22500, 24000, 23500, 25000, 26000, currentMetrics.averageDealValue]}
          onClick={handleKpiClick}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard
          title="Deals and revenue by service"
          subtitle="Contract count columns with line for aggregate revenue"
          className="lg:col-span-2"
        >
          <BaseChart
            option={dealsRevenueByServiceOption}
            height={280}
            ariaLabel="Deals and revenue dual axis chart"
          />
        </ChartCard>

        <ChartCard
          title="Revenue by category"
          subtitle="Realized contract value by regulatory practice"
          className="lg:col-span-1"
        >
          <div className="space-y-1">
            {categoryRevenue.map((cat) => (
              <ProgressRow
                key={cat.category}
                label={cat.category}
                value={formatCurrency(cat.revenue, true, chartsConfig.currencySymbol)}
                secondaryValue={`${cat.percent}%`}
                percent={cat.percent}
                dotColor={cat.color}
                onClick={() => {
                  const deals = currentDataset.deals.filter((d) => d.category === cat.category);
                  const items: DrillDownItem[] = deals.map((d) => ({
                    id: d.id,
                    type: "deal",
                    title: d.service,
                    subtitle: `Owner: ${d.owner} · Stage: ${d.stage}`,
                    date: d.createdAt.slice(0, 10),
                    amount: d.value,
                    status: d.stage
                  }));
                  openDrillDown(cat.category, `Deals under ${cat.category}`, items);
                }}
              />
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Daily revenue trend"
          subtitle="Booked deal contracts compared with cash collected"
        >
          <BaseChart
            option={dailyRevenueTrendOption}
            height={280}
            ariaLabel="Daily revenue trend chart"
          />
        </ChartCard>

        <ChartCard
          title="Priority breakdown"
          subtitle="Deal distribution across commercial contract tiers"
        >
          <div className="space-y-5 py-2">
            <div>
              <div className="flex h-3 w-full rounded-full overflow-hidden bg-hairline mb-2">
                {priorityBreakdown.map((p) => (
                  <div
                    key={p.priority}
                    style={{ width: `${p.percent}%`, backgroundColor: p.color }}
                    className="h-full first:rounded-l-full last:rounded-r-full transition-all"
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-text-tertiary">
                {priorityBreakdown.map((p) => (
                  <span key={p.priority} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-text-secondary">{p.priority}: {p.percent}%</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="divide-y divide-hairline">
              {priorityBreakdown.map((p) => (
                <div
                  key={p.priority}
                  onClick={() => {
                    const deals = currentDataset.deals.filter((d) => d.priority === p.priority);
                    const items: DrillDownItem[] = deals.map((d) => ({
                      id: d.id,
                      type: "deal",
                      title: d.service,
                      subtitle: `Owner: ${d.owner} · Stage: ${d.stage}`,
                      date: d.createdAt.slice(0, 10),
                      amount: d.value,
                      status: d.stage
                    }));
                    openDrillDown(`${p.priority} Priority Deals`, `All ${p.priority} priority deals`, items);
                  }}
                  className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-canvas/50 px-2 rounded-tile transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <StatusChip
                      label={p.priority}
                      tone={p.priority === "High" ? "negative" : p.priority === "Medium" ? "warning" : "accent"}
                    />
                    <span className="text-xs text-text-secondary">{p.count} deals</span>
                  </div>
                  <div className="text-sm font-medium text-text-primary tabular">
                    {formatCurrency(p.value, false, chartsConfig.currencySymbol)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="bg-card rounded-card shadow-card p-6">
        <h3 className="text-sm font-medium text-text-primary mb-1">
          Total booked vs collected vs outstanding
        </h3>
        <p className="text-xs text-text-secondary mb-5">
          Realization status for contracts booked in this period
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-tile bg-canvas/60">
            <span className="text-xs text-text-secondary block mb-1">Total contract value</span>
            <span className="text-2xl font-display font-medium text-text-primary tabular">
              {formatCurrency(currentMetrics.revenueBooked, false, chartsConfig.currencySymbol)}
            </span>
          </div>
          <div className="p-4 rounded-tile bg-canvas/60">
            <span className="text-xs text-text-secondary block mb-1">Collected against period deals</span>
            <span className="text-2xl font-display font-medium text-positive tabular">
              {formatCurrency(currentMetrics.totalCollectedForDeals, false, chartsConfig.currencySymbol)}
            </span>
          </div>
          <div className="p-4 rounded-tile bg-canvas/60">
            <span className="text-xs text-text-secondary block mb-1">Outstanding receivables</span>
            <span className="text-2xl font-display font-medium text-warning tabular">
              {formatCurrency(currentMetrics.totalOutstandingForDeals, false, chartsConfig.currencySymbol)}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-text-secondary">
            <span>Realization progress</span>
            <span className="tabular font-medium text-text-primary">
              {currentMetrics.collectionRateForDeals.toFixed(1)}% realized
            </span>
          </div>
          <div className="h-3 w-full bg-hairline rounded-full overflow-hidden flex">
            <div
              className="bg-positive h-full transition-all"
              style={{ width: `${Math.min(currentMetrics.collectionRateForDeals, 100)}%` }}
            />
            <div
              className="bg-warning/70 h-full transition-all"
              style={{ width: `${Math.max(0, 100 - currentMetrics.collectionRateForDeals)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-card shadow-card p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-hairline">
          <div>
            <h3 className="text-sm font-medium text-text-primary">
              Deal progress tracking
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Fulfillment lifecycle stages across {currentDataset.deals.length} deals
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            {stageDistribution.map((st) => (
              <span
                key={st.stage}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-canvas border border-hairline text-text-secondary tabular"
              >
                {st.stage}: {st.count}
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-hairline text-text-secondary select-none">
                <th className="py-3 px-3 font-medium">Deal ID</th>
                <th className="py-3 px-3 font-medium">Service & Category</th>
                <th className="py-3 px-3 font-medium">Owner</th>
                <th className="py-3 px-3 font-medium text-right">Value</th>
                <th className="py-3 px-3 font-medium">Priority</th>
                <th className="py-3 px-3 font-medium">Fulfillment progress</th>
                <th className="py-3 px-3 font-medium">Stage</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {currentDataset.deals.slice(0, 15).map((d) => {
                const pct = getStagePercent(d.stage);
                return (
                  <tr
                    key={d.id}
                    onClick={() => navigate(`/app/deals/${d.id}`)}
                    className="hover:bg-canvas/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-mono font-medium text-text-tertiary">{d.id}</td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-text-primary">{d.service}</div>
                      <div className="text-[11px] text-text-secondary truncate">{d.category}</div>
                    </td>
                    <td className="py-3 px-3 text-text-secondary">{d.owner}</td>
                    <td className="py-3 px-3 text-right tabular font-medium text-text-primary">
                      {formatCurrency(d.value, false, chartsConfig.currencySymbol)}
                    </td>
                    <td className="py-3 px-3">
                      <StatusChip
                        label={d.priority}
                        tone={d.priority === "High" ? "negative" : d.priority === "Medium" ? "warning" : "neutral"}
                      />
                    </td>
                    <td className="py-3 px-3 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-hairline rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] tabular text-text-tertiary w-7 text-right">
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <StatusChip
                        label={d.stage}
                        tone={d.stage === "Closed" ? "positive" : "accent"}
                      />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/deals/${d.id}`);
                        }}
                        className="p-1 rounded-full text-text-tertiary group-hover:text-accent hover:bg-canvas transition-colors"
                        aria-label={`View deal ${d.id}`}
                      >
                        <ArrowRight size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
