import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { DownloadSimple, FileCsv, Printer } from "@phosphor-icons/react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onExportCsv?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onExportCsv
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-hairline">
      <div>
        <h1 className="text-[32px] leading-[40px] font-medium font-display text-text-primary tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-card hover:bg-canvas border border-hairline text-sm font-medium text-text-primary shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Download options"
            >
              <DownloadSimple size={16} className="text-text-secondary" />
              <span>Download</span>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="bg-card rounded-card shadow-flyout border border-hairline p-1.5 z-50 min-w-[200px] outline-none animate-in fade-in-50 zoom-in-95 duration-150"
            >
              <DropdownMenu.Item
                onClick={onExportCsv}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-text-primary hover:bg-accent-soft hover:text-accent rounded-tile cursor-pointer outline-none transition-colors select-none"
              >
                <FileCsv size={16} />
                <span>Current view as CSV</span>
              </DropdownMenu.Item>

              <DropdownMenu.Item
                onClick={handlePrint}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-text-primary hover:bg-accent-soft hover:text-accent rounded-tile cursor-pointer outline-none transition-colors select-none"
              >
                <Printer size={16} />
                <span>Print or save as PDF</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );
};
