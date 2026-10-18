import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MagnifyingGlass, ArrowRight } from "@phosphor-icons/react";
import { useFilterContext } from "@/context/FilterContext";
import { useSettingsStore } from "@/store/settingsStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { ChartCard } from "@/components/common/ChartCard";
import { StatusChip } from "@/components/common/StatusChip";
import { BaseChart } from "@/components/charts/BaseChart";
import { createTooltipFormatter, getBaseEChartsOption } from "@/components/charts/chartTheme";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { OPERATIONS_TEAM, SERVICES } from "@/domain/constants";
import { EChartsOption } from "@/components/charts/echartsConfig";
import { DrillDownItem } from "@/components/common/DrillDownDrawer";

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentDataset, currentMetrics, deltas, currentRange, openDrillDown } = useFilterContext();
  const isDark = useSettingsStore((s) => s.themeMode === "dark");
  const chartsConfig = useSettingsStore((s) => s.charts);

  const [paymentSearch, setPaymentSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;

  const handleExportCsv = () => {
    const headers = ["Payment ID", "Deal ID", "Invoice No", "Amount", "Method", "Status", "Due Date", "Paid Date"];
    const rows = currentDataset.payments.map((p) => [
      p.id,
      p.dealId,
      p.invoiceNo,
      p.amount,
      p.method,
      p.status,
      p.dueAt,
      p.paidAt || ""
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `secureregent_payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const orderStatusDonutOption: EChartsOption = useMemo(() => {
    const counts = {
      Completed: currentDataset.orders.filter((o) => o.status === "Completed").length,
      "In progress": currentDataset.orders.filter((o) => o.status === "In progress").length,
      Pending: currentDataset.orders.filter((o) => o.status === "Pending").length,
      "On hold": currentDataset.orders.filter((o) => o.status === "On hold").length
    };

    const data = [
      { name: "Completed", value: counts.Completed, itemStyle: { color: "#2FBF71" } },
      { name: "In progress", value: counts["In progress"], itemStyle: { color: chartsConfig.palette[0] } },
      { name: "Pending", value: counts.Pending, itemStyle: { color: "#F5A524" } },
      { name: "On hold", value: counts["On hold"], itemStyle: { color: "#E5484D" } }
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
            formatter: () => `${formatNumber(currentDataset.orders.length)}\nOrders`,
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
  }, [currentDataset.orders, isDark, chartsConfig]);

  const serviceOrderProgress = useMemo(() => {
    const stats: Record<string, { total: number; completed: number; inProgress: number; pending: number; onHold: number }> = {};
    for (const s of SERVICES) {
      stats[s.name] = { total: 0, completed: 0, inProgress: 0, pending: 0, onHold: 0 };
    }
    for (const o of currentDataset.orders) {
      if (!stats[o.service]) {
        stats[o.service] = { total: 0, completed: 0, inProgress: 0, pending: 0, onHold: 0 };
      }
      stats[o.service].total++;
      if (o.status === "Completed") stats[o.service].completed++;
      if (o.status === "In progress") stats[o.service].inProgress++;
      if (o.status === "Pending") stats[o.service].pending++;
      if (o.status === "On hold") stats[o.service].onHold++;
    }

    return Object.entries(stats)
      .filter(([, v]) => v.total > 0)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 6);
  }, [currentDataset.orders]);

  const serviceOrderBarOption: EChartsOption = useMemo(() => {
    const categories = serviceOrderProgress.map(([name]) =>
      name.length > 18 ? `${name.substring(0, 16)}...` : name
    );

    return {
      tooltip: {
        trigger: "axis",
        backgroundColor: isDark ? "#181B1F" : "#FFFFFF",
        borderColor: isDark ? "#262A30" : "#EDEDED",
        borderRadius: 12,
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
      grid: {
        left: 16,
        right: 24,
        top: 36,
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
        axisLabel: { color: isDark ? "#A0A5AB" : "#5C5E62", fontSize: 11 }
      },
      series: [
        {
          name: "Completed",
          type: "bar",
          stack: "total",
          itemStyle: { color: "#2FBF71" },
          data: serviceOrderProgress.map(([, v]) => v.completed)
        },
        {
          name: "In progress",
          type: "bar",
          stack: "total",
          itemStyle: { color: chartsConfig.palette[0] },
          data: serviceOrderProgress.map(([, v]) => v.inProgress)
        },
        {
          name: "Pending",
          type: "bar",
          stack: "total",
          itemStyle: { color: "#F5A524" },
          data: serviceOrderProgress.map(([, v]) => v.pending)
        },
        {
          name: "On hold",
          type: "bar",
          stack: "total",
          itemStyle: { color: "#E5484D" },
          data: serviceOrderProgress.map(([, v]) => v.onHold)
        }
      ]
    };
  }, [serviceOrderProgress, isDark, chartsConfig]);

  const collectionTrendOption: EChartsOption = useMemo(() => {
    const base = getBaseEChartsOption({
      isDark,
      colors: chartsConfig.palette,
      gridLines: chartsConfig.gridLines,
      currencySymbol: chartsConfig.currencySymbol
    });

    const dayBuckets: Record<string, number> = {};
    const endMs = currentRange.end.getTime();

    const cur = new Date(currentRange.start);
    cur.setHours(0, 0, 0, 0);
    while (cur.getTime() <= endMs) {
      const key = cur.toISOString().slice(0, 10);
      dayBuckets[key] = 0;
      cur.setDate(cur.getDate() + 1);
    }

    for (const p of currentDataset.payments) {
      if (p.paidAt && p.status === "Received") {
        const key = p.paidAt.slice(0, 10);
        if (dayBuckets[key] !== undefined) {
          dayBuckets[key] += p.amount;
        }
      }
    }

    const categories = Object.keys(dayBuckets).map((k) => {
      const parts = k.split("-");
      return `${parts[1]}/${parts[2]}`;
    });

    const dailyValues = Object.values(dayBuckets);
    let cumulative = 0;
    const cumulativeValues = dailyValues.map((v) => {
      cumulative += v;
      return cumulative;
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
            html += `<div style="display: flex; justify-content: space-between; gap: 12px; margin-top: 4px; font-size: 13px;">
              <span>${item.seriesName}:</span>
              <span style="font-weight: 500; font-variant-numeric: tabular-nums;">
                ${formatCurrency(item.value, false, chartsConfig.currencySymbol)}
              </span>
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
          name: "Daily",
          nameTextStyle: { color: isDark ? "#A0A5AB" : "#5C5E62", fontSize: 11 },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: {
            show: chartsConfig.gridLines,
            lineStyle: { color: isDark ? "#262A30" : "#EDEDED" }
          },
          axisLabel: {
            color: isDark ? "#A0A5AB" : "#5C5E62",
            fontSize: 11,
            formatter: (v: number) => formatCurrency(v, true, chartsConfig.currencySymbol)
          }
        },
        {
          type: "value",
          name: "Cumulative",
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
          name: "Daily cash collected",
          type: "bar",
          yAxisIndex: 0,
          barMaxWidth: 14,
          itemStyle: {
            borderRadius: [chartsConfig.barRadius, chartsConfig.barRadius, 0, 0],
            color: chartsConfig.palette[0]
          },
          data: dailyValues
        },
        {
          name: "Cumulative realization",
          type: "line",
          yAxisIndex: 1,
          smooth: chartsConfig.smoothLines,
          symbolSize: 6,
          itemStyle: { color: "#2FBF71" },
          lineStyle: { width: 2.5 },
          data: cumulativeValues
        }
      ]
    };
  }, [currentDataset.payments, currentRange, isDark, chartsConfig]);

  const paymentMethodSplit = useMemo(() => {
    const counts: Record<string, { count: number; amount: number }> = {};
    for (const p of currentDataset.payments) {
      if (!counts[p.method]) counts[p.method] = { count: 0, amount: 0 };
      counts[p.method].count++;
      if (p.status === "Received") counts[p.method].amount += p.amount;
    }
    const totalAmount = currentMetrics.cashReceivedInPeriod || 1;
    return Object.entries(counts)
      .sort((a, b) => b[1].amount - a[1].amount)
      .map(([method, data], idx) => ({
        method,
        count: data.count,
        amount: data.amount,
        percent: Math.round((data.amount / totalAmount) * 100),
        color: chartsConfig.palette[idx % chartsConfig.palette.length]
      }));
  }, [currentDataset.payments, currentMetrics.cashReceivedInPeriod, chartsConfig.palette]);

  const operationsTeamStats = useMemo(() => {
    const stats: Record<string, { orders: number; completedStages: number; pendingStages: number; overdue: number }> = {};
    for (const op of OPERATIONS_TEAM) {
      stats[op] = { orders: 0, completedStages: 0, pendingStages: 0, overdue: 0 };
    }
    const nowMs = new Date().getTime();
    for (const o of currentDataset.orders) {
      if (!stats[o.assignee]) {
        stats[o.assignee] = { orders: 0, completedStages: 0, pendingStages: 0, overdue: 0 };
      }
      stats[o.assignee].orders++;
      stats[o.assignee].completedStages += o.stagesCompleted;
      stats[o.assignee].pendingStages += Math.max(0, o.stagesTotal - o.stagesCompleted);
      if (o.status !== "Completed" && new Date(o.dueAt).getTime() < nowMs) {
        stats[o.assignee].overdue++;
      }
    }

    return Object.entries(stats).map(([name, data]) => ({
      name,
      ...data
    }));
  }, [currentDataset.orders]);

  const overdueOrders = useMemo(() => {
    const nowMs = new Date().getTime();
    return currentDataset.orders.filter(
      (o) => o.status !== "Completed" && new Date(o.dueAt).getTime() < nowMs
    );
  }, [currentDataset.orders]);

  const filteredPayments = useMemo(() => {
    return currentDataset.payments.filter((p) => {
      if (methodFilter !== "all" && p.method !== methodFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!paymentSearch) return true;
      const q = paymentSearch.toLowerCase();
      return (
        p.id.toLowerCase().includes(q) ||
        p.dealId.toLowerCase().includes(q) ||
        p.invoiceNo.toLowerCase().includes(q) ||
        p.method.toLowerCase().includes(q)
      );
    });
  }, [currentDataset.payments, methodFilter, statusFilter, paymentSearch]);

  const totalPages = Math.ceil(filteredPayments.length / pageSize) || 1;
  const paginatedPayments = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, pageIndex, pageSize]);

  const handleKpiClick = (type: string) => {
    if (type === "orders") {
      const items: DrillDownItem[] = currentDataset.orders.map((o) => ({
        id: o.id,
        type: "order",
        title: o.service,
        subtitle: `Assignee: ${o.assignee} · Stages: ${o.stagesCompleted}/${o.stagesTotal}`,
        date: o.dueAt.slice(0, 10),
        status: o.status,
        statusTone: o.status === "Completed" ? "positive" : o.status === "On hold" ? "negative" : "accent"
      }));
      openDrillDown("All orders", `Showing ${currentDataset.orders.length} orders in period`, items);
    } else if (type === "overdue") {
      const items: DrillDownItem[] = overdueOrders.map((o) => ({
        id: o.id,
        type: "order",
        title: o.service,
        subtitle: `Assignee: ${o.assignee} · Overdue since ${o.dueAt.slice(0, 10)}`,
        date: o.dueAt.slice(0, 10),
        status: "Overdue",
        statusTone: "negative"
      }));
      openDrillDown("Overdue orders", `Showing ${overdueOrders.length} overdue orders`, items);
    } else if (type === "payments") {
      const items: DrillDownItem[] = currentDataset.payments.map((p) => ({
        id: p.id,
        type: "deal",
        title: p.invoiceNo,
        subtitle: `Method: ${p.method} · Deal ID: ${p.dealId}`,
        date: p.paidAt ? p.paidAt.slice(0, 10) : p.dueAt.slice(0, 10),
        amount: p.amount,
        status: p.status,
        statusTone: p.status === "Received" ? "positive" : p.status === "Failed" ? "negative" : "warning"
      }));
      openDrillDown("All payments", `Showing ${currentDataset.payments.length} payment records`, items);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders and payments"
        subtitle="Operations fulfillment tracking, delivery milestones and collection audit."
        onExportCsv={handleExportCsv}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
        <KpiCard
          label="Total orders"
          value={currentMetrics.ordersTotal}
          formattedValue={formatNumber(currentMetrics.ordersTotal)}
          delta={deltas.dealsCreated}
          sparklineData={[10, 14, 12, 18, 16, 22, currentMetrics.ordersTotal]}
          onClick={() => handleKpiClick("orders")}
        />
        <KpiCard
          label="In progress"
          value={currentMetrics.ordersInProgress}
          formattedValue={formatNumber(currentMetrics.ordersInProgress)}
          delta={deltas.quotationsCreated}
          sparklineData={[6, 8, 7, 10, 9, 12, currentMetrics.ordersInProgress]}
          onClick={() => handleKpiClick("orders")}
        />
        <KpiCard
          label="Completed"
          value={currentMetrics.ordersCompleted}
          formattedValue={formatNumber(currentMetrics.ordersCompleted)}
          delta={deltas.dealsCreated}
          sparklineData={[4, 6, 5, 8, 9, 11, currentMetrics.ordersCompleted]}
          onClick={() => handleKpiClick("orders")}
        />
        <KpiCard
          label="Overdue orders"
          value={currentMetrics.ordersOverdue}
          formattedValue={formatNumber(currentMetrics.ordersOverdue)}
          delta={deltas.ordersOverdue}
          sparklineData={[2, 3, 2, 4, 3, 2, currentMetrics.ordersOverdue]}
          onClick={() => handleKpiClick("overdue")}
        />
        <KpiCard
          label="Payments received"
          value={currentMetrics.cashReceivedInPeriod}
          formattedValue={formatCurrency(currentMetrics.cashReceivedInPeriod, true, chartsConfig.currencySymbol)}
          delta={deltas.cashReceived}
          sparklineData={[25, 35, 30, 48, 52, 65, 78]}
          onClick={() => handleKpiClick("payments")}
        />
        <KpiCard
          label="Outstanding collections"
          value={currentMetrics.totalOutstandingForDeals}
          formattedValue={formatCurrency(currentMetrics.totalOutstandingForDeals, true, chartsConfig.currencySymbol)}
          delta={deltas.outstandingRevenue}
          sparklineData={[15, 12, 16, 14, 18, 16, 14]}
          onClick={() => handleKpiClick("payments")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard
          title="Order fulfillment status"
          subtitle="Proportion of orders by operational state"
          className="lg:col-span-1"
        >
          <div className="h-64 flex items-center justify-center">
            <BaseChart
              option={orderStatusDonutOption}
              height={240}
              ariaLabel="Order fulfillment status donut chart"
            />
          </div>
        </ChartCard>

        <ChartCard
          title="Service stage progress"
          subtitle="Orders and completion status across service lines"
          className="lg:col-span-2"
        >
          <BaseChart
            option={serviceOrderBarOption}
            height={280}
            ariaLabel="Service stage progress stacked bar chart"
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard
          title="Collection realization trend"
          subtitle="Daily collected receipts and cumulative progress"
          className="lg:col-span-2"
        >
          <BaseChart
            option={collectionTrendOption}
            height={280}
            ariaLabel="Collection realization trend chart"
          />
        </ChartCard>

        <ChartCard
          title="Payment method split"
          subtitle="Inbound funds distribution by channel"
          className="lg:col-span-1"
        >
          <div className="space-y-4 py-2">
            <div className="divide-y divide-hairline">
              {paymentMethodSplit.map((m) => (
                <div
                  key={m.method}
                  className="py-2.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: m.color }}
                    />
                    <span className="text-xs font-medium text-text-primary">{m.method}</span>
                    <span className="text-[11px] text-text-tertiary">({m.count})</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-text-primary tabular">
                      {formatCurrency(m.amount, true, chartsConfig.currencySymbol)}
                    </div>
                    <div className="text-[10px] text-text-tertiary tabular">{m.percent}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Operations team capacity"
          subtitle="Assigned orders and fulfillment stage execution"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-hairline text-text-secondary">
                  <th className="py-2.5 px-3 font-medium">Assignee</th>
                  <th className="py-2.5 px-3 font-medium text-right">Orders</th>
                  <th className="py-2.5 px-3 font-medium text-right">Stages completed</th>
                  <th className="py-2.5 px-3 font-medium text-right">Pending stages</th>
                  <th className="py-2.5 px-3 font-medium text-right">Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {operationsTeamStats.map((op) => (
                  <tr key={op.name} className="hover:bg-canvas/50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-text-primary">{op.name}</td>
                    <td className="py-2.5 px-3 text-right tabular text-text-primary">{op.orders}</td>
                    <td className="py-2.5 px-3 text-right tabular text-positive font-medium">{op.completedStages}</td>
                    <td className="py-2.5 px-3 text-right tabular text-warning font-medium">{op.pendingStages}</td>
                    <td className="py-2.5 px-3 text-right tabular text-negative font-medium">{op.overdue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>

        <ChartCard
          title="Overdue orders attention list"
          subtitle={`${overdueOrders.length} orders requiring expedited execution`}
        >
          <div className="divide-y divide-hairline max-h-[280px] overflow-y-auto">
            {overdueOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-secondary">
                No orders currently overdue.
              </div>
            ) : (
              overdueOrders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => navigate(`/app/orders/${o.id}`)}
                  className="py-2.5 px-2 flex items-center justify-between gap-3 hover:bg-canvas/50 rounded-tile transition-colors cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-text-tertiary">{o.id}</span>
                      <span className="text-xs font-medium text-text-primary">{o.service}</span>
                    </div>
                    <div className="text-[11px] text-text-secondary mt-0.5">
                      Assignee: {o.assignee} · Due: {o.dueAt.slice(0, 10)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-negative font-medium tabular">
                      {o.stagesCompleted}/{o.stagesTotal} stages
                    </span>
                    <ArrowRight size={13} className="text-text-tertiary" />
                  </div>
                </div>
              ))
            )}
          </div>
        </ChartCard>
      </div>

      <div className="bg-card rounded-card shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-hairline">
          <div>
            <h3 className="text-sm font-medium text-text-primary">
              Payment transaction audit
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Showing {filteredPayments.length} transactions in period
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
                value={paymentSearch}
                onChange={(e) => {
                  setPaymentSearch(e.target.value);
                  setPageIndex(0);
                }}
                placeholder="Search payments..."
                className="pl-8 pr-3 py-1.5 rounded-full bg-canvas border border-hairline text-xs font-medium text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent w-48 sm:w-60"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={methodFilter}
                onChange={(e) => {
                  setMethodFilter(e.target.value);
                  setPageIndex(0);
                }}
                className="px-2.5 py-1.5 rounded-full bg-canvas border border-hairline text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="all">All methods</option>
                <option value="UPI">UPI</option>
                <option value="Bank transfer">Bank transfer</option>
                <option value="Card">Card</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPageIndex(0);
                }}
                className="px-2.5 py-1.5 rounded-full bg-canvas border border-hairline text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="all">All statuses</option>
                <option value="Received">Received</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-hairline text-text-secondary select-none">
                <th className="py-3 px-3 font-medium">Payment ID</th>
                <th className="py-3 px-3 font-medium">Invoice No</th>
                <th className="py-3 px-3 font-medium">Linked Deal</th>
                <th className="py-3 px-3 font-medium">Method</th>
                <th className="py-3 px-3 font-medium text-right">Amount</th>
                <th className="py-3 px-3 font-medium">Status</th>
                <th className="py-3 px-3 font-medium text-right">Paid / Due date</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-text-secondary">
                    No payments found matching the specified filters.
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/app/deals/${p.dealId}`)}
                    className="hover:bg-canvas/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-mono font-medium text-text-tertiary">{p.id}</td>
                    <td className="py-3 px-3 font-medium text-text-primary">{p.invoiceNo}</td>
                    <td className="py-3 px-3 text-text-secondary">
                      <Link
                        to={`/app/deals/${p.dealId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-accent hover:underline font-mono"
                      >
                        {p.dealId}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-text-secondary">{p.method}</td>
                    <td className="py-3 px-3 text-right tabular font-medium text-text-primary">
                      {formatCurrency(p.amount, false, chartsConfig.currencySymbol)}
                    </td>
                    <td className="py-3 px-3">
                      <StatusChip
                        label={p.status}
                        tone={p.status === "Received" ? "positive" : p.status === "Failed" ? "negative" : "warning"}
                      />
                    </td>
                    <td className="py-3 px-3 text-right tabular text-text-secondary">
                      {p.paidAt ? p.paidAt.slice(0, 10) : p.dueAt.slice(0, 10)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/deals/${p.dealId}`);
                        }}
                        className="p-1 rounded-full text-text-tertiary group-hover:text-accent hover:bg-canvas transition-colors"
                        aria-label={`View deal ${p.dealId}`}
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

        <div className="flex items-center justify-between gap-4 pt-4 mt-4 border-t border-hairline text-xs text-text-secondary">
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
  );
};
