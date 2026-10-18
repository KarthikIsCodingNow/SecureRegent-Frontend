import { describe, it, expect } from "vitest";
import { generateDataset, DEFAULT_SIMULATOR_CONFIG } from "../generator";
import {
  computeMetrics,
  computeMetricDeltas,
  filterDataset,
  resolveDateRange
} from "../metrics";
import { computePercentageDelta, formatCurrency, formatNumber } from "../../utils/formatters";
import { FilterState } from "../types";

describe("Generator & Referential Integrity", () => {
  it("generates deterministic dataset with same seed", () => {
    const fixedNow = new Date("2026-10-18T12:00:00Z");
    const ds1 = generateDataset({ ...DEFAULT_SIMULATOR_CONFIG, seed: 123 }, fixedNow);
    const ds2 = generateDataset({ ...DEFAULT_SIMULATOR_CONFIG, seed: 123 }, fixedNow);

    expect(ds1.leads.length).toBe(ds2.leads.length);
    expect(ds1.quotations.length).toBe(ds2.quotations.length);
    expect(ds1.deals.length).toBe(ds2.deals.length);
    expect(ds1.orders.length).toBe(ds2.orders.length);
    expect(ds1.payments.length).toBe(ds2.payments.length);
    expect(ds1.leads[0].id).toBe(ds2.leads[0].id);
  });

  it("enforces referential integrity across entities", () => {
    const fixedNow = new Date("2026-10-18T12:00:00Z");
    const ds = generateDataset({ ...DEFAULT_SIMULATOR_CONFIG, historyDays: 60 }, fixedNow);

    const leadIds = new Set(ds.leads.map((l) => l.id));
    const quoteIds = new Set(ds.quotations.map((q) => q.id));
    const dealIds = new Set(ds.deals.map((d) => d.id));
    const orderIds = new Set(ds.orders.map((o) => o.id));

    for (const q of ds.quotations) {
      expect(leadIds.has(q.leadId)).toBe(true);
    }

    for (const d of ds.deals) {
      expect(leadIds.has(d.leadId)).toBe(true);
      expect(quoteIds.has(d.quotationId)).toBe(true);
    }

    for (const o of ds.orders) {
      expect(dealIds.has(o.dealId)).toBe(true);
    }

    for (const p of ds.payments) {
      expect(dealIds.has(p.dealId)).toBe(true);
      if (p.orderId) {
        expect(orderIds.has(p.orderId)).toBe(true);
      }
    }
  });

  it("enforces chronological date cascading", () => {
    const fixedNow = new Date("2026-10-18T12:00:00Z");
    const ds = generateDataset({ ...DEFAULT_SIMULATOR_CONFIG, historyDays: 60 }, fixedNow);

    const leadsById = new Map(ds.leads.map((l) => [l.id, l]));

    for (const d of ds.deals) {
      const lead = leadsById.get(d.leadId);
      expect(lead).toBeDefined();
      if (lead) {
        const leadCreated = new Date(lead.createdAt).getTime();
        const dealCreated = new Date(d.createdAt).getTime();
        expect(dealCreated).toBeGreaterThanOrEqual(leadCreated);
      }
    }

    for (const o of ds.orders) {
      const orderCreated = new Date(o.createdAt).getTime();
      const orderDue = new Date(o.dueAt).getTime();
      expect(orderDue).toBeGreaterThanOrEqual(orderCreated);
      if (o.completedAt) {
        const orderCompleted = new Date(o.completedAt).getTime();
        expect(orderCompleted).toBeGreaterThanOrEqual(orderCreated);
      }
    }

    for (const p of ds.payments) {
      if (p.paidAt) {
        const paid = new Date(p.paidAt).getTime();
        expect(paid).toBeLessThanOrEqual(fixedNow.getTime());
      }
    }
  });
});

describe("Formatters & Percentage Deltas", () => {
  it("formats Indian currency correctly in full and compact formats", () => {
    expect(formatCurrency(102928)).toBe("₹1,02,928");
    expect(formatCurrency(4500000)).toBe("₹45,00,000");
    expect(formatCurrency(1260000, true)).toBe("₹12.6L");
    expect(formatCurrency(12000000, true)).toBe("₹1.2Cr");
    expect(formatCurrency(500, true)).toBe("₹500");
  });

  it("formats numbers with Indian commas and compact notations", () => {
    expect(formatNumber(102928)).toBe("1,02,928");
    expect(formatNumber(250000, true)).toBe("2.5L");
  });

  it("computes percentage deltas and handles edge cases", () => {
    const deltaNew = computePercentageDelta(10, 0);
    expect(deltaNew.isNew).toBe(true);
    expect(deltaNew.text).toBe("New");
    expect(deltaNew.isPositive).toBe(true);

    const deltaZero = computePercentageDelta(0, 0);
    expect(deltaZero.text).toBe("—");
    expect(deltaZero.isNeutral).toBe(true);

    const deltaNormal = computePercentageDelta(120, 100);
    expect(deltaNormal.text).toBe("+20.0%");
    expect(deltaNormal.isPositive).toBe(true);

    const deltaInverted = computePercentageDelta(120, 100, true);
    expect(deltaInverted.text).toBe("+20.0%");
    expect(deltaInverted.isPositive).toBe(false);

    const deltaNeutral = computePercentageDelta(100.02, 100);
    expect(deltaNeutral.text).toBe("0.0%");
    expect(deltaNeutral.isNeutral).toBe(true);
  });
});

describe("Cohort Metrics & Filtering", () => {
  it("maintains cohort invariant: converted <= qualified <= new leads", () => {
    const fixedNow = new Date("2026-10-18T12:00:00Z");
    const ds = generateDataset({ ...DEFAULT_SIMULATOR_CONFIG, historyDays: 45 }, fixedNow);

    const filter: FilterState = {
      timeframe: "last30",
      customStart: null,
      customEnd: null,
      compare: true,
      user: "all",
      department: "all",
      service: "all"
    };

    const ranges = resolveDateRange(filter, fixedNow);
    const filteredCurrent = filterDataset(ds, filter, ranges.current);
    const metrics = computeMetrics(filteredCurrent, ds.payments, ranges.current, 4500000, fixedNow);

    expect(metrics.convertedLeads).toBeLessThanOrEqual(metrics.qualifiedLeads);
    expect(metrics.qualifiedLeads).toBeLessThanOrEqual(metrics.newLeads);
    expect(metrics.conversionRate).toBeGreaterThanOrEqual(0);
    expect(metrics.conversionRate).toBeLessThanOrEqual(100);
  });

  it("correctly swaps reversed custom date ranges", () => {
    const filter: FilterState = {
      timeframe: "custom",
      customStart: "2026-10-20",
      customEnd: "2026-10-01",
      compare: true,
      user: "all",
      department: "all",
      service: "all"
    };

    const ranges = resolveDateRange(filter, new Date("2026-10-25T12:00:00Z"));
    expect(ranges.current.start.getTime()).toBeLessThan(ranges.current.end.getTime());
    expect(ranges.current.start.getDate()).toBe(1);
    expect(ranges.current.start.getMonth()).toBe(9);
    expect(ranges.current.end.getDate()).toBe(20);
    expect(ranges.current.end.getMonth()).toBe(9);
  });

  it("computes metric deltas with inverted semantics for negative indicators", () => {
    const fixedNow = new Date("2026-10-18T12:00:00Z");
    const ds = generateDataset({ ...DEFAULT_SIMULATOR_CONFIG, historyDays: 45 }, fixedNow);
    const filter: FilterState = {
      timeframe: "last30",
      customStart: null,
      customEnd: null,
      compare: true,
      user: "all",
      department: "all",
      service: "all"
    };
    const ranges = resolveDateRange(filter, fixedNow);
    const curDataset = filterDataset(ds, filter, ranges.current);
    const prevDataset = filterDataset(ds, filter, ranges.previous);

    const curMetrics = computeMetrics(curDataset, ds.payments, ranges.current, 4500000, fixedNow);
    const prevMetrics = computeMetrics(prevDataset, ds.payments, ranges.previous, 4500000, fixedNow);

    const deltas = computeMetricDeltas(curMetrics, prevMetrics);
    expect(deltas.newLeads).toBeDefined();
    expect(deltas.unqualifiedLeads.inverted).toBe(true);
    expect(deltas.ordersOverdue.inverted).toBe(true);
    expect(deltas.outstandingRevenue.inverted).toBe(true);
  });
});

describe("Design System & Color Tokens", () => {
  it("enforces that chart palette contains no hues between 255 and 320 degrees", async () => {
    const { DEFAULT_CHART_PALETTE } = await import("../constants");
    const { isProhibitedHue, getHueFromHex } = await import("../../utils/colors");

    for (const hex of DEFAULT_CHART_PALETTE) {
      const hue = getHueFromHex(hex);
      const prohibited = isProhibitedHue(hex);
      expect(prohibited).toBe(false);
      expect(hue < 255 || hue > 320).toBe(true);
    }
  });

  it("enforces APP_NAME is Secure-Regent across constants", async () => {
    const { APP_NAME } = await import("../constants");
    expect(APP_NAME).toBe("Secure-Regent");
  });

  it("calculates high contrast text colors for light and dark backgrounds", async () => {
    const { getContrastTextColor } = await import("../../utils/colors");
    // On dark background (#171A20 or #0F1114), contrast text should be white
    expect(getContrastTextColor("#171A20")).toBe("#FFFFFF");
    expect(getContrastTextColor("#0F1114")).toBe("#FFFFFF");
    expect(getContrastTextColor("#1E2942")).toBe("#FFFFFF");

    // On light background (#F7F7F8, #FFFFFF, or #D2D6DC), contrast text should be dark
    expect(getContrastTextColor("#FFFFFF")).toBe("#0F1114");
    expect(getContrastTextColor("#F7F7F8")).toBe("#0F1114");
    expect(getContrastTextColor("#D2D6DC")).toBe("#0F1114");
  });

  it("handles custom logo setting in settingsStore", async () => {
    const { useSettingsStore } = await import("../../store/settingsStore");
    const testSvg = "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=";
    useSettingsStore.getState().setCustomLogo(testSvg);
    expect(useSettingsStore.getState().customLogo).toBe(testSvg);

    // Reset logo
    useSettingsStore.getState().setCustomLogo(null);
    expect(useSettingsStore.getState().customLogo).toBeNull();
  });

  it("stores, marks as read, and manages inbox messages in settingsStore", async () => {
    const { useSettingsStore } = await import("../../store/settingsStore");
    const store = useSettingsStore.getState();

    const initialCount = store.inboxMessages.length;
    const newMsg = store.addInboxMessage({
      name: "Test User",
      email: "test@example.com",
      subject: "Test Subject",
      message: "Test message body content"
    });

    expect(newMsg.id).toBeDefined();
    expect(newMsg.read).toBe(false);
    expect(useSettingsStore.getState().inboxMessages.length).toBe(initialCount + 1);

    // Mark as read
    useSettingsStore.getState().markInboxMessageAsRead(newMsg.id, true);
    const found = useSettingsStore.getState().inboxMessages.find((m) => m.id === newMsg.id);
    expect(found?.read).toBe(true);

    // Delete message
    useSettingsStore.getState().deleteInboxMessage(newMsg.id);
    expect(useSettingsStore.getState().inboxMessages.find((m) => m.id === newMsg.id)).toBeUndefined();
  });
});


