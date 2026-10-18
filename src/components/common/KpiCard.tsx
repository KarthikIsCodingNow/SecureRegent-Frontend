import React from "react";
import { CaretUp, CaretDown, Minus } from "@phosphor-icons/react";
import clsx from "clsx";
import { DeltaResult } from "../../utils/formatters";
import { AnalogRollingCounter } from "./AnalogRollingCounter";

interface KpiCardProps {
  label: string;
  value: string | number;
  formattedValue?: string;
  delta?: DeltaResult;
  sparklineData?: number[];
  onClick?: () => void;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  formattedValue,
  delta,
  sparklineData = [10, 14, 12, 18, 16, 22, 25],
  onClick,
  className = ""
}) => {
  const maxVal = Math.max(...sparklineData, 1);
  const minVal = Math.min(...sparklineData, 0);
  const range = maxVal - minVal || 1;
  const width = 120;
  const height = 36;
  const step = width / (sparklineData.length - 1);

  const points = sparklineData
    .map((val, idx) => {
      const x = idx * step;
      const y = height - ((val - minVal) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;
  const displayString = formattedValue !== undefined ? formattedValue : String(value);

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={clsx(
        "bg-card rounded-card p-6 shadow-card transition-all duration-200 flex flex-col justify-between relative overflow-hidden",
        onClick && "cursor-pointer hover:-translate-y-0.5 hover:shadow-flyout",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-sm font-normal text-text-secondary truncate">
          {label}
        </span>
        {delta && (
          <div
            className={clsx(
              "flex items-center gap-1 text-xs font-medium tabular px-2 py-0.5 rounded-full shrink-0",
              delta.isNeutral
                ? "bg-text-tertiary/10 text-text-tertiary"
                : delta.isPositive
                ? "bg-positive/10 text-positive"
                : "bg-negative/10 text-negative"
            )}
          >
            {delta.isNeutral ? (
              <Minus size={12} weight="bold" />
            ) : delta.value > 0 ? (
              <CaretUp size={12} weight="fill" />
            ) : (
              <CaretDown size={12} weight="fill" />
            )}
            <span>{delta.text}</span>
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-4 mt-1">
        <div className="font-display text-[36px] leading-[40px] font-medium tracking-tight text-text-primary tabular">
          <AnalogRollingCounter value={displayString} />
        </div>

        <div className="shrink-0 w-[120px] h-[36px]">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${width} ${height}`}
            className="overflow-visible"
            aria-hidden="true"
          >
            <polygon
              points={areaPoints}
              fill="var(--accent)"
              fillOpacity="0.08"
            />
            <polyline
              points={points}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
