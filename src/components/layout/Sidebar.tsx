import React from "react";
import { NavLink } from "react-router-dom";
import {
  ChartLineUp,
  UsersThree,
  FileText,
  Handshake,
  ListChecks,
  GearSix,
  Palette
} from "@phosphor-icons/react";
import clsx from "clsx";
import { useSettingsStore } from "../../store/settingsStore";
import { BrandLogo } from "../common/BrandLogo";

interface SidebarProps {
  className?: string;
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = "", onItemClick }) => {
  const productName = useSettingsStore((s) => s.landing.productName);
  const unreadInquiries = useSettingsStore((s) => s.inboxMessages?.filter((m) => !m.read).length || 0);
  const activePreset = useSettingsStore((s) => s.activePreset);
  const themeMode = useSettingsStore((s) => s.themeMode);
  const applyPreset = useSettingsStore((s) => s.applyPreset);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);

  const mainNavItems = [
    { to: "/app", label: "Overview", icon: ChartLineUp, end: true },
    { to: "/app/leads", label: "Leads", icon: UsersThree, end: false },
    { to: "/app/quotations", label: "Quotations", icon: FileText, end: false },
    { to: "/app/deals", label: "Deals and revenue", icon: Handshake, end: false },
    { to: "/app/orders", label: "Orders and payments", icon: ListChecks, end: false }
  ];

  const systemNavItems = [
    { to: "/app/admin", label: "Admin console", icon: GearSix, end: false }
  ];

  return (
    <aside
      className={clsx(
        "w-[248px] bg-sidebar border-r border-hairline flex flex-col justify-between shrink-0 h-screen sticky top-0 p-5 select-none z-30 transition-all",
        className
      )}
    >
      <div>
        <div className="flex items-center gap-2.5 px-3 py-2 mb-8">
          <BrandLogo size={26} />
          <span className="font-display font-semibold text-xs tracking-[0.2em] uppercase text-text-primary truncate">
            {productName}
          </span>
        </div>

        <nav className="space-y-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onItemClick}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-colors group",
                  isActive
                    ? "bg-accent-soft text-accent"
                    : "text-text-secondary hover:text-text-primary hover:bg-canvas"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={18}
                    weight={isActive ? "fill" : "regular"}
                    className={clsx(
                      "shrink-0 transition-colors",
                      isActive ? "text-accent" : "text-text-tertiary group-hover:text-text-primary"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 pt-4 border-t border-hairline">
          <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-3.5 mb-2">
            System
          </div>
          <nav className="space-y-1">
            {systemNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onItemClick}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-colors group",
                    isActive
                      ? "bg-accent-soft text-accent"
                      : "text-text-secondary hover:text-text-primary hover:bg-canvas"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={18}
                      weight={isActive ? "fill" : "regular"}
                      className={clsx(
                        "shrink-0 transition-colors",
                        isActive ? "text-accent" : "text-text-tertiary group-hover:text-text-primary"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                    {item.to === "/app/admin" && unreadInquiries > 0 && (
                      <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-accent text-accent-contrast leading-none">
                        {unreadInquiries}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="pt-3 border-t border-hairline space-y-2.5">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Palette size={14} className="text-accent shrink-0" />
            <span className="text-[11px] font-medium text-text-secondary truncate">
              {activePreset === "minima-beige" ? "Minima Beige" : activePreset}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => applyPreset(activePreset === "minima-beige" ? "graphite" : "minima-beige")}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-canvas hover:bg-hairline/40 border border-hairline text-text-secondary transition-colors"
              title="Toggle between Minima Beige and Graphite"
            >
              {activePreset === "minima-beige" ? "Default" : "Beige"}
            </button>
            <button
              onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
              className="w-6 h-6 rounded-full hover:bg-canvas text-text-secondary flex items-center justify-center text-xs transition-colors"
              title="Toggle dark/light mode"
              aria-label="Toggle dark/light mode"
            >
              {themeMode === "dark" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-accent-soft text-accent text-xs font-semibold flex items-center justify-center shrink-0">
              AD
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-text-primary truncate">
                Admin
              </div>
              <div className="text-[10px] text-text-tertiary truncate">
                Finance & Sales
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
