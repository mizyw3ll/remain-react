import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Moon, Sun, X, CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../features/theme/ThemeContext";
import { useAuth } from "../features/auth/AuthContext";
import { deleteUserApi } from "../api";
import { changePassword, requestVerification } from "../features/auth/authApi";
import { ConfirmModal } from "./ConfirmModal";
import { LogoutConfirmModal } from "./LogoutConfirmModal";
import { maskEmail } from "../lib/maskEmail";
import type { SettingsTab } from "../context/SettingsContext";

type Props = {
  open: boolean;
  tab: SettingsTab;
  onClose: () => void;
};

export function SettingsModal({ open, tab, onClose }: Props) {
  const { theme, setTheme } = useTheme();
  const { user, signout } = useAuth();
  const navigate = useNavigate();
  const [panel, setPanel] = useState<SettingsTab>(tab);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState("");
  const [passBusy, setPassBusy] = useState(false);
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleDeleteAccount() {
    if (!user) return;
    try {
      await deleteUserApi(user.id);
      toast.success("Аккаунт удалён");
      setDeleteOpen(false);
      onClose();
      signout();
      navigate("/", { replace: true });
    } catch {
      toast.error("Не удалось удалить аккаунт. Возможно, операция недоступна для вашей роли.");
    }
  }

  async function handleResendVerification() {
    if (!user) return;
    setVerifyBusy(true);
    try {
      await requestVerification();
      toast.success("Письмо для верификации отправлено");
    } catch {
      toast.error("Не удалось отправить письмо");
    } finally {
      setVerifyBusy(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPassError("");
    if (newPass !== confirmPass) {
      setPassError("Пароли не совпадают");
      return;
    }
    if (newPass.length < 8) {
      setPassError("Новый пароль должен быть минимум 8 символов");
      return;
    }
    if (oldPass.toLowerCase() === newPass.toLowerCase()) {
      setPassError("Новый пароль не должен совпадать со старым");
      return;
    }
    if (
      oldPass.toLowerCase().includes(newPass.toLowerCase()) ||
      newPass.toLowerCase().includes(oldPass.toLowerCase())
    ) {
      setPassError("Новый пароль слишком похож на старый");
      return;
    }
    setPassBusy(true);
    try {
      await changePassword(oldPass, newPass);
      toast.success("Пароль успешно изменен");
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Не удалось сменить пароль";
      setPassError(detail);
    } finally {
      setPassBusy(false);
    }
  }

  return (
    <>
      {/* Mobile: full-screen from bottom, small top gap */}
      <div className="fixed inset-0 z-[100] md:flex md:items-center md:justify-center md:p-[max(1rem,5vw)]">
        <button
          type="button"
          className="absolute inset-0"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={onClose}
          aria-label="Закрыть настройки"
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
          className="relative z-10 flex flex-col overflow-hidden max-md:fixed max-md:inset-x-0 max-md:top-6 max-md:bottom-0 max-md:rounded-t-2xl max-md:border max-lg:top-12 md:h-[656px] md:w-full md:max-w-2xl md:rounded-2xl md:border"
          style={{
            background: "var(--bg-sidebar)",
            borderColor: "var(--border-primary)",
            boxShadow: "var(--shadow-xl)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b px-4 py-3 shrink-0"
            style={{ borderColor: "var(--border-muted)" }}
          >
            <h2 id="settings-title" className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Настройки
            </h2>
            <button
              type="button"
              className="rounded-lg p-2 transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-hover)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
              onClick={onClose}
              aria-label="Закрыть"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body: tabs left (desktop) / tabs top (mobile) */}
          <div className="flex flex-1 overflow-hidden max-md:flex-col">
            {/* Tabs - desktop left sidebar */}
            <div
              className="flex max-md:flex-row max-md:gap-1 max-md:border-b max-md:px-2 max-md:pt-2 md:flex-col md:border-r md:p-2 md:shrink-0"
              style={{ borderColor: "var(--border-muted)" }}
            >
              <button
                type="button"
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors text-left max-md:rounded-t-lg max-md:px-4 max-md:py-2 md:px-3 ${
                  panel === "main" ? "active" : ""
                }`}
                style={{
                  background: panel === "main" ? "var(--bg-active)" : "transparent",
                  color: panel === "main" ? "var(--text-primary)" : "var(--text-muted)",
                }}
                onMouseEnter={(e) => {
                  if (panel !== "main") {
                    e.currentTarget.style.background = "var(--bg-hover)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (panel !== "main") {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-muted)";
                  }
                }}
                onClick={() => setPanel("main")}
              >
                Главная
              </button>
              <button
                type="button"
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors text-left max-md:rounded-t-lg max-md:px-4 max-md:py-2 md:px-3 ${
                  panel === "profile" ? "active" : ""
                }`}
                style={{
                  background: panel === "profile" ? "var(--bg-active)" : "transparent",
                  color: panel === "profile" ? "var(--text-primary)" : "var(--text-muted)",
                }}
                onMouseEnter={(e) => {
                  if (panel !== "profile") {
                    e.currentTarget.style.background = "var(--bg-hover)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (panel !== "profile") {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-muted)";
                  }
                }}
                onClick={() => setPanel("profile")}
              >
                Профиль
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {panel === "main" ? (
                <div className="space-y-3">
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Тема оформления
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-6 transition-colors ${
                        theme === "dark" ? "active-theme-dark" : ""
                      }`}
                      style={{
                        borderColor: theme === "dark" ? "rgba(34, 211, 238, 0.6)" : "var(--border-primary)",
                        background: theme === "dark" ? "rgba(34, 211, 238, 0.1)" : "var(--bg-secondary)",
                        color: theme === "dark" ? "var(--accent-primary)" : "var(--text-secondary)",
                      }}
                    >
                      <Moon size={28} />
                      <span className="text-sm font-medium">Тёмная</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-6 transition-colors ${
                        theme === "light" ? "active-theme-light" : ""
                      }`}
                      style={{
                        borderColor: theme === "light" ? "rgba(251, 191, 36, 0.6)" : "var(--border-primary)",
                        background: theme === "light" ? "rgba(251, 191, 36, 0.1)" : "var(--bg-secondary)",
                        color: theme === "light" ? "rgb(251, 191, 36)" : "var(--text-secondary)",
                      }}
                    >
                      <Sun size={28} />
                      <span className="text-sm font-medium">Светлая</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Email + Verification */}
                  <div
                    className="rounded-xl border p-4"
                    style={{
                      borderColor: "var(--border-primary)",
                      background: "var(--bg-secondary)",
                    }}
                  >
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                      Электронная почта
                    </p>
                    <p className="mt-2 font-mono text-sm" style={{ color: "var(--text-secondary)" }}>
                      {user ? maskEmail(user.email) : "—"}
                    </p>
                    {user?.is_verified ? (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-green-500">
                        <CheckCircle size={14} />
                        <span>Email подтвержден</span>
                      </div>
                    ) : (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs text-amber-500">
                          <AlertCircle size={14} />
                          <span>Email не подтвержден</span>
                        </div>
                        <button
                          type="button"
                          disabled={verifyBusy}
                          onClick={handleResendVerification}
                          className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                          style={{
                            borderColor: "var(--border-secondary)",
                            color: "var(--text-secondary)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--bg-hover)";
                            e.currentTarget.style.color = "var(--text-primary)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "var(--text-secondary)";
                          }}
                        >
                          {verifyBusy ? (
                            <>
                              <Loader2 size={12} className="animate-spin" />
                              Отправка...
                            </>
                          ) : (
                            "Отправить письмо повторно"
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Password Change */}
                  <div
                    className="rounded-xl border p-4"
                    style={{
                      borderColor: "var(--border-primary)",
                      background: "var(--bg-secondary)",
                    }}
                  >
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                      Смена пароля
                    </p>
                    <form onSubmit={handleChangePassword} className="mt-3 space-y-2">
                      <div className="relative">
                        <input
                          type={showOldPass ? "text" : "password"}
                          placeholder="Текущий пароль"
                          className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                          style={{
                            background: "var(--bg-primary)",
                            borderColor: "var(--border-secondary)",
                            color: "var(--text-primary)",
                          }}
                          value={oldPass}
                          onChange={(e) => setOldPass(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPass((p) => !p)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {showOldPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showNewPass ? "text" : "password"}
                          placeholder="Новый пароль"
                          className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                          style={{
                            background: "var(--bg-primary)",
                            borderColor: "var(--border-secondary)",
                            color: "var(--text-primary)",
                          }}
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass((p) => !p)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <input
                        type="password"
                        placeholder="Подтвердите новый пароль"
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                        style={{
                          background: "var(--bg-primary)",
                          borderColor: "var(--border-secondary)",
                          color: "var(--text-primary)",
                        }}
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                      />
                      {passError && <p className="text-xs text-rose-500">{passError}</p>}
                      <button
                        type="submit"
                        disabled={passBusy || !oldPass || !newPass || !confirmPass}
                        className="w-full rounded-lg bg-white py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
                      >
                        {passBusy ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 size={14} className="animate-spin" />
                            Сохранение...
                          </span>
                        ) : (
                          "Сменить пароль"
                        )}
                      </button>
                    </form>
                  </div>

                  <button
                    type="button"
                    className="w-full rounded-xl border py-3 text-sm font-medium transition-colors"
                    style={{
                      borderColor: "var(--border-secondary)",
                      color: "var(--text-secondary)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-hover)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                    onClick={() => setLogoutConfirmOpen(true)}
                  >
                    Выйти из аккаунта
                  </button>

                  <button
                    type="button"
                    className="w-full rounded-xl border py-3 text-sm font-medium transition-colors"
                    style={{
                      borderColor: "rgba(220, 38, 38, 0.6)",
                      background: "rgba(220, 38, 38, 0.1)",
                      color: "rgb(252, 165, 165)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(220, 38, 38, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(220, 38, 38, 0.1)";
                    }}
                    onClick={() => setDeleteOpen(true)}
                  >
                    Удалить аккаунт
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={deleteOpen}
        title="Удаление аккаунта"
        description="Это действие необратимо. Все данные профиля будут удалены на сервере (если поддерживается API)."
        confirmText="Удалить навсегда"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => void handleDeleteAccount()}
      />

      <LogoutConfirmModal
        isOpen={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={() => {
          signout();
          onClose();
          navigate("/", { replace: true });
          setLogoutConfirmOpen(false);
        }}
      />
    </>
  );
}
