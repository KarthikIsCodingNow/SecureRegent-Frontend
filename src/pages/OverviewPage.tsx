import React, { useMemo } from "react";
import { useFilterContext } from "@/context/FilterContext";
import { useSettingsStore } from "@/store/settingsStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { ChartCard } from "@/components/common/ChartCard";
import { ProgressRow } from "@/components/common/ProgressRow";
import { LeaderboardRow } from "@/components/common/LeaderboardRow";
import { BaseChart } from "@/components/charts/BaseChart";
import { createTooltipFormatter, getBaseEChartsOption } from "@/components/charts/chartTheme";
import { formatCurrency, formatNumber, formatRelativeTime } from "@/utils/formatters";
import { SALES_TEAM } from "@/domain/constants";
import { EChartsOption } from "@/components/charts/echartsConfig";
import { DrillDownItem } from "@/components/common/DrillDownDrawer";
import { Lead, Deal, Quotation, Payment } from "@/domain/types";

export const OverviewPage: React.FC = () => {
  const {
    currentDataset,
    currentMetrics,
    deltas,
    currentRange,
    previousMetrics,
    filter,
    openDrillDown
  } = useFilterContext();

  const isDark = useSettingsStore((s) => s.themeMode === "dark");
  const chartsConfig = useSettingsStore((s) => s.charts);

  const handleExportCsv = () => {
    const headers = ["Lead ID", "Contact Name", "Company", "City", "Source", "Owner", "Status", "Created At"];
    const rows = currentDataset.leads.map((l: Lead) => [
      l.id,
      `"${l.contactName}"`,
      `"${l.company}"`,
      `"${l.city}"`,
      `"${l.source}"`,
      `"${l.owner}"`,
      l.status,
      l.createdAt
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e: string[]) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `secureregent_overview_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const revenueTrendOption: EChartsOption = useMemo(() => {
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
      if (dayBuckets[key]) {
        dayBuckets[key].booked += d.value;
      }
    }

    for (const p of currentDataset.payments) {
      if (p.paidAt && p.status === "Received") {
        const key = p.paidAt.slice(0, 10);
        if (dayBuckets[key]) {
          dayBuckets[key].collected += p.amount;
        }
      }
    }

    const categories = Object.keys(dayBuckets).map((k) => {
      const parts = k.split("-");
      return `${parts[1]}/${parts[2]}`;
    });
    const bookedData = Object.values(dayBuckets).map((v) => v.booked);
    const collectedData = Object.values(dayBuckets).map((v) => v.collected);

    const series: NonNullable<EChartsOption["series"]> = [
      {
        name: "Revenue booked",
        type: "bar",
        barMaxWidth: 16,
        itemStyle: {
          borderRadius: [chartsConfig.barRadius, chartsConfig.barRadius, 0, 0],
          color: chartsConfig.palette[0]
        },
        data: bookedData
      },
      {
        name: "Cash received",
        type: "line",
        smooth: chartsConfig.smoothLines,
        symbolSize: 6,
        itemStyle: { color: chartsConfig.palette[1] },
        lineStyle: { width: 2.5 },
        data: collectedData
      }
    ];

    if (filter.compare && Array.isArray(series)) {
      const prevBookedDaily = Math.round(previousMetrics.revenueBooked / Math.max(1, categories.length));
      series.push({
        name: "Previous period booked",
        type: "line",
        smooth: chartsConfig.smoothLines,
        symbolSize: 0,
        itemStyle: { color: isDark ? "#A0A5AB" : "#8E9196" },
        lineStyle: {
          color: isDark ? "#A0A5AB" : "#8E9196",
          width: 1.5,
          type: "dashed",
          opacity: 0.45
        },
        data: categories.map(() => prevBookedDaily)
      });
    }

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
          ...base.yAxis.axisLabel,
          formatter: (v: number) => formatCurrency(v, true, chartsConfig.currencySymbol)
        }
      },
      series
    };
  }, [currentDataset, currentRange, isDark, chartsConfig, filter.compare, previousMetrics]);

  const targetRingOption: EChartsOption = useMemo(() => {
    const rate = Math.min(Math.round(currentMetrics.targetAchievementRate), 100);
    const accentColor = chartsConfig.palette[0];
    const trackColor = isDark ? "#262A30" : "#E8EEFC";

    return {
      series: [
        {
          type: "gauge",
          startAngle: 90,
          endAngle: -270,
          radius: "85%",
          pointer: { show: false },
          progress: {
            show: true,
            overlap: false,
            roundCap: true,
            clip: false,
            itemStyle: { color: accentColor }
          },
          axisLine: {
            lineStyle: { width: 14, color: [[1, trackColor]] }
          },
          splitLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          data: [{ value: rate, name: "Achieved" }],
          title: { show: false },
          detail: {
            valueAnimation: true,
            offsetCenter: [0, 0],
            fontSize: 28,
            fontWeight: 500,
            fontFamily: '"Rethink Sans", sans-serif',
            color: isDark ? "#F4F5F6" : "#171A20",
            formatter: "{value}%"
          }
        }
      ]
    };
  }, [currentMetrics.targetAchievementRate, chartsConfig.palette, isDark]);

  const leadSourcesData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of currentDataset.leads) {
      counts[l.source] = (counts[l.source] || 0) + 1;
    }
    const total = currentDataset.leads.length || 1;
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.map(([source, count], idx) => ({
      source,
      count,
      percent: Math.round((count / total) * 100),
      color: chartsConfig.palette[idx % chartsConfig.palette.length]
    }));
  }, [currentDataset.leads, chartsConfig.palette]);

  const salesLeaderboard = useMemo(() => {
    const userRevenue: Record<string, { revenue: number; deals: number; leads: number }> = {};
    for (const u of SALES_TEAM) {
      userRevenue[u] = { revenue: 0, deals: 0, leads: 0 };
    }
    for (const l of currentDataset.leads) {
      if (userRevenue[l.owner]) userRevenue[l.owner].leads++;
    }
    for (const d of currentDataset.deals) {
      if (userRevenue[d.owner]) {
        userRevenue[d.owner].revenue += d.value;
        userRevenue[d.owner].deals++;
      }
    }
    return Object.entries(userRevenue)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .map(([name, data], idx) => ({
        rank: idx + 1,
        name,
        subtitle: `${data.deals} deals closed · ${data.leads} leads`,
        revenue: formatCurrency(data.revenue, true, chartsConfig.currencySymbol),
        conversion: data.leads > 0 ? `${Math.round((data.deals / data.leads) * 100)}% conv.` : "0% conv."
      }));
  }, [currentDataset, chartsConfig.currencySymbol]);

  const handleKpiClick = (type: string) => {
    if (type === "leads") {
      const items: DrillDownItem[] = currentDataset.leads.map((l: Lead) => ({
        id: l.id,
        type: "lead",
        title: l.contactName,
        subtitle: `${l.company} · ${l.city} · ${l.source}`,
        date: l.createdAt.slice(0, 10),
        status: l.status,
        statusTone: l.status === "Converted" ? "positive" : l.status === "Unqualified" ? "negative" : "neutral"
      }));
      openDrillDown("New leads", "All captured leads within this period", items);
    } else if (type === "conversions" || type === "conversion") {
      const convertedLeads = currentDataset.leads.filter((l: Lead) => l.status === "Converted");
      const items: DrillDownItem[] = convertedLeads.map((l: Lead) => {
        const deal = currentDataset.deals.find((d: Deal) => d.leadId === l.id);
        return {
          id: l.id,
          type: "lead",
          title: l.contactName,
          subtitle: `${l.company} · ${l.city} · Converted to deal`,
          date: l.createdAt.slice(0, 10),
          amount: deal?.value,
          status: "Converted",
          statusTone: "positive"
        };
      });
      openDrillDown(
        "Converted leads & conversions",
        `${currentMetrics.conversionRate.toFixed(1)}% conversion rate · ${convertedLeads.length} leads converted`,
        items
      );
    } else if (type === "deals") {
      const items: DrillDownItem[] = currentDataset.deals.map((d: Deal) => ({
        id: d.id,
        type: "deal",
        title: `${d.service} (${d.category})`,
        subtitle: `Owner: ${d.owner} · Stage: ${d.stage} · Priority: ${d.priority}`,
        date: d.createdAt.slice(0, 10),
        amount: d.value,
        status: d.stage,
        statusTone: d.stage === "Closed" ? "positive" : "accent"
      }));
      openDrillDown("Deals created", "Commercial contracts booked within this period", items);
    } else if (type === "quotations") {
      const items: DrillDownItem[] = currentDataset.quotations.map((q: Quotation) => ({
        id: q.id,
        type: "quotation",
        title: q.service,
        subtitle: `Owner: ${q.owner} · Lead ID: ${q.leadId}`,
        date: q.createdAt.slice(0, 10),
        amount: q.amount,
        status: q.status,
        statusTone: q.status === "Accepted" ? "positive" : q.status === "Rejected" ? "negative" : "warning"
      }));
      openDrillDown("Quotations created", "Service proposals issued within this period", items);
    } else if (type === "cash") {
      const items: DrillDownItem[] = currentDataset.payments
        .filter((p: Payment) => p.status === "Received")
        .map((p: Payment) => ({
          id: p.id,
          type: "deal",
          title: `Payment: ${p.invoiceNo}`,
          subtitle: `Method: ${p.method} · Deal ID: ${p.dealId}`,
          date: p.paidAt ? p.paidAt.slice(0, 10) : p.dueAt.slice(0, 10),
          amount: p.amount,
          status: p.status,
          statusTone: "positive"
        }));
      openDrillDown("Cash received", "Realized receipts credited within this period", items);
    }
  };

  const handleSourceClick = (source: string) => {
    const items: DrillDownItem[] = currentDataset.leads
      .filter((l: Lead) => l.source === source)
      .map((l: Lead) => ({
        id: l.id,
        type: "lead",
        title: l.contactName,
        subtitle: `${l.company} · ${l.city}`,
        date: l.createdAt.slice(0, 10),
        status: l.status,
        statusTone: l.status === "Converted" ? "positive" : l.status === "Unqualified" ? "negative" : "neutral"
      }));
    openDrillDown(`Source: ${source}`, `All leads attributed to ${source}`, items);
  };

  const handleChartClick = (params: { name: string; seriesName?: string }) => {
    const clickedDate = params.name;
    const items: DrillDownItem[] = currentDataset.deals
      .filter((d: Deal) => d.createdAt.includes(clickedDate) || d.createdAt.slice(5, 10) === clickedDate)
      .map((d: Deal) => ({
        id: d.id,
        type: "deal",
        title: d.service,
        subtitle: `Owner: ${d.owner} · Stage: ${d.stage}`,
        date: d.createdAt.slice(0, 10),
        amount: d.value,
        status: d.stage,
        statusTone: d.stage === "Closed" ? "positive" : "accent"
      }));
    openDrillDown(`Deals on ${clickedDate}`, `Contracts booked on ${clickedDate}`, items);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        subtitle="Business performance, revenue trends and operational velocity."
        onExportCsv={handleExportCsv}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <KpiCard
          label="New leads"
          value={currentMetrics.newLeads}
          formattedValue={formatNumber(currentMetrics.newLeads)}
          delta={deltas.newLeads}
          sparklineData={[12, 14, 18, 15, 20, 24, currentMetrics.newLeads]}
          onClick={() => handleKpiClick("leads")}
        />
        <KpiCard
          label="Conversion rate"
          value={Math.round(currentMetrics.conversionRate)}
          formattedValue={`${currentMetrics.conversionRate.toFixed(1)}%`}
          delta={deltas.conversionRate}
          sparklineData={[15, 18, 16, 22, 20, 24, Math.round(currentMetrics.conversionRate)]}
          onClick={() => handleKpiClick("conversions")}
        />
        <KpiCard
          label="Quotations created"
          value={currentMetrics.quotationsCreated}
          formattedValue={formatNumber(currentMetrics.quotationsCreated)}
          delta={deltas.quotationsCreated}
          sparklineData={[10, 15, 12, 18, 17, 21, currentMetrics.quotationsCreated]}
          onClick={() => handleKpiClick("quotations")}
        />
        <KpiCard
          label="Deals created"
          value={currentMetrics.dealsCreated}
          formattedValue={formatNumber(currentMetrics.dealsCreated)}
          delta={deltas.dealsCreated}
          sparklineData={[5, 8, 7, 12, 11, 14, currentMetrics.dealsCreated]}
          onClick={() => handleKpiClick("deals")}
        />
        <KpiCard
          label="Revenue booked"
          value={currentMetrics.revenueBooked}
          formattedValue={formatCurrency(currentMetrics.revenueBooked, true, chartsConfig.currencySymbol)}
          delta={deltas.revenueBooked}
          sparklineData={[30, 42, 38, 55, 60, 72, 85]}
          onClick={() => handleKpiClick("deals")}
        />
        <KpiCard
          label="Cash received"
          value={currentMetrics.cashReceivedInPeriod}
          formattedValue={formatCurrency(currentMetrics.cashReceivedInPeriod, true, chartsConfig.currencySymbol)}
          delta={deltas.cashReceived}
          sparklineData={[25, 35, 32, 48, 50, 65, 78]}
          onClick={() => handleKpiClick("cash")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard
          title="Target achievement"
          subtitle={`Scaled monthly target: ${formatCurrency(currentMetrics.scaledTarget, true, chartsConfig.currencySymbol)}`}
          className="lg:col-span-1"
        >
          <div className="flex flex-col items-center justify-center py-2">
            <div className="w-48 h-48">
              <BaseChart
                option={targetRingOption}
                height={192}
                ariaLabel="Target achievement gauge"
                tableSummary={{
                  headers: ["Metric", "Amount"],
                  rows: [
                    ["Achieved", formatCurrency(currentMetrics.revenueBooked, false, chartsConfig.currencySymbol)],
                    ["Remaining", formatCurrency(currentMetrics.targetRemaining, false, chartsConfig.currencySymbol)],
                    ["Target", formatCurrency(currentMetrics.scaledTarget, false, chartsConfig.currencySymbol)]
                  ]
                }}
              />
            </div>
            <div className="w-full mt-4 pt-4 border-t border-hairline flex items-center justify-between text-xs text-text-secondary">
              <div>
                <span className="block text-text-tertiary">Achieved</span>
                <span className="text-sm font-medium text-text-primary tabular">
                  {formatCurrency(currentMetrics.revenueBooked, true, chartsConfig.currencySymbol)}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-text-tertiary">Remaining</span>
                <span className="text-sm font-medium text-text-secondary tabular">
                  {formatCurrency(currentMetrics.targetRemaining, true, chartsConfig.currencySymbol)}
                </span>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Revenue trend"
          subtitle="Booked deal contracts vs realized cash collections"
          className="lg:col-span-2"
        >
          <BaseChart
            option={revenueTrendOption}
            height={280}
            ariaLabel="Revenue trend chart"
            onChartClick={handleChartClick}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard
          title="Lead funnel"
          subtitle="Inquiry qualification and conversion drop-off"
          className="lg:col-span-1"
        >
          <div className="space-y-3 py-1">
            <div
              onClick={() => handleKpiClick("leads")}
              className="p-3 rounded-tile bg-canvas/60 hover:bg-canvas cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-text-primary">1. New enquiries</span>
                <span className="tabular font-medium text-text-primary">{formatNumber(currentMetrics.newLeads)}</span>
              </div>
              <div className="h-2 rounded-full bg-accent w-full" />
            </div>

            <div
              onClick={() => handleKpiClick("leads")}
              className="p-3 rounded-tile bg-canvas/60 hover:bg-canvas cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-text-primary">2. Qualified leads</span>
                <span className="tabular font-medium text-text-primary">
                  {formatNumber(currentMetrics.qualifiedLeads)} ({currentMetrics.qualifiedRate.toFixed(1)}%)
                </span>
              </div>
              <div
                className="h-2 rounded-full bg-accent/80 transition-all"
                style={{ width: `${Math.min(currentMetrics.qualifiedRate, 100)}%` }}
              />
            </div>

            <div
              onClick={() => handleKpiClick("leads")}
              className="p-3 rounded-tile bg-canvas/60 hover:bg-canvas cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-text-primary">3. Converted to deal</span>
                <span className="tabular font-medium text-text-primary">
                  {formatNumber(currentMetrics.convertedLeads)} ({currentMetrics.conversionRate.toFixed(1)}%)
                </span>
              </div>
              <div
                className="h-2 rounded-full bg-positive transition-all"
                style={{ width: `${Math.min(currentMetrics.conversionRate, 100)}%` }}
              />
            </div>

            <div
              onClick={() => handleKpiClick("leads")}
              className="p-3 rounded-tile bg-negative/5 border border-negative/15 hover:bg-negative/10 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-negative">Unqualified branch</span>
                <span className="tabular font-medium text-negative">
                  {formatNumber(currentMetrics.unqualifiedLeads)} ({currentMetrics.unqualifiedRate.toFixed(1)}%)
                </span>
              </div>
              <div
                className="h-2 rounded-full bg-negative/60 transition-all"
                style={{ width: `${Math.min(currentMetrics.unqualifiedRate, 100)}%` }}
              />
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Lead sources"
          subtitle="Enquiry volume and percentage share by channel"
          className="lg:col-span-2"
        >
          <div className="space-y-1">
            {leadSourcesData.map((s) => (
              <ProgressRow
                key={s.source}
                label={s.source}
                value={formatNumber(s.count)}
                secondaryValue={`${s.percent}%`}
                percent={s.percent}
                dotColor={s.color}
                onClick={() => handleSourceClick(s.source)}
              />
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Sales leaderboard"
          subtitle="Commercial performance and deal realization by representative"
        >
          <div className="divide-y divide-hairline">
            {salesLeaderboard.map((item) => (
              <LeaderboardRow
                key={item.name}
                rank={item.rank}
                name={item.name}
                subtitle={item.subtitle}
                metric={item.revenue}
                secondaryMetric={item.conversion}
                onClick={() => {
                  const userDeals = currentDataset.deals.filter((d: Deal) => d.owner === item.name);
                  const items: DrillDownItem[] = userDeals.map((d: Deal) => ({
                    id: d.id,
                    type: "deal",
                    title: d.service,
                    subtitle: `Stage: ${d.stage} · Priority: ${d.priority}`,
                    date: d.createdAt.slice(0, 10),
                    amount: d.value,
                    status: d.stage,
                    statusTone: d.stage === "Closed" ? "positive" : "accent"
                  }));
                  openDrillDown(`Deals by ${item.name}`, `All commercial deals managed by ${item.name}`, items);
                }}
              />
            ))}
          </div>
        </ChartCard>

        <ChartCard
          title="Recent activity"
          subtitle="Real-time operational audit log"
        >
          <div className="divide-y divide-hairline max-h-[360px] overflow-y-auto pr-1">
            {currentDataset.activities.slice(0, 10).map((act) => (
              <div
                key={act.id}
                className="py-3 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-medium text-text-primary mr-1.5">{act.user}</span>
                  <span className="text-text-secondary">{act.action}</span>
                  <div className="text-[11px] text-text-tertiary mt-0.5">
                    Ref: {act.recordReference.id} ({act.recordReference.label})
                  </div>
                </div>
                <span className="text-[11px] text-text-tertiary shrink-0 tabular">
                  {formatRelativeTime(act.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};
