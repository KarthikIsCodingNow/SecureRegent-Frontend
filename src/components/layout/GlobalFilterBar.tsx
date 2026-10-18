import React from "react";
import * as Switch from "@radix-ui/react-switch";
import { format } from "date-fns";
import { DateRange, FilterState } from "../../domain/types";
import { SALES_TEAM, OPERATIONS_TEAM, SERVICES } from "../../domain/constants";
import { TimeframePopover } from "./TimeframePopover";
import { PillSelect } from "./PillSelect";

interface GlobalFilterBarProps {
  filter: FilterState;
  onFilterChange: (patch: Partial<FilterState>) => void;
  onReset: () => void;
  currentRange: DateRange;
  previousRange: DateRange;
}

export const GlobalFilterBar: React.FC<GlobalFilterBarProps> = ({
  filter,
  onFilterChange,
  onReset,
  currentRange,
  previousRange
}) => {
  const isDefault =
    filter.timeframe === "last30" &&
    filter.compare === true &&
    filter.user === "all" &&
    filter.department === "all" &&
    filter.service === "all";

  const userOptions = [
    { value: "all", label: "All users" },
    ...SALES_TEAM.map((u) => ({ value: u, label: `${u} (Sales)` })),
    ...OPERATIONS_TEAM.map((u) => ({ value: u, label: `${u} (Ops)` }))
  ];

  const deptOptions = [
    { value: "all", label: "All departments" },
    { value: "Sales", label: "Sales" },
    { value: "Operations", label: "Operations" }
  ];

  const serviceOptions = [
    { value: "all", label: "All services" },
    ...SERVICES.map((s) => ({ value: s.name, label: s.name }))
  ];

  const comparisonLabel = `vs ${format(previousRange.start, "MMM d")} – ${format(
    previousRange.end,
    "MMM d, yyyy"
  )}`;

  return (
    <div className="flex flex-col gap-1.5 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <TimeframePopover
            timeframe={filter.timeframe}
            customStart={filter.customStart}
            customEnd={filter.customEnd}
            resolvedStart={currentRange.start}
            resolvedEnd={currentRange.end}
            onApply={(tf, start, end) =>
              onFilterChange({
                timeframe: tf,
                customStart: start || null,
                customEnd: end || null
              })
            }
          />

          <PillSelect
            labelPrefix="Users"
            value={filter.user}
            options={userOptions}
            onValueChange={(val) => onFilterChange({ user: val })}
            ariaLabel="Filter by user"
          />

          <PillSelect
            labelPrefix="Department"
            value={filter.department}
            options={deptOptions}
            onValueChange={(val) =>
              onFilterChange({
                department: val as "all" | "Sales" | "Operations"
              })
            }
            ariaLabel="Filter by department"
          />

          <PillSelect
            labelPrefix="Service"
            value={filter.service}
            options={serviceOptions}
            onValueChange={(val) => onFilterChange({ service: val })}
            ariaLabel="Filter by service"
          />

          {!isDefault && (
            <button
              onClick={onReset}
              className="text-xs font-medium text-text-tertiary hover:text-text-primary px-2 py-1 rounded-full hover:bg-canvas transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <label
            htmlFor="compare-switch"
            className="text-xs font-medium text-text-secondary cursor-pointer select-none"
          >
            Compare with previous period
          </label>
          <Switch.Root
            id="compare-switch"
            checked={filter.compare}
            onCheckedChange={(checked) => onFilterChange({ compare: checked })}
            className="w-9 h-5 bg-hairline rounded-full relative data-[state=checked]:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[18px]" />
          </Switch.Root>
        </div>
      </div>

      {filter.compare && (
        <div className="text-[11px] text-text-tertiary tabular pl-1">
          {comparisonLabel}
        </div>
      )}
    </div>
  );
};
