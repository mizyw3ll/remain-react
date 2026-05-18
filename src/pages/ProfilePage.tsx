import { UserCircle } from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";
import { useSettingsUi } from "../context/SettingsUiContext";
import { maskEmail } from "../lib/maskEmail";
import { v } from "../shared/theme";

export function ProfilePage() {
  const { user } = useAuth();
  const { openSettings } = useSettingsUi();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div
        className="relative rounded-2xl border p-8"
        style={{
          borderColor: v('border-primary'),
          background: v('bg-secondary'),
        }}
      >
        <div className="relative flex flex-col items-center text-center">
          <div
            className="mb-4 grid h-20 w-20 place-items-center rounded-2xl"
            style={{
              background: v('bg-hover'),
              border: `1px solid ${v('border-secondary')}`,
            }}
          >
            <UserCircle size={40} style={{ color: 'var(--text-primary)' }} />
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {user.first_name || user.username}
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>@{user.username}</p>
          <p
            className="mt-4 rounded-xl border px-4 py-3 font-mono text-sm"
            style={{
              borderColor: 'var(--border-primary)',
              background: 'var(--bg-secondary)',
              color: 'var(--accent-primary)',
            }}
          >
            {maskEmail(user.email)}
          </p>
          <p className="mt-2 max-w-sm text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Адрес почты отображается частично скрытым.
          </p>
          <button
            type="button"
            className="mt-6 rounded-xl border px-6 py-2.5 text-sm font-medium transition-colors"
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
            onClick={() => openSettings("profile")}
          >
            Настройки аккаунта
          </button>
        </div>
      </div>
    </div>
  );
}
