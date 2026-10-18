import React from "react";
import clsx from "clsx";

export type StatusTone = "positive" | "negative" | "warning" | "neutral" | "accent";

interface StatusChipProps {
  label: string;
  tone?: StatusTone;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  label,
  tone = "neutral",
  className = ""
}) => {
  const toneClasses: Record<StatusTone, string> = {
    positive: "bg-positive/10 text-positive",
    negative: "bg-negative/10 text-negative",
    warning: "bg-warning/15 text-warning",
    accent: "bg-accent-soft text-accent",
    neutral: "bg-text-tertiary/10 text-text-secondary"
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium tabular",
        toneClasses[tone],
        className
      )}
    >
      {label}
    </span>
  );
};
