import React from "react";
import * as Select from "@radix-ui/react-select";
import { CaretDown, Check } from "@phosphor-icons/react";

interface PillSelectOption {
  value: string;
  label: string;
}

interface PillSelectProps {
  labelPrefix: string;
  value: string;
  options: PillSelectOption[];
  onValueChange: (val: string) => void;
  ariaLabel: string;
}

export const PillSelect: React.FC<PillSelectProps> = ({
  labelPrefix,
  value,
  options,
  onValueChange,
  ariaLabel
}) => {
  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger
        aria-label={ariaLabel}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-card hover:bg-canvas border border-hairline text-sm text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="text-xs text-text-secondary font-medium">{labelPrefix}:</span>
        <span className="font-medium text-xs sm:text-sm truncate max-w-[140px] sm:max-w-[180px]">
          {selected ? selected.label : value}
        </span>
        <Select.Icon>
          <CaretDown size={12} className="text-text-tertiary" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          className="bg-card rounded-card shadow-flyout border border-hairline py-1.5 z-50 min-w-[180px] max-h-72 overflow-y-auto outline-none animate-in fade-in-50 zoom-in-95 duration-150"
        >
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="flex items-center justify-between px-3.5 py-2 text-xs font-medium text-text-primary hover:bg-accent-soft hover:text-accent rounded-tile mx-1 cursor-pointer outline-none transition-colors select-none"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check size={13} weight="bold" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
