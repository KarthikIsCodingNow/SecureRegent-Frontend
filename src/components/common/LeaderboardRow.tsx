import React from "react";
import { CaretUp, CaretDown, Minus } from "@phosphor-icons/react";
import clsx from "clsx";

interface LeaderboardRowProps {
  rank: number;
  rankChange?: number;
  name: string;
  subtitle: string;
  metric: string;
  secondaryMetric?: string;
  onClick?: () => void;
  className?: string;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  rank,
  rankChange = 0,
  name,
  subtitle,
  metric,
  secondaryMetric,
  onClick,
  className = ""
}) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
        "flex items-center justify-between py-3 transition-colors",
        onClick && "cursor-pointer hover:bg-canvas/50 px-2 rounded-tile -mx-2",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-1 w-7 text-xs text-text-tertiary tabular shrink-0">
          <span className="font-medium text-text-secondary">{rank}</span>
          {rankChange > 0 ? (
            <CaretUp size={11} weight="fill" className="text-positive" />
          ) : rankChange < 0 ? (
            <CaretDown size={11} weight="fill" className="text-negative" />
          ) : (
            <Minus size={9} weight="bold" className="text-text-tertiary opacity-40" />
          )}
        </div>

        <div className="w-8 h-8 rounded-full bg-accent-soft text-accent text-xs font-medium flex items-center justify-center shrink-0">
          {initials}
        </div>

        <div className="min-w-0">
          <div className="text-sm font-medium text-text-primary truncate">{name}</div>
          <div className="text-xs text-text-secondary truncate">{subtitle}</div>
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-sm font-medium text-text-primary tabular">{metric}</div>
        {secondaryMetric && (
          <div className="text-xs text-text-tertiary tabular">{secondaryMetric}</div>
        )}
      </div>
    </div>
  );
};
