import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, ArrowLeft } from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";
import { Sidebar } from "./Sidebar";
import { SettingsModal } from "./SettingsModal";
import { SettingsUiProvider, useSettingsModalState } from "../context/SettingsUiContext";

export function ProtectedLayout() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { open, tab, openModal, closeModal } = useSettingsModalState();

  const isDetailPage = location.pathname.includes('/business-plans/') || location.pathname.includes('/financial-plans/');
  const backPath = location.pathname.includes('/business-plans/') ? '/business-plans' :
    location.pathname.includes('/financial-plans/') ? '/financial-plans' : null;

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
            className="grid h-10 w-10 place-items-center rounded-lg border transition-colors"
            style={{
              borderColor: 'var(--border-secondary)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-secondary)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            onClick={() => setSidebarOpen(true)}
            aria-label="Открыть меню"
          >
            <Menu size={20} />
          </button>

          {isDetailPage && backPath && (
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-lg border transition-colors"
              style={{
                borderColor: 'var(--border-secondary)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
              onClick={() => navigate(backPath)}
              aria-label="Назад к списку"
            >
              <ArrowLeft size={20} />
            </button>
          )}
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
            <div
              className="grid min-h-[50vh] place-items-center"
              style={{ color: 'var(--text-muted)' }}
            >
              Загрузка...
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </SettingsUiProvider>
  );
}
