import { Dataset, DateRange, FilterState, Payment } from "./types";
import { SALES_TEAM, OPERATIONS_TEAM } from "./constants";
import { computePercentageDelta, DeltaResult } from "../utils/formatters";

export function resolveDateRange(filter: FilterState, now = new Date()): { current: DateRange; previous: DateRange } {
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  let curStart = new Date(now);
  let curEnd = new Date(endOfToday);

  if (filter.timeframe === "today") {
    curStart.setHours(0, 0, 0, 0);
  } else if (filter.timeframe === "last7") {
    curStart.setDate(curStart.getDate() - 6);
    curStart.setHours(0, 0, 0, 0);
  } else if (filter.timeframe === "last30") {
    curStart.setDate(curStart.getDate() - 29);
    curStart.setHours(0, 0, 0, 0);
  } else if (filter.timeframe === "custom") {
    if (filter.customStart && filter.customEnd) {
      let s = new Date(filter.customStart);
      let e = new Date(filter.customEnd);
      if (s.getTime() > e.getTime()) {
        const tmp = s;
        s = e;
        e = tmp;
      }
      s.setHours(0, 0, 0, 0);
      e.setHours(23, 59, 59, 999);
      curStart = s;
      curEnd = e;
    } else {
      curStart.setDate(curStart.getDate() - 29);
      curStart.setHours(0, 0, 0, 0);
    }
  }

  const durationMs = curEnd.getTime() - curStart.getTime();
  const prevEnd = new Date(curStart.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - durationMs);

  return {
    current: { start: curStart, end: curEnd },
    previous: { start: prevStart, end: prevEnd }
  };
}

export function filterDataset(dataset: Dataset, filter: FilterState, range: DateRange): Dataset {
  const startMs = range.start.getTime();
  const endMs = range.end.getTime();

  const isUserMatch = (owner: string): boolean => {
    if (!filter.user || filter.user === "all") return true;
    return owner === filter.user;
  };

  const isDeptMatch = (owner: string): boolean => {
    if (filter.department === "all") return true;
    if (filter.department === "Sales") return SALES_TEAM.includes(owner);
    if (filter.department === "Operations") return OPERATIONS_TEAM.includes(owner);
    return true;
  };

  const isServiceMatch = (serviceName: string): boolean => {
    if (!filter.service || filter.service === "all") return true;
    return serviceName === filter.service;
  };

  const leads = dataset.leads.filter((l) => {
    const t = new Date(l.createdAt).getTime();
    if (t < startMs || t > endMs) return false;
    if (!isUserMatch(l.owner)) return false;
    if (!isDeptMatch(l.owner)) return false;
    return true;
  });

  const quotations = dataset.quotations.filter((q) => {
    const t = new Date(q.createdAt).getTime();
    if (t < startMs || t > endMs) return false;
    if (!isUserMatch(q.owner)) return false;
    if (!isDeptMatch(q.owner)) return false;
    if (!isServiceMatch(q.service)) return false;
    return true;
  });

  const deals = dataset.deals.filter((d) => {
    const t = new Date(d.createdAt).getTime();
    if (t < startMs || t > endMs) return false;
    if (!isUserMatch(d.owner)) return false;
    if (!isDeptMatch(d.owner)) return false;
    if (!isServiceMatch(d.service)) return false;
    return true;
  });

  const orders = dataset.orders.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    if (t < startMs || t > endMs) return false;
    if (filter.user && filter.user !== "all" && o.assignee !== filter.user) return false;
    if (filter.department === "Sales") return false;
    if (!isServiceMatch(o.service)) return false;
    return true;
  });

  const payments = dataset.payments.filter((p) => {
    if (!p.paidAt) return false;
    const t = new Date(p.paidAt).getTime();
    return t >= startMs && t <= endMs;
  });

  const activities = dataset.activities.filter((a) => {
    const t = new Date(a.timestamp).getTime();
    return t >= startMs && t <= endMs;
  });

  return {
    leads,
    quotations,
    deals,
    orders,
    payments,
    activities
  };
}

export interface MetricSummary {
  newLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  unqualifiedLeads: number;
  conversionRate: number;
  qualifiedRate: number;
  unqualifiedRate: number;

  quotationsCreated: number;
  quotedValue: number;
  quotationsAccepted: number;
  quotationsPending: number;
  quotationsRejected: number;
  quotationsExpired: number;
  quoteToDealRate: number;

  dealsCreated: number;
  revenueBooked: number;
  totalCollectedForDeals: number;
  totalOutstandingForDeals: number;
  collectionRateForDeals: number;
  averageDealValue: number;

  cashReceivedInPeriod: number;

  ordersTotal: number;
  ordersInProgress: number;
  ordersCompleted: number;
  ordersOverdue: number;

  targetAchievementRate: number;
  scaledTarget: number;
  targetRemaining: number;
}

export function computeMetrics(
  filtered: Dataset,
  allPayments: Payment[],
  range: DateRange,
  monthlyTarget: number,
  now = new Date()
): MetricSummary {
  const newLeads = filtered.leads.length;
  const qualifiedLeads = filtered.leads.filter((l) => l.qualifiedAt !== null).length;
  const convertedLeads = filtered.leads.filter((l) => l.convertedAt !== null).length;
  const unqualifiedLeads = filtered.leads.filter((l) => l.status === "Unqualified").length;

  const conversionRate = newLeads > 0 ? (convertedLeads / newLeads) * 100 : 0;
  const qualifiedRate = newLeads > 0 ? (qualifiedLeads / newLeads) * 100 : 0;
  const unqualifiedRate = newLeads > 0 ? (unqualifiedLeads / newLeads) * 100 : 0;

  const quotationsCreated = filtered.quotations.length;
  const quotedValue = filtered.quotations.reduce((sum, q) => sum + q.amount, 0);
  const quotationsAccepted = filtered.quotations.filter((q) => q.status === "Accepted").length;
  const quotationsPending = filtered.quotations.filter((q) => q.status === "Pending").length;
  const quotationsRejected = filtered.quotations.filter((q) => q.status === "Rejected").length;
  const quotationsExpired = filtered.quotations.filter((q) => q.status === "Expired").length;
  const quoteToDealRate = quotationsCreated > 0 ? (quotationsAccepted / quotationsCreated) * 100 : 0;

  const dealsCreated = filtered.deals.length;
  const revenueBooked = filtered.deals.reduce((sum, d) => sum + d.value, 0);

  const dealIds = new Set(filtered.deals.map((d) => d.id));
  const paymentsForDeals = allPayments.filter((p) => dealIds.has(p.dealId) && p.status === "Received");
  const totalCollectedForDeals = paymentsForDeals.reduce((sum, p) => sum + p.amount, 0);
  const totalOutstandingForDeals = Math.max(0, revenueBooked - totalCollectedForDeals);
  const collectionRateForDeals = revenueBooked > 0 ? (totalCollectedForDeals / revenueBooked) * 100 : 0;
  const averageDealValue = dealsCreated > 0 ? Math.round(revenueBooked / dealsCreated) : 0;

  const cashReceivedInPeriod = filtered.payments
    .filter((p) => p.status === "Received")
    .reduce((sum, p) => sum + p.amount, 0);

  const ordersTotal = filtered.orders.length;
  const ordersInProgress = filtered.orders.filter((o) => o.status === "In progress").length;
  const ordersCompleted = filtered.orders.filter((o) => o.status === "Completed").length;

  const nowMs = now.getTime();
  const ordersOverdue = filtered.orders.filter(
    (o) => o.status !== "Completed" && new Date(o.dueAt).getTime() < nowMs
  ).length;

  const daysInPeriod = Math.max(1, Math.round((range.end.getTime() - range.start.getTime()) / 86400000));
  const scaledTarget = Math.round(monthlyTarget * (daysInPeriod / 30));
  const targetAchievementRate = scaledTarget > 0 ? (revenueBooked / scaledTarget) * 100 : 0;
  const targetRemaining = Math.max(0, scaledTarget - revenueBooked);

  return {
    newLeads,
    qualifiedLeads,
    convertedLeads,
    unqualifiedLeads,
    conversionRate,
    qualifiedRate,
    unqualifiedRate,
    quotationsCreated,
    quotedValue,
    quotationsAccepted,
    quotationsPending,
    quotationsRejected,
    quotationsExpired,
    quoteToDealRate,
    dealsCreated,
    revenueBooked,
    totalCollectedForDeals,
    totalOutstandingForDeals,
    collectionRateForDeals,
    averageDealValue,
    cashReceivedInPeriod,
    ordersTotal,
    ordersInProgress,
    ordersCompleted,
    ordersOverdue,
    targetAchievementRate,
    scaledTarget,
    targetRemaining
  };
}

export interface MetricDeltas {
  newLeads: DeltaResult;
  conversionRate: DeltaResult;
  quotationsCreated: DeltaResult;
  dealsCreated: DeltaResult;
  revenueBooked: DeltaResult;
  cashReceived: DeltaResult;
  quotedValue: DeltaResult;
  unqualifiedLeads: DeltaResult;
  quoteToDealRate: DeltaResult;
  outstandingRevenue: DeltaResult;
  ordersOverdue: DeltaResult;
  averageDealValue: DeltaResult;
}

export function computeMetricDeltas(current: MetricSummary, previous: MetricSummary): MetricDeltas {
  return {
    newLeads: computePercentageDelta(current.newLeads, previous.newLeads),
    conversionRate: computePercentageDelta(current.conversionRate, previous.conversionRate),
    quotationsCreated: computePercentageDelta(current.quotationsCreated, previous.quotationsCreated),
    dealsCreated: computePercentageDelta(current.dealsCreated, previous.dealsCreated),
    revenueBooked: computePercentageDelta(current.revenueBooked, previous.revenueBooked),
    cashReceived: computePercentageDelta(current.cashReceivedInPeriod, previous.cashReceivedInPeriod),
    quotedValue: computePercentageDelta(current.quotedValue, previous.quotedValue),
    unqualifiedLeads: computePercentageDelta(current.unqualifiedLeads, previous.unqualifiedLeads, true),
    quoteToDealRate: computePercentageDelta(current.quoteToDealRate, previous.quoteToDealRate),
    outstandingRevenue: computePercentageDelta(
      current.totalOutstandingForDeals,
      previous.totalOutstandingForDeals,
      true
    ),
    ordersOverdue: computePercentageDelta(current.ordersOverdue, previous.ordersOverdue, true),
    averageDealValue: computePercentageDelta(current.averageDealValue, previous.averageDealValue)
  };
}

export type Granularity = "day" | "week" | "month";

export function getAutoGranularity(range: DateRange): Granularity {
  const days = Math.round((range.end.getTime() - range.start.getTime()) / 86400000);
  if (days <= 31) return "day";
  if (days <= 120) return "week";
  return "month";
}

export interface TimeSeriesPoint {
  date: string;
  label: string;
  booked: number;
  collected: number;
  prevBooked?: number;
  prevCollected?: number;
  leads?: number;
  quotes?: number;
  deals?: number;
}

export function generateDailyBuckets(range: DateRange): string[] {
  const buckets: string[] = [];
  const cur = new Date(range.start);
  cur.setHours(0, 0, 0, 0);

  while (cur.getTime() <= range.end.getTime()) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, "0");
    const d = String(cur.getDate()).padStart(2, "0");
    buckets.push(`${y}-${m}-${d}`);
    cur.setDate(cur.getDate() + 1);
  }

  return buckets;
}
