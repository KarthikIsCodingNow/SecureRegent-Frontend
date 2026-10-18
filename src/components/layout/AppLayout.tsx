import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { List, X } from "@phosphor-icons/react";
import { Sidebar } from "./Sidebar";
import { GlobalFilterBar } from "./GlobalFilterBar";
import { useFilterContext } from "../../context/FilterContext";
import { useSettingsStore } from "../../store/settingsStore";

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const productName = useSettingsStore((s) => s.landing.productName);

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
        <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-sidebar border-b border-hairline sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-text-primary flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="3" width="5" height="18" rx="2.5" fill="white" />
                <rect x="15" y="8" width="5" height="13" rx="2.5" fill="var(--accent)" />
              </svg>
            </div>
            <span className="font-display font-semibold text-xs tracking-widest uppercase">
              {productName}
            </span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-full hover:bg-canvas text-text-secondary"
            aria-label="Open navigation menu"
          >
            <List size={20} />
          </button>
        </div>

        <main className="flex-1 px-6 md:px-10 py-8 max-w-[1600px] w-full mx-auto">
          {!isDetailPage && !isAdminPage && (
            <GlobalFilterBar
              filter={filter}
              onFilterChange={setFilter}
              onReset={resetFilter}
              currentRange={currentRange}
              previousRange={previousRange}
            />
          )}

          <div className="animate-in fade-in duration-150">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
