import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "@phosphor-icons/react";
import { useDataStore } from "@/store/dataStore";
import { useSettingsStore } from "@/store/settingsStore";
import { StatusChip } from "@/components/common/StatusChip";
import { formatCurrency } from "@/utils/formatters";

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dataset } = useDataStore();
  const currencySymbol = useSettingsStore((s) => s.charts.currencySymbol);

  const order = dataset.orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-display font-medium text-text-primary mb-2">Order not found</h2>
        <p className="text-xs text-text-secondary mb-6">The specified order ID does not exist.</p>
        <button
          onClick={() => navigate("/app/orders")}
          className="px-4 py-2 rounded-full bg-accent text-white text-xs font-medium"
        >
          Return to orders
        </button>
      </div>
    );
  }

  const linkedDeal = dataset.deals.find((d) => d.id === order.dealId);
  const linkedPayments = dataset.payments.filter((p) => p.dealId === order.dealId);

  const nowMs = new Date().getTime();
  const isOverdue = order.status !== "Completed" && new Date(order.dueAt).getTime() < nowMs;

  const stageMilestones = Array.from({ length: order.stagesTotal }, (_, idx) => {
    const isCompleted = idx < order.stagesCompleted || order.status === "Completed";
    const isCurrent = idx === order.stagesCompleted && order.status !== "Completed";
    return {
      index: idx + 1,
      title: `Stage ${idx + 1}: ${
        idx === 0
          ? "Documentation verification"
          : idx === 1
          ? "Portal filing"
          : idx === 2
          ? "Authority review"
          : idx === 3
          ? "Statutory approval"
          : "Final dispatch"
      }`,
      isCompleted,
      isCurrent
    };
  });

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
        <Link to="/app/orders" className="hover:text-text-primary transition-colors">
          Orders
        </Link>
        <span>/</span>
        <span className="text-text-primary font-mono">{order.id}</span>
      </div>

      <div className="bg-card rounded-card shadow-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-display font-medium text-text-primary">
              {order.service}
            </h1>
            <StatusChip
              label={order.status}
              tone={
                order.status === "Completed"
                  ? "positive"
                  : isOverdue
                  ? "negative"
                  : order.status === "On hold"
                  ? "warning"
                  : "accent"
              }
            />
            {isOverdue && (
              <span className="text-xs font-medium text-negative bg-negative/10 px-2 py-0.5 rounded-full">
                Overdue
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
            <span>Assignee: {order.assignee}</span>
            <span>·</span>
            <span className="tabular">Created: {order.createdAt.slice(0, 10)}</span>
            <span>·</span>
            <span className="tabular">Target due: {order.dueAt.slice(0, 10)}</span>
            {linkedDeal && (
              <>
                <span>·</span>
                <span>
                  Linked deal:{" "}
                  <Link
                    to={`/app/deals/${linkedDeal.id}`}
                    className="text-accent hover:underline font-mono font-medium"
                  >
                    {linkedDeal.id}
                  </Link>
                </span>
              </>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-text-secondary block">Milestone completion</span>
          <span className="text-2xl font-display font-medium text-text-primary tabular">
            {order.stagesCompleted} of {order.stagesTotal} stages
          </span>
        </div>
      </div>

      <div className="bg-card rounded-card shadow-card p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-6">
          Operational stage milestones
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {stageMilestones.map((m) => (
            <div
              key={m.index}
              className="p-3 rounded-tile bg-canvas/60 border border-hairline flex flex-col justify-between h-28"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-text-tertiary">0{m.index}</span>
                {m.isCompleted ? (
                  <CheckCircle size={16} weight="fill" className="text-positive" />
                ) : m.isCurrent ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-hairline" />
                )}
              </div>
              <div>
                <span
                  className={`text-xs font-medium block ${
                    m.isCompleted ? "text-positive" : m.isCurrent ? "text-accent" : "text-text-secondary"
                  }`}
                >
                  {m.title}
                </span>
                <span className="text-[10px] text-text-tertiary mt-0.5 block">
                  {m.isCompleted ? "Completed" : m.isCurrent ? "In execution" : "Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-card shadow-card p-6">
        <h3 className="text-sm font-medium text-text-primary mb-1">
          Linked deal payment transactions ({linkedPayments.length})
        </h3>
        <p className="text-xs text-text-secondary mb-4">
          Financial realization status for associated contract
        </p>

        <div className="divide-y divide-hairline">
          {linkedPayments.length === 0 ? (
            <div className="py-6 text-center text-xs text-text-secondary">
              No linked payment records found.
            </div>
          ) : (
            linkedPayments.map((p) => (
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
  );
};
