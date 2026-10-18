import React from "react";
import { CaretUp, CaretDown, Minus, ArrowsOutSimple } from "@phosphor-icons/react";
import clsx from "clsx";
import { DeltaResult } from "../../utils/formatters";
import { AnalogRollingCounter } from "./AnalogRollingCounter";
import { TiltElement } from "./TiltElement";

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

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!onClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (typeof window !== "undefined") {
      (window as unknown as { __lastDrillDownOrigin?: { x: number; y: number; width?: number; height?: number } }).__lastDrillDownOrigin = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height
      };
    }
    onClick();
  };

  return (
    <TiltElement
      maxTilt={9}
      scale={onClick ? 1.02 : 1.0}
      elevation={10}
      onLongPress={onClick}
      onClick={onClick ? handleClick : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          const rect = e.currentTarget.getBoundingClientRect();
          if (typeof window !== "undefined") {
            (window as unknown as { __lastDrillDownOrigin?: { x: number; y: number; width?: number; height?: number } }).__lastDrillDownOrigin = {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
              width: rect.width,
              height: rect.height
            };
          }
          onClick();
        }
      }}
      className={clsx(
        "group bg-card rounded-card p-4 sm:p-5 shadow-card transition-all flex flex-col justify-between relative overflow-hidden",
        onClick && "cursor-pointer hover:border-accent/40",
        className
      )}
    >
      <div className="flex items-start justify-between gap-1.5 mb-2.5">
        <span
          className="text-xs sm:text-[13px] 2xl:text-sm font-medium text-text-secondary leading-snug line-clamp-2 min-h-[2.5em] flex-1 group-hover:text-text-primary transition-colors"
          title={label}
        >
          {label}
        </span>
        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
          {onClick && (
            <span
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-text-tertiary group-hover:text-accent bg-canvas/60 border border-hairline/60"
              title="Expand analytics view"
            >
              <ArrowsOutSimple size={11} weight="bold" />
            </span>
          )}
          {delta && (
            <div
              className={clsx(
                "flex items-center gap-0.5 text-[10px] sm:text-[11px] font-medium tabular px-1.5 py-0.5 rounded-full shrink-0",
                delta.isNeutral
                  ? "bg-text-tertiary/10 text-text-tertiary"
                  : delta.isPositive
                  ? "bg-positive/10 text-positive"
                  : "bg-negative/10 text-negative"
              )}
            >
              {delta.isNeutral ? (
                <Minus size={10} weight="bold" />
              ) : delta.value > 0 ? (
                <CaretUp size={10} weight="fill" />
              ) : (
                <CaretDown size={10} weight="fill" />
              )}
              <span>{delta.text}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 mt-auto">
        <div className="font-display text-2xl sm:text-[26px] 2xl:text-[30px] leading-tight font-medium tracking-tight text-text-primary tabular min-w-0 truncate">
          <AnalogRollingCounter value={displayString} />
        </div>

        <div className="shrink-0 w-16 sm:w-20 2xl:w-24 h-7 sm:h-8">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
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
    </TiltElement>
  );
};
