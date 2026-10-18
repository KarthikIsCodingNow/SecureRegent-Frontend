import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { List, X } from "@phosphor-icons/react";
import { Sidebar } from "./Sidebar";
import { GlobalFilterBar } from "./GlobalFilterBar";
import { useFilterContext } from "../../context/FilterContext";
import { useSettingsStore } from "../../store/settingsStore";
import { BrandLogo } from "../common/BrandLogo";
import { DashboardFooter } from "../common/SiteFooter";

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const productName = useSettingsStore((s) => s.landing.productName);

  const activePreset = useSettingsStore((s) => s.activePreset);
  const themeMode = useSettingsStore((s) => s.themeMode);
  const applyPreset = useSettingsStore((s) => s.applyPreset);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);

  const {
    filter,
    setFilter,
    resetFilter,
    currentRange,
    previousRange
  } = useFilterContext();

  const isDetailPage =
    location.pathname.startsWith("/app/leads/") ||
    location.pathname.startsWith("/app/deals/") ||
    location.pathname.startsWith("/app/orders/");

  const isAdminPage = location.pathname === "/app/admin";

  return (
    <div className="min-h-screen flex bg-canvas text-text-primary antialiased">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-[280px] bg-sidebar h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-canvas text-text-tertiary"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <Sidebar onItemClick={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden flex items-center justify-between px-4 sm:px-6 py-3.5 bg-sidebar/95 backdrop-blur-md border-b border-hairline sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <BrandLogo size={22} />
            <span className="font-display font-semibold text-xs tracking-widest uppercase truncate max-w-[130px]">
              {productName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => applyPreset(activePreset === "minima-beige" ? "graphite" : "minima-beige")}
              className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-canvas hover:bg-hairline/40 border border-hairline text-text-secondary transition-colors"
              title="Toggle between Minima Beige and Graphite"
            >
              {activePreset === "minima-beige" ? "Default" : "Beige"}
            </button>
            <button
              onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-full hover:bg-canvas text-text-secondary flex items-center justify-center text-xs border border-hairline"
              aria-label="Toggle theme mode"
            >
              {themeMode === "dark" ? "🌙" : "☀️"}
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-full hover:bg-canvas text-text-secondary border border-hairline"
              aria-label="Open navigation menu"
            >
              <List size={18} />
            </button>
          </div>
        </div>

        <main className="flex-1 px-6 md:px-10 py-8 max-w-[1600px] w-full mx-auto flex flex-col justify-between">
          <div>
            {!isDetailPage && !isAdminPage && (
              <GlobalFilterBar
                filter={filter}
                onFilterChange={setFilter}
                onReset={resetFilter}
                currentRange={currentRange}
                previousRange={previousRange}
              />
            )}

            <div key={location.pathname} className="page-transition">
              <Outlet />
            </div>
          </div>

          <DashboardFooter />
        </main>
      </div>
    </div>
  );
};
