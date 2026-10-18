import React, { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { CalendarBlank, CaretDown, Check } from "@phosphor-icons/react";
import clsx from "clsx";
import { format } from "date-fns";

export interface TimeframePopoverProps {
  timeframe: "today" | "last7" | "last30" | "custom";
  customStart: string | null;
  customEnd: string | null;
  resolvedStart: Date;
  resolvedEnd: Date;
  onApply: (timeframe: "today" | "last7" | "last30" | "custom", start?: string, end?: string) => void;
}

export const TimeframePopover: React.FC<TimeframePopoverProps> = ({
  timeframe,
  customStart,
  customEnd,
  resolvedStart,
  resolvedEnd,
  onApply
}) => {
  const [open, setOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<"today" | "last7" | "last30" | "custom">(timeframe);
  const [startDateStr, setStartDateStr] = useState<string>(
    customStart || format(resolvedStart, "yyyy-MM-dd")
  );
  const [endDateStr, setEndDateStr] = useState<string>(
    customEnd || format(resolvedEnd, "yyyy-MM-dd")
  );

  const presets = [
    { id: "today", label: "Today" },
    { id: "last7", label: "Last 7 days" },
    { id: "last30", label: "Last 30 days" },
    { id: "custom", label: "Custom range" }
  ] as const;

  const handlePresetClick = (presetId: "today" | "last7" | "last30" | "custom") => {
    setSelectedPreset(presetId);
    if (presetId !== "custom") {
      onApply(presetId);
      setOpen(false);
    }
  };

  const handleApplyCustom = () => {
    let s = startDateStr;
    let e = endDateStr;
    if (new Date(s).getTime() > new Date(e).getTime()) {
      const tmp = s;
      s = e;
      e = tmp;
    }
    onApply("custom", s, e);
    setOpen(false);
  };

  const labelText = `${format(resolvedStart, "MMM d")} – ${format(resolvedEnd, "MMM d, yyyy")}`;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card hover:bg-canvas border border-hairline text-sm text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={`Timeframe: ${labelText}`}
        >
          <CalendarBlank size={15} className="text-text-secondary" />
          <span className="text-xs text-text-secondary font-medium">Timeframe:</span>
          <span className="font-medium tabular text-xs sm:text-sm">{labelText}</span>
          <CaretDown size={12} className="text-text-tertiary" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className="bg-card rounded-card shadow-flyout border border-hairline p-4 z-50 flex flex-col md:flex-row gap-4 outline-none w-[320px] md:w-[480px] animate-in fade-in-50 zoom-in-95 duration-150"
        >
          <div className="flex flex-col gap-1 md:w-44 border-b md:border-b-0 md:border-r border-hairline pb-3 md:pb-0 md:pr-3">
            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider px-2.5 mb-1">
              Presets
            </span>
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset.id)}
                className={clsx(
                  "flex items-center justify-between px-3 py-2 rounded-full text-xs font-medium transition-colors text-left",
                  selectedPreset === preset.id
                    ? "bg-accent-soft text-accent"
                    : "text-text-secondary hover:bg-canvas hover:text-text-primary"
                )}
              >
                <span>{preset.label}</span>
                {selectedPreset === preset.id && <Check size={14} weight="bold" />}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider block">
                Custom date range
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-text-secondary block mb-1">From</label>
                  <input
                    type="date"
                    value={startDateStr}
                    onChange={(e) => {
                      setStartDateStr(e.target.value);
                      setSelectedPreset("custom");
                    }}
                    className="w-full px-2.5 py-1.5 rounded-tile bg-canvas border border-hairline text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary block mb-1">To</label>
                  <input
                    type="date"
                    value={endDateStr}
                    onChange={(e) => {
                      setEndDateStr(e.target.value);
                      setSelectedPreset("custom");
                    }}
                    className="w-full px-2.5 py-1.5 rounded-tile bg-canvas border border-hairline text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-hairline">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-text-secondary hover:bg-canvas transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustom}
                className="px-4 py-1.5 rounded-full text-xs font-medium bg-accent text-white hover:opacity-90 transition-opacity"
              >
                Apply range
              </button>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
