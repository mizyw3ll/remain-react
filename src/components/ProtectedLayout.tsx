import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, ArrowLeft } from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";
import { Sidebar } from "./Sidebar";
import { SettingsModal } from "./SettingsModal";
import { SettingsUiProvider } from "../context/SettingsUiContext";
import { useSettingsModalState } from "../context/settingsUi";
import { NotificationBell } from "./NotificationBell";
import { SearchBar } from "./SearchBar";

export function ProtectedLayout() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { open, tab, openModal, closeModal } = useSettingsModalState();

  const isDetailPage =
    location.pathname.includes("/business-plans/") || location.pathname.includes("/financial-plans/");
  const backPath = location.pathname.includes("/business-plans/")
    ? "/business-plans"
    : location.pathname.includes("/financial-plans/")
      ? "/financial-plans"
      : null;

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!loading && !user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return (
    <SettingsUiProvider openSettings={openModal}>
      <div className="app-shell min-h-screen">
        <div className="fixed left-4 top-4 z-40 flex items-center gap-2">
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-lg border transition-colors hover:bg-[var(--bg-hover)] shrink-0"
            style={{
              borderColor: "var(--border-secondary)",
              background: "var(--bg-secondary)",
              color: "var(--text-secondary)",
            }}
            onClick={() => setSidebarOpen(true)}
            aria-label="Открыть меню"
          >
            <Menu size={18} />
          </button>

          {isDetailPage && backPath && (
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-lg border transition-colors hover:bg-[var(--bg-hover)] shrink-0"
              style={{
                borderColor: "var(--border-secondary)",
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
              }}
              onClick={() => navigate(backPath)}
              aria-label="Назад к списку"
            >
              <ArrowLeft size={18} />
            </button>
          )}
        </div>

        <div className="fixed right-4 top-4 z-40 flex items-center gap-2 max-[639px]:left-26">
          <div className="flex-1 sm:w-72 lg:w-96 sm:flex-none">
            <SearchBar />
          </div>
          <NotificationBell />
        </div>

        {sidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/45"
            onClick={() => setSidebarOpen(false)}
            aria-label="Закрыть меню"
          />
        ) : null}

        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenSettings={(t) => {
            openModal(t);
            setSidebarOpen(false);
          }}
        />
        <SettingsModal open={open} tab={tab} onClose={closeModal} />

        <div className="min-h-screen p-4 pt-16 md:p-6 md:pt-20">
          {loading ? (
            <div className="grid min-h-[50vh] place-items-center" style={{ color: "var(--text-muted)" }}>
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                <span className="text-sm">Загрузка...</span>
              </div>
            </div>
          ) : (
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          )}
        </div>
      </div>
    </SettingsUiProvider>
  );
}
