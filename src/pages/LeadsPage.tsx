import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlass, Funnel, ArrowsDownUp, ArrowRight } from "@phosphor-icons/react";
import { useFilterContext } from "@/context/FilterContext";
import { useSettingsStore } from "@/store/settingsStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { ChartCard } from "@/components/common/ChartCard";
import { StatusChip, StatusTone } from "@/components/common/StatusChip";
import { BaseChart } from "@/components/charts/BaseChart";
import { createTooltipFormatter, getBaseEChartsOption } from "@/components/charts/chartTheme";
import { formatNumber } from "@/utils/formatters";
import { Lead } from "@/domain/types";
import { EChartsOption } from "@/components/charts/echartsConfig";
import { DrillDownItem } from "@/components/common/DrillDownDrawer";

export const LeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentDataset, currentMetrics, deltas, currentRange, openDrillDown } = useFilterContext();
  const isDark = useSettingsStore((s) => s.themeMode === "dark");
  const chartsConfig = useSettingsStore((s) => s.charts);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Lead>("createdAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageIndex, setPageIndex] = useState<number>(0);

  const handleExportCsv = () => {
    const headers = ["Lead ID", "Contact Name", "Company", "City", "Source", "Owner", "Status", "Created At"];
    const rows = currentDataset.leads.map((l) => [
      l.id,
      `"${l.contactName}"`,
      `"${l.company}"`,
      `"${l.city}"`,
      `"${l.source}"`,
      `"${l.owner}"`,
      l.status,
      l.createdAt
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `meridian_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusTrendOption: EChartsOption = useMemo(() => {
    const base = getBaseEChartsOption({
      isDark,
      colors: chartsConfig.palette,
      gridLines: chartsConfig.gridLines,
      currencySymbol: chartsConfig.currencySymbol
    });

    const dayBuckets: Record<string, { New: number; Contacted: number; Qualified: number; Converted: number; Unqualified: number }> = {};
    const endMs = currentRange.end.getTime();

    const cur = new Date(currentRange.start);
    cur.setHours(0, 0, 0, 0);
    while (cur.getTime() <= endMs) {
      const key = cur.toISOString().slice(0, 10);
      dayBuckets[key] = { New: 0, Contacted: 0, Qualified: 0, Converted: 0, Unqualified: 0 };
      cur.setDate(cur.getDate() + 1);
    }

    for (const l of currentDataset.leads) {
      const key = l.createdAt.slice(0, 10);
      if (dayBuckets[key]) {
        dayBuckets[key][l.status]++;
      }
    }

    const categories = Object.keys(dayBuckets).map((k) => {
      const parts = k.split("-");
      return `${parts[1]}/${parts[2]}`;
    });

    const statuses = ["New", "Contacted", "Qualified", "Converted", "Unqualified"] as const;
    const statusColors = [
      chartsConfig.palette[0],
      chartsConfig.palette[6],
      chartsConfig.palette[1],
      "#2FBF71",
      "#E5484D"
    ];

    const series = statuses.map((st, idx) => ({
      name: st,
      type: "bar" as const,
      stack: "total",
      barMaxWidth: 16,
      itemStyle: { color: statusColors[idx] },
      data: Object.values(dayBuckets).map((v) => v[st])
    }));

    return {
      ...base,
      tooltip: {
        ...base.tooltip,
        formatter: createTooltipFormatter(false, chartsConfig.currencySymbol)
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
        ...base.yAxis
      },
      series
    };
  }, [currentDataset.leads, currentRange, isDark, chartsConfig]);

  const sourceTrendOption: EChartsOption = useMemo(() => {
    const base = getBaseEChartsOption({
      isDark,
      colors: chartsConfig.palette,
      gridLines: chartsConfig.gridLines,
      currencySymbol: chartsConfig.currencySymbol
    });

    const sources = ["Google Ads", "Website", "Just Dial", "Referral", "Social media", "Other"];
    const dayBuckets: Record<string, Record<string, number>> = {};
    const endMs = currentRange.end.getTime();

    const cur = new Date(currentRange.start);
    cur.setHours(0, 0, 0, 0);
    while (cur.getTime() <= endMs) {
      const key = cur.toISOString().slice(0, 10);
      dayBuckets[key] = {
        "Google Ads": 0,
        Website: 0,
        "Just Dial": 0,
        Referral: 0,
        "Social media": 0,
        Other: 0
      };
      cur.setDate(cur.getDate() + 1);
    }

    for (const l of currentDataset.leads) {
      const key = l.createdAt.slice(0, 10);
      if (dayBuckets[key] && dayBuckets[key][l.source] !== undefined) {
        dayBuckets[key][l.source]++;
      }
    }

    const categories = Object.keys(dayBuckets).map((k) => {
      const parts = k.split("-");
      return `${parts[1]}/${parts[2]}`;
    });

    const series = sources.map((s, idx) => ({
      name: s,
      type: "line" as const,
      smooth: chartsConfig.smoothLines,
      symbolSize: 4,
      itemStyle: { color: chartsConfig.palette[idx % chartsConfig.palette.length] },
      lineStyle: { width: 2 },
      data: Object.values(dayBuckets).map((v) => v[s])
    }));

    return {
      ...base,
      tooltip: {
        ...base.tooltip,
        formatter: createTooltipFormatter(false, chartsConfig.currencySymbol)
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
        ...base.yAxis
      },
      series
    };
  }, [currentDataset.leads, currentRange, isDark, chartsConfig]);

  const sourceDonutOption: EChartsOption = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of currentDataset.leads) {
      counts[l.source] = (counts[l.source] || 0) + 1;
    }

    const data = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], idx) => ({
        name,
        value,
        itemStyle: { color: chartsConfig.palette[idx % chartsConfig.palette.length] }
      }));

    return {
      tooltip: {
        trigger: "item",
        backgroundColor: isDark ? "#181B1F" : "#FFFFFF",
        borderColor: isDark ? "#262A30" : "#EDEDED",
        borderRadius: 12,
        formatter: createTooltipFormatter(false, chartsConfig.currencySymbol)
      },
      series: [
        {
          type: "pie",
          radius: ["55%", "78%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: "center",
            formatter: () => `${formatNumber(currentMetrics.newLeads)}\nLeads`,
            fontSize: 16,
            fontWeight: 500,
            fontFamily: '"Rethink Sans", sans-serif',
            color: isDark ? "#F4F5F6" : "#171A20",
            lineHeight: 22
          },
          labelLine: { show: false },
          data
        }
      ]
    };
  }, [currentDataset.leads, currentMetrics.newLeads, chartsConfig.palette, isDark, chartsConfig.currencySymbol]);

  const filteredLeads = useMemo(() => {
    return currentDataset.leads
      .filter((l) => {
        if (statusFilter !== "all" && l.status !== statusFilter) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          l.contactName.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.source.toLowerCase().includes(q) ||
          l.owner.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === "string" && typeof valB === "string") {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return 0;
      });
  }, [currentDataset.leads, searchQuery, statusFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, pageIndex, pageSize]);

  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getStatusTone = (st: Lead["status"]): StatusTone => {
    if (st === "Converted") return "positive";
    if (st === "Unqualified") return "negative";
    if (st === "Qualified") return "accent";
    if (st === "Contacted") return "warning";
    return "neutral";
  };

  const handleKpiClick = (status?: Lead["status"]) => {
    const targetLeads = status ? currentDataset.leads.filter((l) => l.status === status) : currentDataset.leads;
    const items: DrillDownItem[] = targetLeads.map((l) => ({
      id: l.id,
      type: "lead",
      title: l.contactName,
      subtitle: `${l.company} · ${l.city} · ${l.source}`,
      date: l.createdAt.slice(0, 10),
      status: l.status,
      statusTone: getStatusTone(l.status)
    }));
    openDrillDown(
      status ? `${status} leads` : "All leads",
      `Showing ${targetLeads.length} leads in selected view`,
      items
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        subtitle="Commercial inquiries, qualification rates and channel attribution."
        onExportCsv={handleExportCsv}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <KpiCard
          label="Total leads"
          value={currentMetrics.newLeads}
          formattedValue={formatNumber(currentMetrics.newLeads)}
          delta={deltas.newLeads}
          sparklineData={[15, 18, 16, 24, 28, 30, currentMetrics.newLeads]}
          onClick={() => handleKpiClick()}
        />
        <KpiCard
          label="Qualified leads"
          value={currentMetrics.qualifiedLeads}
          formattedValue={formatNumber(currentMetrics.qualifiedLeads)}
          delta={deltas.quotationsCreated}
          sparklineData={[10, 12, 11, 18, 20, 22, currentMetrics.qualifiedLeads]}
          onClick={() => handleKpiClick("Qualified")}
        />
        <KpiCard
          label="Converted to deals"
          value={currentMetrics.convertedLeads}
          formattedValue={formatNumber(currentMetrics.convertedLeads)}
          delta={deltas.dealsCreated}
          sparklineData={[5, 7, 6, 10, 12, 15, currentMetrics.convertedLeads]}
          onClick={() => handleKpiClick("Converted")}
        />
        <KpiCard
          label="Unqualified enquiries"
          value={currentMetrics.unqualifiedLeads}
          formattedValue={formatNumber(currentMetrics.unqualifiedLeads)}
          delta={deltas.unqualifiedLeads}
          sparklineData={[4, 5, 6, 4, 3, 5, currentMetrics.unqualifiedLeads]}
          onClick={() => handleKpiClick("Unqualified")}
        />
        <KpiCard
          label="Conversion rate"
          value={Math.round(currentMetrics.conversionRate)}
          formattedValue={`${currentMetrics.conversionRate.toFixed(1)}%`}
          delta={deltas.conversionRate}
          sparklineData={[14, 16, 15, 20, 22, 25, Math.round(currentMetrics.conversionRate)]}
          onClick={() => handleKpiClick()}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Lead status trend"
          subtitle="Enquiries segmented by lifecycle progression"
        >
          <BaseChart
            option={statusTrendOption}
            height={280}
            ariaLabel="Lead status trend stacked bar chart"
          />
        </ChartCard>

        <ChartCard
          title="Lead funnel drop-off"
          subtitle="Conversion velocity across each pipeline gate"
        >
          <div className="space-y-3 py-2">
            <div
              onClick={() => handleKpiClick()}
              className="p-3.5 rounded-tile bg-canvas/60 hover:bg-canvas cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-medium text-text-primary">1. Commercial enquiries</span>
                <span className="tabular font-medium text-text-primary">
                  {formatNumber(currentMetrics.newLeads)} (100%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-accent w-full" />
            </div>

            <div
              onClick={() => handleKpiClick("Qualified")}
              className="p-3.5 rounded-tile bg-canvas/60 hover:bg-canvas cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-medium text-text-primary">2. Qualified for proposal</span>
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
              onClick={() => handleKpiClick("Converted")}
              className="p-3.5 rounded-tile bg-canvas/60 hover:bg-canvas cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-medium text-text-primary">3. Contract converted</span>
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
              onClick={() => handleKpiClick("Unqualified")}
              className="p-3.5 rounded-tile bg-negative/5 border border-negative/15 hover:bg-negative/10 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-medium text-negative">Unqualified enquiry branch</span>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard
          title="Source acquisition trend"
          subtitle="Inbound volume by commercial channel over time"
          className="lg:col-span-2"
        >
          <BaseChart
            option={sourceTrendOption}
            height={280}
            ariaLabel="Source acquisition trend line chart"
          />
        </ChartCard>

        <ChartCard
          title="Source share"
          subtitle="Relative contribution by channel"
          className="lg:col-span-1"
        >
          <div className="h-64 flex items-center justify-center">
            <BaseChart
              option={sourceDonutOption}
              height={240}
              ariaLabel="Lead source share donut chart"
            />
          </div>
        </ChartCard>
      </div>

      <div className="bg-card rounded-card shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-hairline">
          <div>
            <h3 className="text-sm font-medium text-text-primary">
              All commercial leads
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Showing {filteredLeads.length} leads in active period
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <MagnifyingGlass
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPageIndex(0);
                }}
                placeholder="Search leads..."
                className="pl-8 pr-3 py-1.5 rounded-full bg-canvas border border-hairline text-xs font-medium text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent w-48 sm:w-60"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Funnel size={14} className="text-text-tertiary" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPageIndex(0);
                }}
                className="px-2.5 py-1.5 rounded-full bg-canvas border border-hairline text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="all">All statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
                <option value="Unqualified">Unqualified</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-hairline text-text-secondary select-none">
                <th
                  onClick={() => handleSort("id")}
                  className="py-3 px-3 font-medium cursor-pointer hover:text-text-primary"
                >
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    <ArrowsDownUp size={11} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("contactName")}
                  className="py-3 px-3 font-medium cursor-pointer hover:text-text-primary"
                >
                  <div className="flex items-center gap-1">
                    <span>Contact & Company</span>
                    <ArrowsDownUp size={11} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("city")}
                  className="py-3 px-3 font-medium cursor-pointer hover:text-text-primary"
                >
                  <div className="flex items-center gap-1">
                    <span>City</span>
                    <ArrowsDownUp size={11} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("source")}
                  className="py-3 px-3 font-medium cursor-pointer hover:text-text-primary"
                >
                  <div className="flex items-center gap-1">
                    <span>Source</span>
                    <ArrowsDownUp size={11} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("owner")}
                  className="py-3 px-3 font-medium cursor-pointer hover:text-text-primary"
                >
                  <div className="flex items-center gap-1">
                    <span>Owner</span>
                    <ArrowsDownUp size={11} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("status")}
                  className="py-3 px-3 font-medium cursor-pointer hover:text-text-primary"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowsDownUp size={11} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("createdAt")}
                  className="py-3 px-3 font-medium cursor-pointer hover:text-text-primary text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Date</span>
                    <ArrowsDownUp size={11} />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-text-secondary">
                    No leads match the specified criteria.
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => navigate(`/app/leads/${l.id}`)}
                    className="hover:bg-canvas/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-mono font-medium text-text-tertiary">
                      {l.id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-text-primary">{l.contactName}</div>
                      <div className="text-[11px] text-text-secondary truncate">{l.company}</div>
                    </td>
                    <td className="py-3 px-3 text-text-secondary">{l.city}</td>
                    <td className="py-3 px-3 text-text-secondary">{l.source}</td>
                    <td className="py-3 px-3 text-text-secondary">{l.owner}</td>
                    <td className="py-3 px-3">
                      <StatusChip label={l.status} tone={getStatusTone(l.status)} />
                    </td>
                    <td className="py-3 px-3 text-right tabular text-text-secondary">
                      {l.createdAt.slice(0, 10)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/leads/${l.id}`);
                        }}
                        className="p-1 rounded-full text-text-tertiary group-hover:text-accent hover:bg-canvas transition-colors"
                        aria-label={`View lead ${l.id}`}
                      >
                        <ArrowRight size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-4 border-t border-hairline text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageIndex(0);
              }}
              className="px-2 py-1 rounded bg-canvas border border-hairline text-xs font-medium text-text-primary"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>per page</span>
          </div>

          <div className="flex items-center gap-2">
            <span>
              Page {pageIndex + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={pageIndex === 0}
                onClick={() => setPageIndex(pageIndex - 1)}
                className="px-2.5 py-1 rounded-full border border-hairline disabled:opacity-40 hover:bg-canvas transition-colors font-medium"
              >
                Previous
              </button>
              <button
                disabled={pageIndex >= totalPages - 1}
                onClick={() => setPageIndex(pageIndex + 1)}
                className="px-2.5 py-1 rounded-full border border-hairline disabled:opacity-40 hover:bg-canvas transition-colors font-medium"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
