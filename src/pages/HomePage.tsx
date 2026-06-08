import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";
import { DashboardPage } from "./DashboardPage";


export function HomePage({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (user) {
    return <DashboardPage />;
  }

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
        <button
          type="button"
          onClick={onOpenAuth}
          className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
        >
          Войти
        </button>
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
        <button
          type="button"
          onClick={onOpenAuth}
          className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
        >
          Открыть вход / регистрацию
        </button>
      </div>
    </main>
  );
}
