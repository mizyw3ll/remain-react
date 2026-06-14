import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, X, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../features/auth/AuthContext";
import { useTheme } from "../features/theme/ThemeContext";
import { v, inputStyle, buttonStyle } from "../shared/theme";
import { forgotPassword } from "../features/auth/authApi";

type Tab = "login" | "register" | "forgot";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[A-Za-z0-9_]{3,20}$/;

function passwordStrength(password: string) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  if (score <= 2) return { label: "Слабый", color: "bg-red-500", width: "w-1/3" };
  if (score <= 4) return { label: "Средний", color: "bg-yellow-500", width: "w-2/3" };
  return { label: "Сильный", color: "bg-green-500", width: "w-full" };
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signin, signup } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [tab, setTab] = useState<Tab>("login");
  const [busy, setBusy] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const [loginForm, setLoginForm] = useState({ login: "", password: "" });
  const [regForm, setRegForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
    confirm: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotBusy, setForgotBusy] = useState(false);
  const [consentProcessing, setConsentProcessing] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);

  function resetForm() {
    setLoginForm({ login: "", password: "" });
    setRegForm({ first_name: "", last_name: "", email: "", username: "", password: "", confirm: "" });
    setForgotEmail("");
    setTab("login");
    setShowPass(false);
    setShowConfirm(false);
    setConsentProcessing(false);
    setConsentTerms(false);
  }

  useEffect(() => {
    if (isOpen) {
      resetForm();
      setTimeout(() => firstInputRef.current?.focus(), 0);
    }
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const loginErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!loginForm.login.trim()) errors.login = "Введите email или username";
    else if (loginForm.login.includes("@")) {
      if (!emailRegex.test(loginForm.login)) errors.login = "Некорректный email";
    } else if (!usernameRegex.test(loginForm.login)) errors.login = "Username: 3-20 символов, латиница, цифры, _";
    if (!loginForm.password) errors.password = "Введите пароль";
    return errors;
  }, [loginForm]);

  const regErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!emailRegex.test(regForm.email)) errors.email = "Введите корректный email";
    if (!usernameRegex.test(regForm.username)) errors.username = "Username: 3-20 символов, латиница, цифры, _";
    const passChecks = [
      regForm.password.length >= 8,
      /[A-Z]/.test(regForm.password),
      /[a-z]/.test(regForm.password),
      /\d/.test(regForm.password),
      /[^A-Za-z0-9]/.test(regForm.password),
    ];
    if (!passChecks.every(Boolean)) errors.password = "Пароль: min 8, заглавная, строчная, цифра и спецсимвол";
    if (regForm.confirm !== regForm.password) errors.confirm = "Пароли не совпадают";
    return errors;
  }, [regForm]);

  const loginValid = Object.keys(loginErrors).length === 0;
  const regValid = Object.keys(regErrors).length === 0 && consentProcessing && consentTerms;
  const strength = passwordStrength(regForm.password);

  if (!isOpen) return null;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginValid) return;
    try {
      setBusy(true);
      await signin(loginForm.login.trim(), loginForm.password);
      toast.success("Вход выполнен");
      resetForm();
      onClose();
    } catch {
      toast.error("Ошибка входа. Проверьте данные.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regValid) return;
    try {
      setBusy(true);
      await signup({
        email: regForm.email.trim(),
        username: regForm.username.trim(),
        password: regForm.password,
        first_name: regForm.first_name.trim() || undefined,
        last_name: regForm.last_name.trim() || undefined,
      });
      toast.success("Регистрация успешна");
      resetForm();
      onClose();
    } catch {
      toast.error("Ошибка регистрации");
    } finally {
      setBusy(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    if (!emailRegex.test(forgotEmail)) {
      toast.error("Введите корректный email");
      return;
    }
    try {
      setForgotBusy(true);
      await forgotPassword(forgotEmail.trim());
      toast.success("Письмо для сброса пароля отправлено");
      setForgotEmail("");
      setTab("login");
    } catch {
      toast.error("Не удалось отправить письмо. Проверьте email.");
    } finally {
      setForgotBusy(false);
    }
  }

  const getInputClass = (error?: string, hasValue?: boolean) => {
    const baseStyle = inputStyle(isDark);
    const borderColor = error ? "#ef4444" : hasValue ? "#22c55e" : isDark ? "#3f3f46" : "#e8e0d6";
    return { ...baseStyle, border: `1px solid ${borderColor}` };
  };

  return (
    <div className="fixed inset-0 z-100 grid place-items-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div
        className="flex w-full max-w-2xl overflow-hidden rounded-2xl border animate-scale-in"
        style={{ background: v("bg-sidebar"), borderColor: v("border-primary") }}
      >
        {/* Decorative panel */}
        <div
          className="relative hidden w-56 shrink-0 md:block"
          style={{ background: "linear-gradient(135deg, #6366f1 15%, #4f46e5 50%, #312e81 100%)" }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{ background: "radial-gradient(circle at 30% 50%, #fff 0%, transparent 60%)" }}
          />
          <div className="relative flex h-full flex-col justify-between p-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm" />
                <span className="text-sm font-semibold text-white/90">Remain</span>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-white/70">
                Современная платформа для управления проектами, финансами и задачами.
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-1 w-12 rounded-full bg-white/30" />
              <p className="text-[10px] text-white/50">© 2026 Remain</p>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex-1 p-5">
          <div className="mb-4 flex items-center justify-between">
            {tab === "forgot" ? (
              <button
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors"
                style={{ color: v("text-muted") }}
                onClick={() => setTab("login")}
                type="button"
              >
                <ArrowLeft size={14} /> Назад ко входу
              </button>
            ) : (
              <div className="inline-flex rounded-xl p-1" style={{ background: v("bg-secondary") }}>
                <button
                  className="rounded-lg px-3 py-1.5 text-sm transition-colors"
                  style={{
                    background: tab === "login" ? v("bg-active") : "transparent",
                    color: tab === "login" ? v("text-primary") : v("text-muted"),
                  }}
                  onClick={() => setTab("login")}
                  type="button"
                >
                  Вход
                </button>
                <button
                  className="rounded-lg px-3 py-1.5 text-sm transition-colors"
                  style={{
                    background: tab === "register" ? v("bg-active") : "transparent",
                    color: tab === "register" ? v("text-primary") : v("text-muted"),
                  }}
                  onClick={() => setTab("register")}
                  type="button"
                >
                  Регистрация
                </button>
              </div>
            )}
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              type="button"
              className="rounded-lg p-2 transition-colors hover:bg-[var(--bg-hover)]"
              style={{ color: v("text-muted") }}
            >
              <X size={18} />
            </button>
          </div>

          {tab === "login" && (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="relative">
                <input
                  ref={firstInputRef}
                  placeholder="Email или username"
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition peer"
                  style={getInputClass(loginErrors.login, Boolean(loginForm.login))}
                  value={loginForm.login}
                  onChange={(e) => setLoginForm((p) => ({ ...p, login: e.target.value }))}
                />
                <label
                  className="absolute -top-2 left-2 px-1 text-[10px] transition-all"
                  style={{ color: v("text-muted"), background: v("bg-sidebar") }}
                >
                  Email или username
                </label>
                {loginErrors.login && <p className="mt-1 text-xs text-red-400">{loginErrors.login}</p>}
              </div>
              <div className="relative">
                <div className="relative">
                  <input
                    placeholder="Пароль"
                    type={showPass ? "text" : "password"}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition peer"
                    style={getInputClass(loginErrors.password, Boolean(loginForm.password))}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                  />
                  <label
                    className="absolute -top-2 left-2 px-1 text-[10px] transition-all"
                    style={{ color: v("text-muted"), background: v("bg-sidebar") }}
                  >
                    Пароль
                  </label>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors hover:bg-[var(--bg-hover)]"
                    style={{ color: v("text-muted") }}
                    onClick={() => setShowPass((p) => !p)}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {loginErrors.password && <p className="mt-1 text-xs text-red-400">{loginErrors.password}</p>}
              </div>
              <button
                disabled={!loginValid || busy}
                className="w-full rounded-xl px-3 py-2.5 text-sm font-medium disabled:opacity-50 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
                style={{ ...buttonStyle("primary", isDark), boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)" }}
              >
                {busy ? "Вход..." : "Войти"}
              </button>
              <button
                type="button"
                className="w-full text-xs transition-colors hover:text-[var(--text-secondary)]"
                style={{ color: v("text-muted") }}
                onClick={() => setTab("forgot")}
              >
                Забыли пароль?
              </button>
            </form>
          )}

          {tab === "forgot" && (
            <form className="space-y-4" onSubmit={handleForgot}>
              <p className="text-sm" style={{ color: v("text-muted") }}>
                Введите email, и мы отправим ссылку для сброса пароля.
              </p>
              <div className="relative">
                <input
                  ref={firstInputRef}
                  placeholder="Email"
                  type="email"
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition peer"
                  style={getInputClass(undefined, Boolean(forgotEmail))}
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
                <label
                  className="absolute -top-2 left-2 px-1 text-[10px] transition-all"
                  style={{ color: v("text-muted"), background: v("bg-sidebar") }}
                >
                  Email
                </label>
              </div>
              <button
                disabled={forgotBusy}
                className="w-full rounded-xl px-3 py-2.5 text-sm font-medium disabled:opacity-50 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
                style={{ ...buttonStyle("primary", isDark), boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)" }}
              >
                {forgotBusy ? "Отправка..." : "Отправить ссылку"}
              </button>
            </form>
          )}

          {tab === "register" && (
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    ref={firstInputRef}
                    placeholder="Имя"
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition peer"
                    style={getInputClass(undefined, Boolean(regForm.first_name))}
                    value={regForm.first_name}
                    onChange={(e) => setRegForm((p) => ({ ...p, first_name: e.target.value }))}
                  />
                  <label
                    className="absolute -top-2 left-2 px-1 text-[10px]"
                    style={{ color: v("text-muted"), background: v("bg-sidebar") }}
                  >
                    Имя
                  </label>
                </div>
                <div className="relative">
                  <input
                    placeholder="Фамилия"
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition peer"
                    style={getInputClass(undefined, Boolean(regForm.last_name))}
                    value={regForm.last_name}
                    onChange={(e) => setRegForm((p) => ({ ...p, last_name: e.target.value }))}
                  />
                  <label
                    className="absolute -top-2 left-2 px-1 text-[10px]"
                    style={{ color: v("text-muted"), background: v("bg-sidebar") }}
                  >
                    Фамилия
                  </label>
                </div>
              </div>
              <div className="relative">
                <input
                  placeholder="Email"
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition peer"
                  style={getInputClass(regErrors.email, Boolean(regForm.email))}
                  value={regForm.email}
                  onChange={(e) => setRegForm((p) => ({ ...p, email: e.target.value }))}
                />
                <label
                  className="absolute -top-2 left-2 px-1 text-[10px]"
                  style={{ color: v("text-muted"), background: v("bg-sidebar") }}
                >
                  Email
                </label>
                {regErrors.email && <p className="mt-1 text-xs text-red-400">{regErrors.email}</p>}
              </div>
              <div className="relative">
                <input
                  placeholder="Username"
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition peer"
                  style={getInputClass(regErrors.username, Boolean(regForm.username))}
                  value={regForm.username}
                  onChange={(e) => setRegForm((p) => ({ ...p, username: e.target.value }))}
                />
                <label
                  className="absolute -top-2 left-2 px-1 text-[10px]"
                  style={{ color: v("text-muted"), background: v("bg-sidebar") }}
                >
                  Username
                </label>
                {regErrors.username && <p className="mt-1 text-xs text-red-400">{regErrors.username}</p>}
              </div>
              <div>
                <div className="relative">
                  <input
                    placeholder="Пароль"
                    type={showPass ? "text" : "password"}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition peer"
                    style={getInputClass(regErrors.password, Boolean(regForm.password))}
                    value={regForm.password}
                    onChange={(e) => setRegForm((p) => ({ ...p, password: e.target.value }))}
                  />
                  <label
                    className="absolute -top-2 left-2 px-1 text-[10px]"
                    style={{ color: v("text-muted"), background: v("bg-sidebar") }}
                  >
                    Пароль
                  </label>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors hover:bg-[var(--bg-hover)]"
                    style={{ color: v("text-muted") }}
                    onClick={() => setShowPass((p) => !p)}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="mt-2 h-1.5 rounded-full" style={{ background: v("bg-hover") }}>
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`}
                  />
                </div>
                <p className="mt-1 text-xs" style={{ color: v("text-muted") }}>
                  Надежность: {strength.label}
                </p>
                {regErrors.password && <p className="mt-1 text-xs text-red-400">{regErrors.password}</p>}
              </div>
              <div>
                <div className="relative">
                  <input
                    placeholder="Подтвердите пароль"
                    type={showConfirm ? "text" : "password"}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition peer"
                    style={getInputClass(regErrors.confirm, Boolean(regForm.confirm))}
                    value={regForm.confirm}
                    onChange={(e) => setRegForm((p) => ({ ...p, confirm: e.target.value }))}
                  />
                  <label
                    className="absolute -top-2 left-2 px-1 text-[10px]"
                    style={{ color: v("text-muted"), background: v("bg-sidebar") }}
                  >
                    Подтвердите пароль
                  </label>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors hover:bg-[var(--bg-hover)]"
                    style={{ color: v("text-muted") }}
                    onClick={() => setShowConfirm((p) => !p)}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {regErrors.confirm && <p className="mt-1 text-xs text-red-400">{regErrors.confirm}</p>}
              </div>

              {/* Согласия на обработку ПД и условия */}
              <div className="space-y-2.5 pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={consentProcessing}
                    onChange={(e) => setConsentProcessing(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded accent-indigo-500"
                  />
                  <span className="text-[11px] leading-snug" style={{ color: "var(--text-secondary)" }}>
                    Даю согласие на обработку персональных данных в соответствии с{" "}
                    <Link
                      to="/privacy"
                      target="_blank"
                      className="underline font-medium hover:opacity-80"
                      style={{ color: "var(--text-primary)" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Политикой обработки персональных данных
                    </Link>
                  </span>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={consentTerms}
                    onChange={(e) => setConsentTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded accent-indigo-500"
                  />
                  <span className="text-[11px] leading-snug" style={{ color: "var(--text-secondary)" }}>
                    Ознакомлен и принимаю{" "}
                    <Link
                      to="/terms"
                      target="_blank"
                      className="underline font-medium hover:opacity-80"
                      style={{ color: "var(--text-primary)" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Условия пользования
                    </Link>
                  </span>
                </label>
              </div>

              <button
                disabled={!regValid || busy}
                className="w-full rounded-xl px-3 py-2.5 text-sm font-medium disabled:opacity-50 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
                style={{ ...buttonStyle("primary", isDark), boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)" }}
              >
                {busy ? "Регистрация..." : "Зарегистрироваться"}
              </button>
              <p className="text-center text-[10px]" style={{ color: "var(--text-muted)" }}>
                Регистрируясь, вы соглашаетесь с{" "}
                <Link to="/privacy" target="_blank" className="underline hover:opacity-80">
                  Политикой конфиденциальности
                </Link>{" "}
                и{" "}
                <Link to="/terms" target="_blank" className="underline hover:opacity-80">
                  Условиями пользования
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
