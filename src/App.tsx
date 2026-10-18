import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { FilterProvider } from "@/context/FilterContext";

const LandingPage = lazy(() => import("@/pages/LandingPage").then((m) => ({ default: m.LandingPage })));
const OverviewPage = lazy(() => import("@/pages/OverviewPage").then((m) => ({ default: m.OverviewPage })));
const LeadsPage = lazy(() => import("@/pages/LeadsPage").then((m) => ({ default: m.LeadsPage })));
const QuotationsPage = lazy(() => import("@/pages/QuotationsPage").then((m) => ({ default: m.QuotationsPage })));
const DealsPage = lazy(() => import("@/pages/DealsPage").then((m) => ({ default: m.DealsPage })));
const OrdersPage = lazy(() => import("@/pages/OrdersPage").then((m) => ({ default: m.OrdersPage })));
const LeadDetailPage = lazy(() => import("@/pages/LeadDetailPage").then((m) => ({ default: m.LeadDetailPage })));
const DealDetailPage = lazy(() => import("@/pages/DealDetailPage").then((m) => ({ default: m.DealDetailPage })));
const OrderDetailPage = lazy(() => import("@/pages/OrderDetailPage").then((m) => ({ default: m.OrderDetailPage })));
const AdminPage = lazy(() => import("@/pages/AdminPage").then((m) => ({ default: m.AdminPage })));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));

const RouteLoading: React.FC = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route
            path="/app"
            element={
              <FilterProvider>
                <AppLayout />
              </FilterProvider>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="leads/:id" element={<LeadDetailPage />} />
            <Route path="quotations" element={<QuotationsPage />} />
            <Route path="deals" element={<DealsPage />} />
            <Route path="deals/:id" element={<DealDetailPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route
            path="*"
            element={
              <FilterProvider>
                <AppLayout />
              </FilterProvider>
            }
          >
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
