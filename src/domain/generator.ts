import {
  Activity,
  Dataset,
  Deal,
  Lead,
  LeadSource,
  Order,
  OrderStatus,
  Payment,
  PaymentMethod,
  PaymentStatus,
  Quotation,
  QuotationStatus
} from "./types";
import {
  COMPANY_STEMS,
  INDIAN_CITIES,
  INDIAN_FIRST_NAMES,
  INDIAN_SURNAMES,
  OPERATIONS_TEAM,
  SALES_TEAM,
  SERVICES
} from "./constants";

export interface SimulatorConfig {
  seed: number;
  historyDays: number;
  leadsPerDay: number;
  qualificationRate: number;
  quoteAcceptanceRate: number;
  averageDealValue: number;
  paymentDelayDays: number;
  sourceMix: {
    googleAds: number;
    website: number;
    justDial: number;
    referral: number;
    socialMedia: number;
    other: number;
  };
}

export const DEFAULT_SIMULATOR_CONFIG: SimulatorConfig = {
  seed: 42,
  historyDays: 180,
  leadsPerDay: 4.2,
  qualificationRate: 0.68,
  quoteAcceptanceRate: 0.42,
  averageDealValue: 24000,
  paymentDelayDays: 4,
  sourceMix: {
    googleAds: 0.38,
    website: 0.22,
    justDial: 0.16,
    referral: 0.12,
    socialMedia: 0.08,
    other: 0.04
  }
};

export function createPrng(seed: number) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateDataset(config: SimulatorConfig = DEFAULT_SIMULATOR_CONFIG, now = new Date()): Dataset {
  const prng = createPrng(config.seed);

  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(prng() * arr.length)];
  const randomBetween = (min: number, max: number): number => min + prng() * (max - min);
  const randomInt = (min: number, max: number): number => Math.floor(randomBetween(min, max + 1));

  const pickSource = (): LeadSource => {
    const r = prng();
    const mix = config.sourceMix;
    let acc = mix.googleAds;
    if (r < acc) return "Google Ads";
    acc += mix.website;
    if (r < acc) return "Website";
    acc += mix.justDial;
    if (r < acc) return "Just Dial";
    acc += mix.referral;
    if (r < acc) return "Referral";
    acc += mix.socialMedia;
    if (r < acc) return "Social media";
    return "Other";
  };

  const leads: Lead[] = [];
  const quotations: Quotation[] = [];
  const deals: Deal[] = [];
  const orders: Order[] = [];
  const payments: Payment[] = [];
  const activities: Activity[] = [];

  let leadSeq = 1000;
  let quoteSeq = 2000;
  let dealSeq = 3000;
  let orderSeq = 4000;
  let paymentSeq = 5000;
  let actSeq = 6000;

  const paymentMethods: PaymentMethod[] = ["UPI", "Bank transfer", "Card", "Cheque", "Cash"];
  const paymentMethodWeights = [0.45, 0.30, 0.15, 0.07, 0.03];

  const pickPaymentMethod = (): PaymentMethod => {
    const r = prng();
    let acc = 0;
    for (let i = 0; i < paymentMethods.length; i++) {
      acc += paymentMethodWeights[i];
      if (r < acc) return paymentMethods[i];
    }
    return "UPI";
  };

  const totalDays = config.historyDays;
  const nowMs = now.getTime();

  for (let dayOffset = totalDays; dayOffset >= 0; dayOffset--) {
    const dayDate = new Date(nowMs - dayOffset * 86400000);
    const dayOfWeek = dayDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const seasonality = isWeekend ? 0.45 : 1.1;
    const progress = 1 - dayOffset / totalDays;
    const trendMultiplier = 0.8 + 0.4 * progress;

    let dayLeadCount = Math.round(config.leadsPerDay * seasonality * trendMultiplier + (prng() - 0.5) * 2);
    if (dayOffset <= 14) {
      dayLeadCount = Math.max(dayLeadCount, 2);
    } else {
      dayLeadCount = Math.max(dayLeadCount, 1);
    }

    for (let l = 0; l < dayLeadCount; l++) {
      leadSeq++;
      const leadId = `LD-${leadSeq}`;
      const contactName = `${pick(INDIAN_FIRST_NAMES)} ${pick(INDIAN_SURNAMES)}`;
      const company = `${pick(COMPANY_STEMS)} Pvt Ltd`;
      const city = pick(INDIAN_CITIES);
      const source = pickSource();
      const owner = pick(SALES_TEAM);

      const leadHours = randomBetween(8, 19);
      const leadMinutes = randomInt(0, 59);
      const leadCreatedAt = new Date(dayDate);
      leadCreatedAt.setHours(leadHours, leadMinutes, 0, 0);

      if (leadCreatedAt.getTime() > nowMs) {
        continue;
      }

      const isQualified = prng() < config.qualificationRate;
      let qualifiedAt: string | null = null;
      let convertedAt: string | null = null;
      let leadStatus: Lead["status"] = "New";

      if (!isQualified) {
        if (dayOffset > 3) {
          leadStatus = prng() < 0.6 ? "Unqualified" : "Contacted";
        } else {
          leadStatus = prng() < 0.5 ? "New" : "Contacted";
        }
      } else {
        const qualDelayHours = randomBetween(2, 36);
        const qualDate = new Date(leadCreatedAt.getTime() + qualDelayHours * 3600000);
        if (qualDate.getTime() <= nowMs) {
          qualifiedAt = qualDate.toISOString();
          leadStatus = "Qualified";
        }
      }

      const leadRecord: Lead = {
        id: leadId,
        contactName,
        company,
        city,
        source,
        owner,
        createdAt: leadCreatedAt.toISOString(),
        qualifiedAt,
        convertedAt: null,
        status: leadStatus
      };

      activities.push({
        id: `ACT-${++actSeq}`,
        timestamp: leadCreatedAt.toISOString(),
        user: owner,
        action: `Received new lead from ${source}`,
        recordReference: { type: "lead", id: leadId, label: contactName }
      });

      if (qualifiedAt) {
        const numQuotes = randomInt(1, 3);
        let acceptedQuote: Quotation | null = null;

        for (let q = 0; q < numQuotes; q++) {
          quoteSeq++;
          const quoteId = `QT-${quoteSeq}`;
          const serviceItem = pick(SERVICES);
          const basePrice = randomBetween(serviceItem.minPrice, serviceItem.maxPrice);
          const scaleFactor = config.averageDealValue / 24000;
          const quoteAmount = Math.round((basePrice * scaleFactor) / 500) * 500;

          const quoteDelayHours = randomBetween(3, 48) + q * 18;
          const quoteDate = new Date(new Date(qualifiedAt).getTime() + quoteDelayHours * 3600000);

          if (quoteDate.getTime() > nowMs) {
            break;
          }

          let quoteStatus: QuotationStatus = "Pending";
          let decidedAt: string | null = null;

          const quoteAgeDays = (nowMs - quoteDate.getTime()) / 86400000;
          if (quoteAgeDays > 1) {
            if (!acceptedQuote && prng() < config.quoteAcceptanceRate) {
              quoteStatus = "Accepted";
              const decisionHours = randomBetween(4, 72);
              const decDate = new Date(quoteDate.getTime() + decisionHours * 3600000);
              if (decDate.getTime() <= nowMs) {
                decidedAt = decDate.toISOString();
              } else {
                quoteStatus = "Pending";
              }
            } else if (quoteAgeDays > 14) {
              quoteStatus = prng() < 0.65 ? "Expired" : "Rejected";
              decidedAt = new Date(quoteDate.getTime() + randomBetween(24, 120) * 3600000).toISOString();
            } else if (prng() < 0.35) {
              quoteStatus = "Rejected";
              decidedAt = new Date(quoteDate.getTime() + randomBetween(12, 72) * 3600000).toISOString();
            }
          }

          const quotationRecord: Quotation = {
            id: quoteId,
            leadId,
            service: serviceItem.name,
            amount: quoteAmount,
            createdAt: quoteDate.toISOString(),
            status: quoteStatus,
            decidedAt,
            owner
          };

          quotations.push(quotationRecord);

          if (quoteStatus === "Accepted" && decidedAt && !acceptedQuote) {
            acceptedQuote = quotationRecord;
            convertedAt = decidedAt;
            leadRecord.convertedAt = decidedAt;
            leadRecord.status = "Converted";

            activities.push({
              id: `ACT-${++actSeq}`,
              timestamp: decidedAt,
              user: owner,
              action: `Accepted quotation for ${serviceItem.name}`,
              recordReference: { type: "quotation", id: quoteId, label: `QT #${quoteId}` }
            });
          }
        }

        if (acceptedQuote && convertedAt) {
          dealSeq++;
          const dealId = `DL-${dealSeq}`;
          const serviceItem = SERVICES.find((s) => s.name === acceptedQuote!.service) || SERVICES[0];
          const dealValue = acceptedQuote.amount;
          const priority: Deal["priority"] = dealValue >= 30000 ? "High" : dealValue >= 12000 ? "Medium" : "Low";

          const dealCreatedAt = convertedAt;
          const dealAgeDays = (nowMs - new Date(dealCreatedAt).getTime()) / 86400000;

          let stage: Deal["stage"] = "Documentation";
          if (dealAgeDays > 30) {
            stage = prng() < 0.85 ? "Closed" : "Delivery";
          } else if (dealAgeDays > 18) {
            stage = prng() < 0.7 ? "Delivery" : "Government review";
          } else if (dealAgeDays > 8) {
            stage = prng() < 0.65 ? "Government review" : "Filing";
          } else if (dealAgeDays > 3) {
            stage = prng() < 0.7 ? "Filing" : "Documentation";
          }

          const dealRecord: Deal = {
            id: dealId,
            leadId,
            quotationId: acceptedQuote.id,
            service: acceptedQuote.service,
            category: serviceItem.category,
            value: dealValue,
            priority,
            stage,
            createdAt: dealCreatedAt,
            owner
          };

          deals.push(dealRecord);

          activities.push({
            id: `ACT-${++actSeq}`,
            timestamp: dealCreatedAt,
            user: owner,
            action: `Created deal for ${acceptedQuote.service}`,
            recordReference: { type: "deal", id: dealId, label: `Deal #${dealId}` }
          });

          const numOrders = randomInt(1, 2);
          for (let o = 0; o < numOrders; o++) {
            orderSeq++;
            const orderId = `OD-${orderSeq}`;
            const assignee = pick(OPERATIONS_TEAM);
            const stagesTotal = randomInt(3, 5);

            const orderCreatedAt = new Date(new Date(dealCreatedAt).getTime() + randomBetween(1, 24) * 3600000);
            if (orderCreatedAt.getTime() > nowMs) {
              continue;
            }

            const dueDays = randomInt(7, 21);
            const dueAt = new Date(orderCreatedAt.getTime() + dueDays * 86400000);

            let stagesCompleted = 0;
            let orderStatus: OrderStatus = "Pending";
            let completedAt: string | null = null;

            if (stage === "Closed") {
              stagesCompleted = stagesTotal;
              orderStatus = "Completed";
              const compDate = new Date(orderCreatedAt.getTime() + randomBetween(5, dueDays - 1) * 86400000);
              completedAt = compDate.getTime() <= nowMs ? compDate.toISOString() : new Date(nowMs - 3600000).toISOString();
            } else if (stage === "Delivery") {
              stagesCompleted = Math.max(1, stagesTotal - 1);
              orderStatus = "In progress";
            } else if (stage === "Government review" || stage === "Filing") {
              stagesCompleted = randomInt(1, Math.max(1, stagesTotal - 2));
              orderStatus = prng() < 0.15 ? "On hold" : "In progress";
            } else {
              stagesCompleted = 0;
              orderStatus = prng() < 0.4 ? "Pending" : "In progress";
            }

            if (nowMs > dueAt.getTime() && orderStatus !== "Completed") {
              if (prng() < 0.3) {
                stagesCompleted = Math.min(stagesCompleted, stagesTotal - 1);
              }
            }

            const orderRecord: Order = {
              id: orderId,
              dealId,
              service: acceptedQuote.service,
              assignee,
              status: orderStatus,
              createdAt: orderCreatedAt.toISOString(),
              dueAt: dueAt.toISOString(),
              completedAt,
              stagesTotal,
              stagesCompleted
            };

            orders.push(orderRecord);

            const numInstallments = dealValue > 25000 ? 2 : 1;
            const installmentAmount = Math.round(dealValue / numInstallments);

            for (let p = 0; p < numInstallments; p++) {
              paymentSeq++;
              const paymentId = `PM-${paymentSeq}`;
              const method = pickPaymentMethod();
              const invoiceNo = `INV-2026-${paymentSeq}`;

              const paymentDue = new Date(orderCreatedAt.getTime() + p * 14 * 86400000);
              let paymentStatus: PaymentStatus = "Pending";
              let paidAt: string | null = null;

              const paymentAgeDays = (nowMs - paymentDue.getTime()) / 86400000;
              if (paymentAgeDays >= 0) {
                if (stage === "Closed" || p === 0 || prng() < 0.78) {
                  paymentStatus = "Received";
                  const paidDelay = randomBetween(0.5, config.paymentDelayDays * 24);
                  const pDate = new Date(paymentDue.getTime() + paidDelay * 3600000);
                  paidAt = pDate.getTime() <= nowMs ? pDate.toISOString() : new Date(nowMs - 7200000).toISOString();
                } else if (paymentAgeDays > 10 && prng() < 0.12) {
                  paymentStatus = "Failed";
                }
              }

              payments.push({
                id: paymentId,
                dealId,
                orderId: orderRecord.id,
                amount: p === numInstallments - 1 ? dealValue - installmentAmount * (numInstallments - 1) : installmentAmount,
                method,
                status: paymentStatus,
                dueAt: paymentDue.toISOString(),
                paidAt,
                invoiceNo
              });
            }
          }
        }
      }

      leads.push(leadRecord);
    }
  }

  for (let recentDay = 13; recentDay >= 0; recentDay--) {
    const targetDayMs = nowMs - recentDay * 86400000;
    const targetDayStart = new Date(targetDayMs);
    targetDayStart.setHours(9, 0, 0, 0);

    const quotesOnDay = quotations.filter((q) => {
      const qTime = new Date(q.createdAt).getTime();
      return Math.abs(qTime - targetDayStart.getTime()) < 43200000;
    });

    if (quotesOnDay.length === 0 && leads.length > 0) {
      quoteSeq++;
      const quoteId = `QT-${quoteSeq}`;
      const randomLead = pick(leads);
      const serviceItem = pick(SERVICES);
      const amount = Math.round(randomBetween(serviceItem.minPrice, serviceItem.maxPrice) / 500) * 500;
      quotations.push({
        id: quoteId,
        leadId: randomLead.id,
        service: serviceItem.name,
        amount,
        createdAt: targetDayStart.toISOString(),
        status: "Pending",
        decidedAt: null,
        owner: randomLead.owner
      });
    }

    const paymentsOnDay = payments.filter((p) => {
      if (!p.paidAt) return false;
      const pTime = new Date(p.paidAt).getTime();
      return Math.abs(pTime - targetDayStart.getTime()) < 43200000;
    });

    if (paymentsOnDay.length === 0 && deals.length > 0) {
      paymentSeq++;
      const paymentId = `PM-${paymentSeq}`;
      const randomDeal = pick(deals);
      payments.push({
        id: paymentId,
        dealId: randomDeal.id,
        orderId: null,
        amount: Math.round(randomDeal.value * 0.5),
        method: pickPaymentMethod(),
        status: "Received",
        dueAt: targetDayStart.toISOString(),
        paidAt: targetDayStart.toISOString(),
        invoiceNo: `INV-2026-${paymentSeq}`
      });
    }
  }

  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    leads,
    quotations,
    deals,
    orders,
    payments,
    activities: activities.slice(0, 100)
  };
}
