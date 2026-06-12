import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { LogOut, Menu, MoreHorizontal, PiggyBank, ScrollText, Settings, Home, FileText, Calendar, Receipt, LayoutGrid, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import type { SettingsTab } from "../context/SettingsUiContext";
import { LogoutConfirmModal } from "./LogoutConfirmModal";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  onOpenSettings: (tab?: SettingsTab) => void;
};

export function Sidebar({ open, onClose, onOpenSettings }: SidebarProps) {
  const { user, signout } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountOpen) return;
    const close = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [accountOpen]);

  return (
    <>
      <aside
        className={`theme-sidebar fixed inset-y-0 left-0 z-50 w-[240px] border-r transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          background: 'var(--bg-sidebar)',
          borderColor: 'var(--border-primary)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="flex h-full flex-col p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Меню</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Закрыть меню"
            >
              <Menu size={18} />
            </button>
          </div>

          <nav className="space-y-2">
            <NavButton to="/dashboard" icon={<Home size={18} />} text="Главная" onNavigate={onClose} />
            <NavButton to="/business-plans" icon={<ScrollText size={18} />} text="Бизнес-планы" onNavigate={onClose} />
            <NavButton to="/notes" icon={<FileText size={18} />} text="Заметки" onNavigate={onClose} />
            <NavButton to="/calendar" icon={<Calendar size={18} />} text="Календарь" onNavigate={onClose} />
            <NavButton to="/tax-calendar" icon={<Receipt size={18} />} text="Налоги" onNavigate={onClose} />
            <NavButton to="/kanban" icon={<LayoutGrid size={18} />} text="Kanban" onNavigate={onClose} />
            <NavButton to="/crm" icon={<Users size={18} />} text="CRM" onNavigate={onClose} />
            <NavButton to="/financial-plans" icon={<PiggyBank size={18} />} text="Финансовые планы" onNavigate={onClose} />
          </nav>

          <div className="my-3 border-t" style={{ borderColor: 'var(--border-primary)' }} />

          <div className="mt-auto space-y-2">
            {user && (
              <div
                ref={accountRef}
                className="relative cursor-pointer select-none rounded-xl border p-3 transition-colors hover:bg-[var(--bg-hover)]"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border-muted)',
                }}
                onClick={() => setAccountOpen((p) => !p)}
              >
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold"
                    style={{ background: 'var(--accent-primary)', color: 'var(--bg-body)' }}>
                    {(user.first_name || user.username).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user.first_name || user.username}</p>
                    <p className="truncate text-xs" style={{ color: 'var(--text-tertiary)' }}>{user.email}</p>
                  </div>
                  <MoreHorizontal size={18} style={{ color: 'var(--text-muted)' }} />
                </div>

                {accountOpen ? (
                  <div
                    className="absolute bottom-full left-0 right-0 z-10 mb-2 overflow-hidden rounded-xl border shadow-xl animate-scale-in"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)',
                    }}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                      style={{ color: 'var(--text-secondary)' }}
                      onClick={() => {
                        setAccountOpen(false);
                        onOpenSettings("main");
                      }}
                    >
                      <Settings size={16} />
                      Настройки
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 border-t px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                      style={{
                        color: 'var(--text-secondary)',
                        borderColor: 'var(--border-muted)',
                      }}
                      onClick={() => {
                        setAccountOpen(false);
                        setLogoutConfirmOpen(true);
                      }}
                    >
                      <LogOut size={16} />
                      Выйти
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </aside>

      <LogoutConfirmModal
        isOpen={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={() => {
          signout();
          onClose();
          setLogoutConfirmOpen(false);
        }}
      />
    </>
  );
}

function NavButton({
  to,
  icon,
  text,
  onNavigate,
}: {
  to: string;
  icon: ReactNode;
  text: string;
  onNavigate: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex h-11 items-center rounded-xl px-3 transition-all duration-200 ${isActive
          ? "bg-[var(--bg-active)] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_var(--border-secondary)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
        }`
      }
    >
      <span className="mr-3">{icon}</span>
      <span className="text-sm font-medium">{text}</span>
    </NavLink>
  );
}
