import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CaretDown, CaretRight, ArrowRight } from "@phosphor-icons/react";
import { useFilterContext } from "@/context/FilterContext";
import { useSettingsStore } from "@/store/settingsStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { ChartCard } from "@/components/common/ChartCard";
import { ProgressRow } from "@/components/common/ProgressRow";
import { StatusChip } from "@/components/common/StatusChip";
import { BaseChart } from "@/components/charts/BaseChart";
import { createTooltipFormatter } from "@/components/charts/chartTheme";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { SERVICES } from "@/domain/constants";
import { Quotation } from "@/domain/types";
import { EChartsOption } from "@/components/charts/echartsConfig";
import { DrillDownItem } from "@/components/common/DrillDownDrawer";

export const QuotationsPage: React.FC = () => {
  const { currentDataset, currentMetrics, deltas, openDrillDown } = useFilterContext();
  const isDark = useSettingsStore((s) => s.themeMode === "dark");
  const chartsConfig = useSettingsStore((s) => s.charts);

  const [expandedLeads, setExpandedLeads] = useState<Record<string, boolean>>({});

  const toggleLead = (leadId: string) => {
    setExpandedLeads((prev) => ({ ...prev, [leadId]: !prev[leadId] }));
  };

  const handleExportCsv = () => {
    const headers = ["Quote ID", "Lead ID", "Service", "Amount", "Status", "Owner", "Created At"];
    const rows = currentDataset.quotations.map((q) => [
      q.id,
      q.leadId,
      `"${q.service}"`,
      q.amount,
      q.status,
      `"${q.owner}"`,
      q.createdAt
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `secureregent_quotations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const serviceStats = useMemo(() => {
    const stats: Record<
      string,
      {
        count: number;
        amount: number;
        accepted: number;
        pending: number;
        rejected: number;
        expired: number;
      }
    > = {};

    for (const s of SERVICES) {
      stats[s.name] = { count: 0, amount: 0, accepted: 0, pending: 0, rejected: 0, expired: 0 };
    }

    for (const q of currentDataset.quotations) {
      if (!stats[q.service]) {
        stats[q.service] = { count: 0, amount: 0, accepted: 0, pending: 0, rejected: 0, expired: 0 };
      }
      stats[q.service].count++;
      stats[q.service].amount += q.amount;
      if (q.status === "Accepted") stats[q.service].accepted++;
      if (q.status === "Pending") stats[q.service].pending++;
      if (q.status === "Rejected") stats[q.service].rejected++;
      if (q.status === "Expired") stats[q.service].expired++;
    }

    return Object.entries(stats)
      .map(([name, data]) => ({
        service: name,
        ...data,
        conversionRate: data.count > 0 ? (data.accepted / data.count) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
  }, [currentDataset.quotations]);

  const quotesByServiceOption: EChartsOption = useMemo(() => {
    const topServices = serviceStats.slice(0, 6).reverse();
    const categories = topServices.map((s) => s.service);
    const counts = topServices.map((s) => s.count);

    return {
      tooltip: {
        trigger: "axis",
        backgroundColor: isDark ? "#181B1F" : "#FFFFFF",
        borderColor: isDark ? "#262A30" : "#EDEDED",
        borderRadius: 12,
        formatter: createTooltipFormatter(false, chartsConfig.currencySymbol)
      },
      grid: {
        left: 16,
        right: 24,
        top: 10,
        bottom: 20,
        containLabel: true
      },
      xAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: chartsConfig.gridLines,
          lineStyle: { color: isDark ? "#262A30" : "#EDEDED" }
        },
        axisLabel: { color: isDark ? "#A0A5AB" : "#5C5E62", fontSize: 11 }
      },
      yAxis: {
        type: "category",
        data: categories,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: isDark ? "#A0A5AB" : "#5C5E62",
          fontSize: 11,
          formatter: (v: string) => (v.length > 20 ? `${v.substring(0, 18)}...` : v)
        }
      },
      series: [
        {
          name: "Quotations",
          type: "bar",
          barMaxWidth: 14,
          itemStyle: {
            borderRadius: [0, chartsConfig.barRadius, chartsConfig.barRadius, 0],
            color: chartsConfig.palette[0]
          },
          data: counts
        }
      ]
    };
  }, [serviceStats, isDark, chartsConfig]);

  const quoteStatusDonutOption: EChartsOption = useMemo(() => {
    const data = [
      { name: "Accepted", value: currentMetrics.quotationsAccepted, itemStyle: { color: "#2FBF71" } },
      { name: "Pending", value: currentMetrics.quotationsPending, itemStyle: { color: "#F5A524" } },
      { name: "Rejected", value: currentMetrics.quotationsRejected, itemStyle: { color: "#E5484D" } },
      { name: "Expired", value: currentMetrics.quotationsExpired, itemStyle: { color: "#6B7785" } }
    ];

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
            formatter: () => `${formatNumber(currentMetrics.quotationsCreated)}\nQuotes`,
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
  }, [currentMetrics, isDark, chartsConfig]);

  const quoteConversionRingOption: EChartsOption = useMemo(() => {
    const rate = Math.min(Math.round(currentMetrics.quoteToDealRate), 100);
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
            roundCap: true,
            itemStyle: { color: "#2FBF71" }
          },
          axisLine: {
            lineStyle: { width: 14, color: [[1, trackColor]] }
          },
          splitLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          data: [{ value: rate, name: "Quote Conversion" }],
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
  }, [currentMetrics.quoteToDealRate, isDark]);

  const leadQuoteGroups = useMemo(() => {
    const groups: Record<
      string,
      {
        leadId: string;
        contactName: string;
        company: string;
        quotes: Quotation[];
        totalQuoted: number;
        acceptedCount: number;
        latestStatus: Quotation["status"];
      }
    > = {};

    const leadsById = new Map(currentDataset.leads.map((l) => [l.id, l]));

    for (const q of currentDataset.quotations) {
      if (!groups[q.leadId]) {
        const lead = leadsById.get(q.leadId);
        groups[q.leadId] = {
          leadId: q.leadId,
          contactName: lead ? lead.contactName : "Direct Client",
          company: lead ? lead.company : "Commercial Firm",
          quotes: [],
          totalQuoted: 0,
          acceptedCount: 0,
          latestStatus: q.status
        };
      }
      groups[q.leadId].quotes.push(q);
      groups[q.leadId].totalQuoted += q.amount;
      if (q.status === "Accepted") groups[q.leadId].acceptedCount++;
      groups[q.leadId].latestStatus = q.status;
    }

    return Object.values(groups).sort((a, b) => b.totalQuoted - a.totalQuoted);
  }, [currentDataset.quotations, currentDataset.leads]);

  const handleKpiClick = (status?: Quotation["status"]) => {
    const filtered = status
      ? currentDataset.quotations.filter((q) => q.status === status)
      : currentDataset.quotations;

    const items: DrillDownItem[] = filtered.map((q) => ({
      id: q.id,
      type: "quotation",
      title: q.service,
      subtitle: `Owner: ${q.owner} · Lead ID: ${q.leadId}`,
      date: q.createdAt.slice(0, 10),
      amount: q.amount,
      status: q.status,
      statusTone: q.status === "Accepted" ? "positive" : q.status === "Rejected" ? "negative" : "warning"
    }));

    openDrillDown(
      status ? `${status} quotations` : "All quotations",
      `Showing ${filtered.length} commercial quotations`,
      items
    );
  };

  const totalQuotedAmount = currentMetrics.quotedValue || 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotations"
        subtitle="Commercial estimates, service-level acceptance rates and client history."
        onExportCsv={handleExportCsv}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
        <KpiCard
          label="Quotations created"
          value={currentMetrics.quotationsCreated}
          formattedValue={formatNumber(currentMetrics.quotationsCreated)}
          delta={deltas.quotationsCreated}
          sparklineData={[12, 14, 18, 16, 20, 24, currentMetrics.quotationsCreated]}
          onClick={() => handleKpiClick()}
        />
        <KpiCard
          label="Quoted value"
          value={currentMetrics.quotedValue}
          formattedValue={formatCurrency(currentMetrics.quotedValue, true, chartsConfig.currencySymbol)}
          delta={deltas.quotedValue}
          sparklineData={[30, 45, 40, 58, 62, 75, 88]}
          onClick={() => handleKpiClick()}
        />
        <KpiCard
          label="Accepted"
          value={currentMetrics.quotationsAccepted}
          formattedValue={formatNumber(currentMetrics.quotationsAccepted)}
          delta={deltas.dealsCreated}
          sparklineData={[4, 6, 5, 8, 10, 12, currentMetrics.quotationsAccepted]}
          onClick={() => handleKpiClick("Accepted")}
        />
        <KpiCard
          label="Pending review"
          value={currentMetrics.quotationsPending}
          formattedValue={formatNumber(currentMetrics.quotationsPending)}
          delta={deltas.quotationsCreated}
          sparklineData={[6, 8, 7, 9, 8, 10, currentMetrics.quotationsPending]}
          onClick={() => handleKpiClick("Pending")}
        />
        <KpiCard
          label="Rejected & expired"
          value={currentMetrics.quotationsRejected + currentMetrics.quotationsExpired}
          formattedValue={formatNumber(currentMetrics.quotationsRejected + currentMetrics.quotationsExpired)}
          delta={deltas.unqualifiedLeads}
          sparklineData={[2, 3, 4, 3, 2, 4, currentMetrics.quotationsRejected + currentMetrics.quotationsExpired]}
          onClick={() => handleKpiClick("Rejected")}
        />
        <KpiCard
          label="Quote to deal rate"
          value={Math.round(currentMetrics.quoteToDealRate)}
          formattedValue={`${currentMetrics.quoteToDealRate.toFixed(1)}%`}
          delta={deltas.quoteToDealRate}
          sparklineData={[28, 32, 30, 36, 40, 42, Math.round(currentMetrics.quoteToDealRate)]}
          onClick={() => handleKpiClick()}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Quotations by service"
          subtitle="Top services by proposal volume"
        >
          <BaseChart
            option={quotesByServiceOption}
            height={280}
            ariaLabel="Quotations by service horizontal bar chart"
          />
        </ChartCard>

        <ChartCard
          title="Quotation value by service"
          subtitle="Value distribution and share of total pipeline"
        >
          <div className="space-y-1">
            {serviceStats.slice(0, 6).map((s, idx) => {
              const percent = Math.round((s.amount / totalQuotedAmount) * 100);
              return (
                <ProgressRow
                  key={s.service}
                  label={s.service}
                  value={formatCurrency(s.amount, true, chartsConfig.currencySymbol)}
                  secondaryValue={`${percent}%`}
                  percent={percent}
                  dotColor={chartsConfig.palette[idx % chartsConfig.palette.length]}
                  onClick={() => {
                    const quotes = currentDataset.quotations.filter((q) => q.service === s.service);
                    const items: DrillDownItem[] = quotes.map((q) => ({
                      id: q.id,
                      type: "quotation",
                      title: q.service,
                      subtitle: `Owner: ${q.owner} · Lead ID: ${q.leadId}`,
                      date: q.createdAt.slice(0, 10),
                      amount: q.amount,
                      status: q.status
                    }));
                    openDrillDown(`${s.service} Quotes`, `All quotations for ${s.service}`, items);
                  }}
                />
              );
            })}
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard
          title="Status breakdown"
          subtitle="Proportion of proposal outcomes"
          className="lg:col-span-1"
        >
          <div className="h-64 flex items-center justify-center">
            <BaseChart
              option={quoteStatusDonutOption}
              height={240}
              ariaLabel="Quotation status breakdown donut"
            />
          </div>
        </ChartCard>

        <ChartCard
          title="Quote to deal conversion"
          subtitle={`${currentMetrics.quotationsAccepted} deals from ${currentMetrics.quotationsCreated} quotations`}
          className="lg:col-span-1"
        >
          <div className="h-64 flex flex-col items-center justify-center">
            <div className="w-48 h-48">
              <BaseChart
                option={quoteConversionRingOption}
                height={192}
                ariaLabel="Quote conversion ring gauge"
              />
            </div>
            <div className="text-xs text-text-secondary text-center mt-2 tabular font-medium">
              {currentMetrics.quotationsAccepted} deals from {currentMetrics.quotationsCreated} quotations
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Pipeline efficiency"
          subtitle="Realization metric summary"
          className="lg:col-span-1"
        >
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <span className="text-xs text-text-secondary">Average quote size</span>
              <span className="text-sm font-medium text-text-primary tabular">
                {formatCurrency(
                  currentMetrics.quotationsCreated > 0
                    ? Math.round(currentMetrics.quotedValue / currentMetrics.quotationsCreated)
                    : 0,
                  false,
                  chartsConfig.currencySymbol
                )}
              </span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <span className="text-xs text-text-secondary">Accepted proposal value</span>
              <span className="text-sm font-medium text-positive tabular">
                {formatCurrency(
                  currentDataset.quotations
                    .filter((q) => q.status === "Accepted")
                    .reduce((sum, q) => sum + q.amount, 0),
                  true,
                  chartsConfig.currencySymbol
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Pending proposal value</span>
              <span className="text-sm font-medium text-warning tabular">
                {formatCurrency(
                  currentDataset.quotations
                    .filter((q) => q.status === "Pending")
                    .reduce((sum, q) => sum + q.amount, 0),
                  true,
                  chartsConfig.currencySymbol
                )}
              </span>
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="bg-card rounded-card shadow-card p-6">
        <h3 className="text-sm font-medium text-text-primary mb-1">
          Service-wise performance summary
        </h3>
        <p className="text-xs text-text-secondary mb-4">
          Breakdown of quotes, aggregate value and conversion velocity by service catalogue
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-hairline text-text-secondary select-none">
                <th className="py-3 px-3 font-medium">Service</th>
                <th className="py-3 px-3 font-medium text-right">Quotes</th>
                <th className="py-3 px-3 font-medium text-right">Quoted value</th>
                <th className="py-3 px-3 font-medium text-right">Accepted</th>
                <th className="py-3 px-3 font-medium text-right">Pending</th>
                <th className="py-3 px-3 font-medium text-right">Rejected</th>
                <th className="py-3 px-3 font-medium text-right">Expired</th>
                <th className="py-3 px-3 font-medium text-right">Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {serviceStats.map((s) => (
                <tr key={s.service} className="hover:bg-canvas/50 transition-colors">
                  <td className="py-3 px-3 font-medium text-text-primary">{s.service}</td>
                  <td className="py-3 px-3 text-right tabular text-text-primary">{formatNumber(s.count)}</td>
                  <td className="py-3 px-3 text-right tabular font-medium text-text-primary">
                    {formatCurrency(s.amount, false, chartsConfig.currencySymbol)}
                  </td>
                  <td className="py-3 px-3 text-right tabular text-positive font-medium">{s.accepted}</td>
                  <td className="py-3 px-3 text-right tabular text-warning font-medium">{s.pending}</td>
                  <td className="py-3 px-3 text-right tabular text-negative font-medium">{s.rejected}</td>
                  <td className="py-3 px-3 text-right tabular text-text-tertiary">{s.expired}</td>
                  <td className="py-3 px-3 text-right tabular font-medium text-text-primary">
                    {s.conversionRate.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card rounded-card shadow-card p-6">
        <h3 className="text-sm font-medium text-text-primary mb-1">
          Lead-wise quotation history
        </h3>
        <p className="text-xs text-text-secondary mb-4">
          Hierarchical quotation logs grouped by lead. Click rows to inspect individual estimates.
        </p>

        <div className="divide-y divide-hairline">
          {leadQuoteGroups.slice(0, 15).map((group) => {
            const isExpanded = !!expandedLeads[group.leadId];
            return (
              <div key={group.leadId} className="py-3">
                <div
                  onClick={() => toggleLead(group.leadId)}
                  className="flex items-center justify-between gap-4 cursor-pointer hover:bg-canvas/50 p-2 rounded-tile transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button className="text-text-tertiary">
                      {isExpanded ? <CaretDown size={14} /> : <CaretRight size={14} />}
                    </button>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">
                        {group.contactName}
                      </div>
                      <div className="text-xs text-text-secondary truncate">
                        {group.company} · Lead ID: {group.leadId}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-medium text-text-primary tabular">
                        {group.quotes.length} {group.quotes.length === 1 ? "quote" : "quotes"}
                      </div>
                      <div className="text-xs text-text-secondary tabular">
                        {formatCurrency(group.totalQuoted, false, chartsConfig.currencySymbol)} total
                      </div>
                    </div>

                    <StatusChip
                      label={group.latestStatus}
                      tone={
                        group.latestStatus === "Accepted"
                          ? "positive"
                          : group.latestStatus === "Rejected"
                          ? "negative"
                          : "warning"
                      }
                    />

                    <Link
                      to={`/app/leads/${group.leadId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                    >
                      <span>Open lead</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>

                {isExpanded && (
                  <div className="pl-9 pr-4 py-3 mt-2 bg-canvas/60 rounded-tile border border-hairline space-y-3 animate-in fade-in-50 duration-150">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-secondary pb-1 border-b border-hairline/60">
                      <span className="font-medium">
                        Quote analytics · {group.quotes.length} {group.quotes.length === 1 ? "estimate" : "estimates"} · {formatCurrency(group.totalQuoted, false, chartsConfig.currencySymbol)} total
                      </span>
                      <div className="flex items-center gap-2 tabular font-medium">
                        <span className="text-positive">
                          Accepted: {group.quotes.filter((q) => q.status === "Accepted").length}
                        </span>
                        <span className="text-warning">
                          Pending: {group.quotes.filter((q) => q.status === "Pending").length}
                        </span>
                        <span className="text-negative">
                          Rejected: {group.quotes.filter((q) => q.status === "Rejected").length}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-hairline/80 flex overflow-hidden">
                      <div
                        style={{
                          width: `${(group.quotes.filter((q) => q.status === "Accepted").length / group.quotes.length) * 100}%`
                        }}
                        className="bg-positive h-full"
                      />
                      <div
                        style={{
                          width: `${(group.quotes.filter((q) => q.status === "Pending").length / group.quotes.length) * 100}%`
                        }}
                        className="bg-warning h-full"
                      />
                      <div
                        style={{
                          width: `${(group.quotes.filter((q) => q.status === "Rejected").length / group.quotes.length) * 100}%`
                        }}
                        className="bg-negative h-full"
                      />
                    </div>

                    {group.quotes.map((q) => (
                      <div
                        key={q.id}
                        className="flex items-center justify-between gap-4 text-xs py-1.5 border-b border-hairline/60 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-text-tertiary">{q.id}</span>
                          <span className="font-medium text-text-primary">{q.service}</span>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-text-secondary">Owner: {q.owner}</span>
                          <span className="tabular font-medium text-text-primary">
                            {formatCurrency(q.amount, false, chartsConfig.currencySymbol)}
                          </span>
                          <span className="text-text-tertiary tabular">{q.createdAt.slice(0, 10)}</span>
                          <StatusChip
                            label={q.status}
                            tone={
                              q.status === "Accepted"
                                ? "positive"
                                : q.status === "Rejected"
                                ? "negative"
                                : "warning"
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
