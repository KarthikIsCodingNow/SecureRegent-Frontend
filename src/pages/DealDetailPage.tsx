import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, ArrowRight } from "@phosphor-icons/react";
import { useDataStore } from "@/store/dataStore";
import { useSettingsStore } from "@/store/settingsStore";
import { StatusChip } from "@/components/common/StatusChip";
import { formatCurrency } from "@/utils/formatters";
import { DealStage } from "@/domain/types";

export const DealDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dataset } = useDataStore();
  const currencySymbol = useSettingsStore((s) => s.charts.currencySymbol);

  const deal = dataset.deals.find((d) => d.id === id);

  if (!deal) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-display font-medium text-text-primary mb-2">Deal not found</h2>
        <p className="text-xs text-text-secondary mb-6">The specified deal ID does not exist.</p>
        <button
          onClick={() => navigate("/app/deals")}
          className="px-4 py-2 rounded-full bg-accent text-white text-xs font-medium"
        >
          Return to deals
        </button>
      </div>
    );
  }

  const parentLead = dataset.leads.find((l) => l.id === deal.leadId);
  const parentQuote = dataset.quotations.find((q) => q.id === deal.quotationId);
  const orders = dataset.orders.filter((o) => o.dealId === deal.id);
  const payments = dataset.payments.filter((p) => p.dealId === deal.id);

  const totalCollected = payments
    .filter((p) => p.status === "Received")
    .reduce((sum, p) => sum + p.amount, 0);
  const outstanding = Math.max(0, deal.value - totalCollected);
  const percentCollected = deal.value > 0 ? Math.round((totalCollected / deal.value) * 100) : 0;

  const stages: DealStage[] = ["Documentation", "Filing", "Government review", "Delivery", "Closed"];
  const currentStageIndex = stages.indexOf(deal.stage);

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
        <Link to="/app/deals" className="hover:text-text-primary transition-colors">
          Deals
        </Link>
        <span>/</span>
        <span className="text-text-primary font-mono">{deal.id}</span>
      </div>

      <div className="bg-card rounded-card shadow-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-display font-medium text-text-primary">
              {deal.service}
            </h1>
            <StatusChip
              label={deal.stage}
              tone={deal.stage === "Closed" ? "positive" : "accent"}
            />
            <StatusChip
              label={deal.priority}
              tone={deal.priority === "High" ? "negative" : deal.priority === "Medium" ? "warning" : "neutral"}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
            <span>Category: {deal.category}</span>
            <span>·</span>
            <span>Owner: {deal.owner}</span>
            <span>·</span>
            <span className="tabular">Created: {deal.createdAt.slice(0, 10)}</span>
            {parentLead && (
              <>
                <span>·</span>
                <span>
                  Client:{" "}
                  <Link
                    to={`/app/leads/${parentLead.id}`}
                    className="text-accent hover:underline font-medium"
                  >
                    {parentLead.contactName} ({parentLead.company})
                  </Link>
                </span>
              </>
            )}
            {parentQuote && (
              <>
                <span>·</span>
                <span>Quote: {parentQuote.id}</span>
              </>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-text-secondary block">Deal contract value</span>
          <span className="text-2xl font-display font-medium text-text-primary tabular">
            {formatCurrency(deal.value, false, currencySymbol)}
          </span>
        </div>
      </div>

      <div className="bg-card rounded-card shadow-card p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-6">
          Deal fulfillment stage
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex || deal.stage === "Closed";
            const isCurrent = idx === currentStageIndex && deal.stage !== "Closed";

            return (
              <div
                key={stage}
                className="p-3 rounded-tile bg-canvas/60 border border-hairline flex flex-col justify-between h-24"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-text-tertiary">0{idx + 1}</span>
                  {isCompleted ? (
                    <CheckCircle size={16} weight="fill" className="text-positive" />
                  ) : isCurrent ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-hairline" />
                  )}
                </div>
                <div>
                  <span
                    className={`text-xs font-medium block ${
                      isCompleted ? "text-positive" : isCurrent ? "text-accent" : "text-text-secondary"
                    }`}
                  >
                    {stage}
                  </span>
                  <span className="text-[10px] text-text-tertiary mt-0.5 block">
                    {isCompleted ? "Completed" : isCurrent ? "In execution" : "Upcoming"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 w-full sm:w-auto">
            <div>
              <span className="text-xs text-text-tertiary block">Collected</span>
              <span className="text-base font-medium text-positive tabular">
                {formatCurrency(totalCollected, false, currencySymbol)}
              </span>
            </div>
            <div>
              <span className="text-xs text-text-tertiary block">Outstanding</span>
              <span className="text-base font-medium text-warning tabular">
                {formatCurrency(outstanding, false, currencySymbol)}
              </span>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-1">
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Realization</span>
              <span className="tabular font-medium text-text-primary">{percentCollected}%</span>
            </div>
            <div className="h-2 w-full bg-hairline rounded-full overflow-hidden">
              <div
                className="h-full bg-positive rounded-full transition-all"
                style={{ width: `${percentCollected}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-card shadow-card p-6">
          <h3 className="text-sm font-medium text-text-primary mb-1">
            Fulfillment orders ({orders.length})
          </h3>
          <p className="text-xs text-text-secondary mb-4">
            Operational milestones executed for this contract
          </p>

          <div className="divide-y divide-hairline">
            {orders.length === 0 ? (
              <div className="py-6 text-center text-xs text-text-secondary">
                No orders generated for this deal yet.
              </div>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/app/orders/${o.id}`}
                        className="font-mono text-xs text-accent hover:underline font-medium"
                      >
                        {o.id}
                      </Link>
                      <StatusChip
                        label={o.status}
                        tone={o.status === "Completed" ? "positive" : "warning"}
                      />
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      Assignee: {o.assignee} · Due: {o.dueAt.slice(0, 10)}
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <span className="text-xs font-medium tabular text-text-primary">
                      {o.stagesCompleted}/{o.stagesTotal} stages
                    </span>
                    <button
                      onClick={() => navigate(`/app/orders/${o.id}`)}
                      className="p-1 rounded-full text-text-tertiary hover:text-accent hover:bg-canvas transition-colors"
                      aria-label={`View order ${o.id}`}
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card rounded-card shadow-card p-6">
          <h3 className="text-sm font-medium text-text-primary mb-1">
            Payment transactions ({payments.length})
          </h3>
          <p className="text-xs text-text-secondary mb-4">
            Installments and realized receipts
          </p>

          <div className="divide-y divide-hairline">
            {payments.length === 0 ? (
              <div className="py-6 text-center text-xs text-text-secondary">
                No payments registered.
              </div>
            ) : (
              payments.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-text-primary">
                        {p.invoiceNo}
                      </span>
                      <StatusChip
                        label={p.status}
                        tone={p.status === "Received" ? "positive" : p.status === "Failed" ? "negative" : "warning"}
                      />
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      Method: {p.method} · {p.paidAt ? `Paid on ${p.paidAt.slice(0, 10)}` : `Due on ${p.dueAt.slice(0, 10)}`}
                    </div>
                  </div>

                  <div className="text-sm font-medium text-text-primary tabular">
                    {formatCurrency(p.amount, false, currencySymbol)}
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
