import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CaretRight, CaretDown } from "@phosphor-icons/react";
import { useDataStore } from "@/store/dataStore";
import { useSettingsStore } from "@/store/settingsStore";
import { StatusChip } from "@/components/common/StatusChip";
import { formatCurrency, formatRelativeTime } from "@/utils/formatters";

export const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dataset } = useDataStore();
  const currencySymbol = useSettingsStore((s) => s.charts.currencySymbol);

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    quotes: true,
    deals: true,
    orders: true,
    payments: true
  });

  const toggleNode = (node: string) => {
    setExpandedNodes((prev) => ({ ...prev, [node]: !prev[node] }));
  };

  const lead = dataset.leads.find((l) => l.id === id);

  if (!lead) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-display font-medium text-text-primary mb-2">Lead not found</h2>
        <p className="text-xs text-text-secondary mb-6">The specified lead ID does not exist.</p>
        <button
          onClick={() => navigate("/app/leads")}
          className="px-4 py-2 rounded-full bg-accent text-white text-xs font-medium"
        >
          Return to leads
        </button>
      </div>
    );
  }

  const quotations = dataset.quotations.filter((q) => q.leadId === lead.id);
  const deals = dataset.deals.filter((d) => d.leadId === lead.id);
  const dealIds = new Set(deals.map((d) => d.id));
  const orders = dataset.orders.filter((o) => dealIds.has(o.dealId));
  const payments = dataset.payments.filter((p) => dealIds.has(p.dealId));

  const totalBooked = deals.reduce((sum, d) => sum + d.value, 0);
  const totalCollected = payments
    .filter((p) => p.status === "Received")
    .reduce((sum, p) => sum + p.amount, 0);
  const outstanding = Math.max(0, totalBooked - totalCollected);

  const activities = dataset.activities.filter(
    (a) => a.recordReference.id === lead.id || quotations.some((q) => q.id === a.recordReference.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 hover:text-text-primary font-medium transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back</span>
        </button>
        <span>/</span>
        <Link to="/app/leads" className="hover:text-text-primary transition-colors">
          Leads
        </Link>
        <span>/</span>
        <span className="text-text-primary font-mono">{lead.id}</span>
      </div>

      <div className="bg-card rounded-card shadow-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-display font-medium text-text-primary">
              {lead.contactName}
            </h1>
            <StatusChip
              label={lead.status}
              tone={
                lead.status === "Converted"
                  ? "positive"
                  : lead.status === "Unqualified"
                  ? "negative"
                  : "accent"
              }
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
            <span>{lead.company}</span>
            <span>·</span>
            <span>{lead.city}</span>
            <span>·</span>
            <span>Source: {lead.source}</span>
            <span>·</span>
            <span>Owner: {lead.owner}</span>
            <span>·</span>
            <span className="tabular">Created: {lead.createdAt.slice(0, 10)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-text-secondary block">Total booked value</span>
            <span className="text-xl font-display font-medium text-text-primary tabular">
              {formatCurrency(totalBooked, false, currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-card bg-card shadow-card">
          <span className="text-xs text-text-secondary block mb-1">Quotations</span>
          <span className="text-2xl font-display font-medium text-text-primary tabular">
            {quotations.length}
          </span>
        </div>
        <div className="p-4 rounded-card bg-card shadow-card">
          <span className="text-xs text-text-secondary block mb-1">Deals created</span>
          <span className="text-2xl font-display font-medium text-text-primary tabular">
            {deals.length}
          </span>
        </div>
        <div className="p-4 rounded-card bg-card shadow-card">
          <span className="text-xs text-text-secondary block mb-1">Total collected</span>
          <span className="text-2xl font-display font-medium text-positive tabular">
            {formatCurrency(totalCollected, true, currencySymbol)}
          </span>
        </div>
        <div className="p-4 rounded-card bg-card shadow-card">
          <span className="text-xs text-text-secondary block mb-1">Outstanding</span>
          <span className="text-2xl font-display font-medium text-warning tabular">
            {formatCurrency(outstanding, true, currencySymbol)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-card shadow-card p-6">
          <h3 className="text-sm font-medium text-text-primary mb-1">
            Commercial relationship tree
          </h3>
          <p className="text-xs text-text-secondary mb-6">
            Hierarchical cascade: Lead &gt; Quotations &gt; Deals &gt; Orders &gt; Payments
          </p>

          <div className="space-y-4">
            <div className="border border-hairline rounded-tile p-4 bg-canvas/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                    Lead: {lead.id}
                  </span>
                  <span className="text-xs text-text-secondary">({lead.contactName})</span>
                </div>
                <StatusChip label={lead.status} tone="accent" />
              </div>

              <div className="mt-4 pl-4 border-l-2 border-hairline space-y-4">
                <div>
                  <div
                    onClick={() => toggleNode("quotes")}
                    className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-text-secondary hover:text-text-primary"
                  >
                    {expandedNodes.quotes ? <CaretDown size={13} /> : <CaretRight size={13} />}
                    <span>Quotations ({quotations.length})</span>
                  </div>

                  {expandedNodes.quotes && (
                    <div className="mt-2 space-y-2 pl-4">
                      {quotations.map((q) => (
                        <div
                          key={q.id}
                          className="p-3 bg-card rounded-tile border border-hairline flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-mono text-text-tertiary mr-2">{q.id}</span>
                            <span className="font-medium text-text-primary">{q.service}</span>
                            <span className="text-text-secondary ml-2">by {q.owner}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-medium tabular text-text-primary">
                              {formatCurrency(q.amount, false, currencySymbol)}
                            </span>
                            <StatusChip
                              label={q.status}
                              tone={q.status === "Accepted" ? "positive" : q.status === "Rejected" ? "negative" : "warning"}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div
                    onClick={() => toggleNode("deals")}
                    className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-text-secondary hover:text-text-primary"
                  >
                    {expandedNodes.deals ? <CaretDown size={13} /> : <CaretRight size={13} />}
                    <span>Deals & Contracts ({deals.length})</span>
                  </div>

                  {expandedNodes.deals && (
                    <div className="mt-2 space-y-3 pl-4">
                      {deals.map((d) => {
                        const linkedOrders = orders.filter((o) => o.dealId === d.id);
                        const linkedPayments = payments.filter((p) => p.dealId === d.id);
                        return (
                          <div
                            key={d.id}
                            className="p-4 bg-card rounded-tile border border-hairline space-y-3"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div>
                                <Link
                                  to={`/app/deals/${d.id}`}
                                  className="font-mono text-accent hover:underline mr-2"
                                >
                                  {d.id}
                                </Link>
                                <span className="font-medium text-text-primary">{d.service}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium tabular text-text-primary">
                                  {formatCurrency(d.value, false, currencySymbol)}
                                </span>
                                <StatusChip label={d.stage} tone={d.stage === "Closed" ? "positive" : "accent"} />
                              </div>
                            </div>

                            <div className="pl-4 border-l border-hairline space-y-2 text-xs">
                              <div className="text-[11px] font-semibold text-text-tertiary uppercase">
                                Orders ({linkedOrders.length})
                              </div>
                              {linkedOrders.map((o) => (
                                <div
                                  key={o.id}
                                  className="flex items-center justify-between p-2 bg-canvas/40 rounded-tile"
                                >
                                  <div>
                                    <Link
                                      to={`/app/orders/${o.id}`}
                                      className="font-mono text-accent hover:underline mr-2"
                                    >
                                      {o.id}
                                    </Link>
                                    <span className="text-text-secondary">Assignee: {o.assignee}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="tabular text-text-tertiary">
                                      {o.stagesCompleted}/{o.stagesTotal} stages
                                    </span>
                                    <StatusChip label={o.status} tone={o.status === "Completed" ? "positive" : "warning"} />
                                  </div>
                                </div>
                              ))}

                              <div className="text-[11px] font-semibold text-text-tertiary uppercase pt-1">
                                Payments ({linkedPayments.length})
                              </div>
                              {linkedPayments.map((p) => (
                                <div
                                  key={p.id}
                                  className="flex items-center justify-between p-2 bg-canvas/40 rounded-tile"
                                >
                                  <div>
                                    <span className="font-mono text-text-tertiary mr-2">{p.invoiceNo}</span>
                                    <span className="text-text-secondary">{p.method}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium tabular text-text-primary">
                                      {formatCurrency(p.amount, false, currencySymbol)}
                                    </span>
                                    <StatusChip
                                      label={p.status}
                                      tone={p.status === "Received" ? "positive" : "warning"}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-card shadow-card p-6">
          <h3 className="text-sm font-medium text-text-primary mb-1">
            Activity timeline
          </h3>
          <p className="text-xs text-text-secondary mb-6">
            Chronological audit events for this contact
          </p>

          <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-hairline">
            {activities.length === 0 ? (
              <div className="text-xs text-text-secondary py-4">
                No recent activity records.
              </div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="relative pl-7 text-xs">
                  <div className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-card border-2 border-accent flex items-center justify-center" />
                  <div className="font-medium text-text-primary">{act.action}</div>
                  <div className="text-[11px] text-text-secondary mt-0.5">
                    User: {act.user} · {formatRelativeTime(act.timestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
