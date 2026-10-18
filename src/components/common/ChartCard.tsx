import React from "react";
import { SlidersHorizontal } from "@phosphor-icons/react";
import clsx from "clsx";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  onOpenSettings?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  action,
  onOpenSettings,
  children,
  className = ""
}) => {
  return (
    <div
      className={clsx(
        "bg-card rounded-card p-6 shadow-card flex flex-col justify-between transition-all duration-200",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-normal text-text-secondary">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-text-tertiary mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {action}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-full text-text-tertiary hover:text-text-primary hover:bg-canvas transition-colors"
              aria-label={`Configure ${title} chart`}
            >
              <SlidersHorizontal size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="w-full flex-1 min-h-0">{children}</div>
    </div>
  );
};
