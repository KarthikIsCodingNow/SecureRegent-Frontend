import React from "react";
import clsx from "clsx";

export type ProgressTone = "strong" | "weak" | "neutral" | "accent";

interface ProgressRowProps {
  label: string;
  value: string | number;
  secondaryValue?: string;
  percent: number;
  tone?: ProgressTone;
  dotColor?: string;
  onClick?: () => void;
  className?: string;
}

export const ProgressRow: React.FC<ProgressRowProps> = ({
  label,
  value,
  secondaryValue,
  percent,
  tone = "neutral",
  dotColor,
  onClick,
  className = ""
}) => {
  const clampedPercent = Math.min(Math.max(percent, 0), 100);

  const getBarFill = (): string => {
    if (tone === "strong") {
      return "linear-gradient(90deg, #6EE7B7 0%, #2FBF71 100%)";
    }
    if (tone === "weak") {
      return "linear-gradient(90deg, #F5A524 0%, #E5484D 100%)";
    }
    if (dotColor) {
      return dotColor;
    }
    return "var(--accent)";
  };

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
        "flex items-center gap-4 py-2.5 transition-colors group",
        onClick && "cursor-pointer hover:bg-canvas/50 px-2 rounded-tile -mx-2",
        className
      )}
    >
      <div className="flex items-center gap-2.5 w-1/3 min-w-[140px] truncate">
        {dotColor && (
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: dotColor }}
          />
        )}
        <span className="text-sm font-normal text-text-primary truncate">
          {label}
        </span>
      </div>

      <div className="flex-1 h-2 bg-hairline/60 rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${clampedPercent}%`,
            background: getBarFill()
          }}
        />
      </div>

      <div className="flex items-center gap-2 shrink-0 text-right min-w-[70px] justify-end">
        <span className="text-sm font-medium text-text-primary tabular">
          {value}
        </span>
        {secondaryValue && (
          <span className="text-xs text-text-tertiary tabular">
            {secondaryValue}
          </span>
        )}
      </div>
    </div>
  );
};
