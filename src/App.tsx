import { useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes, useLocation, Link, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Menu, X, ArrowLeft } from "lucide-react";
import { AuthModal } from "./components/AuthModal";
import { Sidebar } from "./components/Sidebar";
import { SettingsModal } from "./components/SettingsModal";
import { useAuth } from "./features/auth/AuthContext";
import { SettingsUiProvider, useSettingsModalState } from "./context/SettingsUiContext";
import { BusinessPlansPage } from "./pages/BusinessPlansPage";
import { FinancialPlansPage } from "./pages/FinancialPlansPage";
import { BusinessPlanDetailsPage } from "./pages/BusinessPlanDetailsPage";
import { FinancialPlanDetailsPage } from "./pages/FinancialPlanDetailsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

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
          <Route path="/business-plans/:id" element={<BusinessPlanDetailsPage />} />
          <Route path="/financial-plans" element={<FinancialPlansPage />} />
          <Route path="/financial-plans/:id" element={<FinancialPlanDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <Toaster position="top-right" />
    </>
  );
}

function HomePage({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main
      className="grid min-h-screen place-items-center p-6"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      <button
        type="button"
        className="theme-menu-btn fixed left-4 top-4 z-50 rounded-xl p-2 md:hidden"
        onClick={() => setMenuOpen(true)}
        aria-label="Открыть меню"
      >
        <Menu size={20} />
      </button>
      <nav
        className="fixed left-4 top-4 z-40 hidden items-center gap-2 rounded-xl border p-2 md:flex"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <Link
          to="/business-plans"
          className="rounded-lg px-3 py-2 text-sm transition-colors hover:bg-(--bg-hover)"
        >
          Бизнес-планы
        </Link>
        <Link
          to="/financial-plans"
          className="rounded-lg px-3 py-2 text-sm transition-colors hover:bg-(--bg-hover)"
        >
          Финансовые планы
        </Link>
        {user ? (
          <Link
            to="/profile"
            className="rounded-lg px-3 py-2 text-sm transition-colors hover:bg-(--bg-hover)"
          >
            Профиль
          </Link>
        ) : null}
        {!user ? (
          <button
            type="button"
            onClick={onOpenAuth}
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
          >
            Войти
          </button>
        ) : null}
      </nav>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setMenuOpen(false)}
            aria-label="Закрыть меню"
          />
          <div
            className="fixed left-0 top-0 z-50 h-full w-72 border-r p-4 md:hidden"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-medium">Меню</p>
              <button
                type="button"
                className="rounded-lg border p-2 transition-colors"
                style={{
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-muted)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
                onClick={() => setMenuOpen(false)}
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2">
              <Link
                to="/business-plans"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 transition-colors hover:bg-(--bg-hover)"
              >
                Бизнес-планы
              </Link>
              <Link
                to="/financial-plans"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 transition-colors hover:bg-(--bg-hover)"
              >
                Финансовые планы
              </Link>
              {user ? (
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 transition-colors hover:bg-(--bg-hover)"
                >
                  Профиль
                </Link>
              ) : null}
              {!user ? (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="mt-2 w-full rounded-lg bg-white px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
                >
                  Войти / Регистрация
                </button>
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      <div
        className="w-full max-w-2xl rounded-2xl border p-6 text-center"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <h1 className="mb-2 text-3xl font-semibold">Добро пожаловать</h1>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          Авторизуйтесь для доступа к разделам бизнес и финансовых планов.
        </p>
        {user ? (
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/business-plans"
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
            >
              Бизнес-планы
            </Link>
            <Link
              to="/financial-plans"
              className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-(--bg-hover)"
              style={{ borderColor: 'var(--border-secondary)' }}
            >
              Финансовые планы
            </Link>
            <Link
              to="/profile"
              className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-(--bg-hover)"
              style={{ borderColor: 'var(--border-secondary)' }}
            >
              Профиль
            </Link>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
          >
            Открыть вход / регистрацию
          </button>
        )}
      </div>
    </main>
  );
}

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { open, tab, openModal, closeModal } = useSettingsModalState();

  // Check if we're on a detail page
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

  if (loading) {
    return (
      <div
        className="grid min-h-screen place-items-center"
        style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}
      >
        Загрузка...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return (
    <SettingsUiProvider openSettings={openModal}>
      <div className="app-shell min-h-screen">
        {/* Sticky Navigation Bar */}
        <div className="fixed left-4 top-4 z-40 flex items-center gap-2">
          {/* Menu Button */}
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

          {/* Back Button (only on detail pages) */}
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
          <Outlet />
        </div>
      </div>
    </SettingsUiProvider>
  );
}

export default App;
