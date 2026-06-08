import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, X, ArrowLeft } from "lucide-react";
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

  function resetForm() {
    setLoginForm({ login: "", password: "" });
    setRegForm({
      first_name: "",
      last_name: "",
      email: "",
      username: "",
      password: "",
      confirm: "",
    });
    setForgotEmail("");
    setTab("login");
    setShowPass(false);
    setShowConfirm(false);
  }

  useEffect(() => {
    if (isOpen) {
      resetForm();
      setTimeout(() => firstInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const loginErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!loginForm.login.trim()) {
      errors.login = "Введите email или username";
    } else if (loginForm.login.includes("@")) {
      if (!emailRegex.test(loginForm.login)) errors.login = "Некорректный email";
    } else if (!usernameRegex.test(loginForm.login)) {
      errors.login = "Username: 3-20 символов, латиница, цифры, _";
    }
    if (!loginForm.password) errors.password = "Введите пароль";
    return errors;
  }, [loginForm]);

  const regErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!emailRegex.test(regForm.email)) errors.email = "Введите корректный email";
    if (!usernameRegex.test(regForm.username)) {
      errors.username = "Username: 3-20 символов, латиница, цифры, _";
    }

    const passChecks = [
      regForm.password.length >= 8,
      /[A-Z]/.test(regForm.password),
      /[a-z]/.test(regForm.password),
      /\d/.test(regForm.password),
      /[^A-Za-z0-9]/.test(regForm.password),
    ];
    if (!passChecks.every(Boolean)) {
      errors.password =
        "Пароль: min 8, заглавная, строчная, цифра и спецсимвол";
    }
    if (regForm.confirm !== regForm.password) {
      errors.confirm = "Пароли не совпадают";
    }
    return errors;
  }, [regForm]);

  const loginValid = Object.keys(loginErrors).length === 0;
  const regValid = Object.keys(regErrors).length === 0;
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
    return {
      ...baseStyle,
      border: `1px solid ${borderColor}`,
    };
  };

  return (
    <div
      className="fixed inset-0 z-100 grid place-items-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={() => { resetForm(); onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-2xl border p-5"
        style={{ background: v("bg-sidebar"), borderColor: v("border-primary") }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          {tab === "forgot" ? (
            <button
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors"
              style={{ color: v("text-muted") }}
              onClick={() => setTab("login")}
              type="button"
            >
              <ArrowLeft size={14} />
              Назад ко входу
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
            onClick={() => { resetForm(); onClose(); }}
            type="button"
            className="rounded-lg p-2 transition-colors"
            style={{ color: v("text-muted") }}
            onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <X size={18} />
          </button>
        </div>

        {tab === "login" && (
          <form className="space-y-3" onSubmit={handleLogin}>
            <div>
              <input
                ref={firstInputRef}
                placeholder="Email или username"
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition"
                style={getInputClass(loginErrors.login, Boolean(loginForm.login))}
                value={loginForm.login}
                onChange={(e) => setLoginForm((p) => ({ ...p, login: e.target.value }))}
              />
              {loginErrors.login && <p className="mt-1 text-xs text-red-400">{loginErrors.login}</p>}
            </div>
            <div>
              <div className="relative">
                <input
                  placeholder="Пароль"
                  type={showPass ? "text" : "password"}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition"
                  style={getInputClass(loginErrors.password, Boolean(loginForm.password))}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors"
                  style={{ color: v("text-muted") }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  onClick={() => setShowPass((p) => !p)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {loginErrors.password && (
                <p className="mt-1 text-xs text-red-400">{loginErrors.password}</p>
              )}
            </div>
            <button
              disabled={!loginValid || busy}
              className="w-full rounded-xl px-3 py-2 text-sm font-medium disabled:opacity-50"
              style={buttonStyle("primary", isDark)}
            >
              Войти
            </button>
            <button
              type="button"
              className="text-xs transition-colors"
              style={{ color: v("text-muted") }}
              onMouseEnter={(e) => { e.currentTarget.style.color = v("text-secondary"); }}
              onMouseLeave={(e) => { e.currentTarget.style.color = v("text-muted"); }}
              onClick={() => setTab("forgot")}
            >
              Забыли пароль?
            </button>
          </form>
        )}

        {tab === "forgot" && (
          <form className="space-y-3" onSubmit={handleForgot}>
            <p className="text-sm" style={{ color: v("text-muted") }}>
              Введите email, и мы отправим ссылку для сброса пароля.
            </p>
            <div>
              <input
                ref={firstInputRef}
                placeholder="Email"
                type="email"
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition"
                style={getInputClass(undefined, Boolean(forgotEmail))}
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </div>
            <button
              disabled={forgotBusy}
              className="w-full rounded-xl px-3 py-2 text-sm font-medium disabled:opacity-50"
              style={buttonStyle("primary", isDark)}
            >
              {forgotBusy ? "Отправка..." : "Отправить ссылку"}
            </button>
          </form>
        )}

        {tab === "register" && (
          <form className="space-y-3" onSubmit={handleRegister}>
            <input
              ref={firstInputRef}
              placeholder="Имя (необязательно)"
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition"
              style={getInputClass(undefined, Boolean(regForm.first_name))}
              value={regForm.first_name}
              onChange={(e) => setRegForm((p) => ({ ...p, first_name: e.target.value }))}
            />
            <input
              placeholder="Фамилия (необязательно)"
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition"
              style={getInputClass(undefined, Boolean(regForm.last_name))}
              value={regForm.last_name}
              onChange={(e) => setRegForm((p) => ({ ...p, last_name: e.target.value }))}
            />
            <div>
              <input
                placeholder="Email"
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition"
                style={getInputClass(regErrors.email, Boolean(regForm.email))}
                value={regForm.email}
                onChange={(e) => setRegForm((p) => ({ ...p, email: e.target.value }))}
              />
              {regErrors.email && <p className="mt-1 text-xs text-red-400">{regErrors.email}</p>}
            </div>
            <div>
              <input
                placeholder="Username"
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition"
                style={getInputClass(regErrors.username, Boolean(regForm.username))}
                value={regForm.username}
                onChange={(e) => setRegForm((p) => ({ ...p, username: e.target.value }))}
              />
              {regErrors.username && (
                <p className="mt-1 text-xs text-red-400">{regErrors.username}</p>
              )}
            </div>
            <div>
              <div className="relative">
                <input
                  placeholder="Пароль"
                  type={showPass ? "text" : "password"}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition"
                  style={getInputClass(regErrors.password, Boolean(regForm.password))}
                  value={regForm.password}
                  onChange={(e) => setRegForm((p) => ({ ...p, password: e.target.value }))}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors"
                  style={{ color: v("text-muted") }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  onClick={() => setShowPass((p) => !p)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="mt-2 h-2 rounded-full" style={{ background: v("bg-hover") }}>
                <div className={`h-full rounded-full ${strength.color} ${strength.width}`} />
              </div>
              <p className="mt-1 text-xs" style={{ color: v("text-muted") }}>Надежность: {strength.label}</p>
              {regErrors.password && (
                <p className="mt-1 text-xs text-red-400">{regErrors.password}</p>
              )}
            </div>
            <div>
              <div className="relative">
                <input
                  placeholder="Подтвердите пароль"
                  type={showConfirm ? "text" : "password"}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition"
                  style={getInputClass(regErrors.confirm, Boolean(regForm.confirm))}
                  value={regForm.confirm}
                  onChange={(e) => setRegForm((p) => ({ ...p, confirm: e.target.value }))}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors"
                  style={{ color: v("text-muted") }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  onClick={() => setShowConfirm((p) => !p)}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {regErrors.confirm && (
                <p className="mt-1 text-xs text-red-400">{regErrors.confirm}</p>
              )}
            </div>
            <button
              disabled={!regValid || busy}
              className="w-full rounded-xl px-3 py-2 text-sm font-medium disabled:opacity-50"
              style={buttonStyle("primary", isDark)}
            >
              Зарегистрироваться
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
