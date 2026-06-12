import { Suspense, lazy, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthModal } from "./components/AuthModal";
import { ProtectedLayout } from "./components/ProtectedLayout";
import { HomePage } from "./pages/HomePage";
import { BusinessPlansPage } from "./pages/BusinessPlansPage";
import { FinancialPlansPage } from "./pages/FinancialPlansPage";
import { NotesPage } from "./pages/NotesPage";
import { CalendarPage } from "./pages/CalendarPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SearchPage } from "./pages/SearchPage";
import { TaxCalendarPage } from "./pages/TaxCalendarPage";
import { KanbanPage } from "./pages/KanbanPage";
import { CrmPage } from "./pages/CrmPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

const BusinessPlanDetailsPage = lazy(() =>
  import("./pages/BusinessPlanDetailsPage").then((m) => ({ default: m.BusinessPlanDetailsPage })),
);
const FinancialPlanDetailsPage = lazy(() =>
  import("./pages/FinancialPlanDetailsPage").then((m) => ({ default: m.FinancialPlanDetailsPage })),
);

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage onOpenAuth={() => setAuthModalOpen(true)} />} />
        <Route path="/verify" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/business-plans" element={<BusinessPlansPage />} />
          <Route
            path="/business-plans/:id"
            element={
              <Suspense fallback={<div className="skeleton-card h-64 m-6" />}>
                <BusinessPlanDetailsPage />
              </Suspense>
            }
          />
          <Route path="/financial-plans" element={<FinancialPlansPage />} />
          <Route
            path="/financial-plans/:id"
            element={
              <Suspense fallback={<div className="skeleton-card h-64 m-6" />}>
                <FinancialPlanDetailsPage />
              </Suspense>
            }
          />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/tax-calendar" element={<TaxCalendarPage />} />
          <Route path="/kanban" element={<KanbanPage />} />
          <Route path="/crm" element={<CrmPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            color: "var(--text-primary)",
            borderRadius: "12px",
          },
        }}
      />
    </>
  );
}

export default App;
