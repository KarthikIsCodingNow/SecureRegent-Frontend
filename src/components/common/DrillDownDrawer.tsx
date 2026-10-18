import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ArrowRight } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { StatusChip, StatusTone } from "./StatusChip";
import { formatCurrency } from "../../utils/formatters";

export interface DrillDownItem {
  id: string;
  type: "lead" | "deal" | "order" | "quotation";
  title: string;
  subtitle: string;
  date: string;
  amount?: number;
  status: string;
  statusTone?: StatusTone;
}

interface DrillDownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  items: DrillDownItem[];
}

export const DrillDownDrawer: React.FC<DrillDownDrawerProps> = ({
  open,
  onOpenChange,
  title,
  subtitle,
  items
}) => {
  const navigate = useNavigate();

  const handleRowClick = (item: DrillDownItem) => {
    onOpenChange(false);
    if (item.type === "lead") {
      navigate(`/app/leads/${item.id}`);
    } else if (item.type === "deal") {
      navigate(`/app/deals/${item.id}`);
    } else if (item.type === "order") {
      navigate(`/app/orders/${item.id}`);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 z-40 transition-opacity animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-0 right-0 bottom-0 w-full sm:w-[520px] bg-card shadow-2xl z-50 flex flex-col rounded-l-[24px] outline-none animate-in slide-in-from-right duration-250 ease-out">
          <div className="p-6 border-b border-hairline flex items-center justify-between">
            <div>
              <Dialog.Title className="text-xl font-medium font-display text-text-primary">
                {title}
              </Dialog.Title>
              {subtitle && (
                <Dialog.Description className="text-xs text-text-secondary mt-1">
                  {subtitle}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-canvas transition-colors"
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-4 bg-canvas/40 border-b border-hairline flex items-center justify-between text-xs text-text-secondary">
            <span>Showing {items.length} records</span>
            <span>Click row for full detail</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-hairline">
            {items.length === 0 ? (
              <div className="p-8 text-center text-sm text-text-secondary">
                No matching records found.
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleRowClick(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleRowClick(item);
                    }
                  }}
                  className="p-4 hover:bg-canvas/50 transition-colors cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-medium text-text-tertiary">
                        {item.id}
                      </span>
                      <StatusChip
                        label={item.status}
                        tone={item.statusTone || "neutral"}
                      />
                    </div>
                    <div className="text-sm font-medium text-text-primary truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-text-secondary truncate mt-0.5">
                      {item.subtitle}
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div>
                      {item.amount !== undefined && (
                        <div className="text-sm font-medium text-text-primary tabular">
                          {formatCurrency(item.amount)}
                        </div>
                      )}
                      <div className="text-xs text-text-tertiary">
                        {item.date}
                      </div>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-text-tertiary group-hover:text-accent group-hover:translate-x-0.5 transition-all"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
