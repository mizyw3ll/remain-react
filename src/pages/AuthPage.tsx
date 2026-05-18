import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { ui } from "../styles/ui";

const emptyLoginForm = {
  login: "",
  password: "",
};

const emptyRegisterForm = {
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  first_name: "",
  last_name: "",
};

export function AuthPage() {
  const { user, signin, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loginForm, setLoginForm] = useState(() => ({ ...emptyLoginForm }));
  const [registerForm, setRegisterForm] = useState(() => ({ ...emptyRegisterForm }));
  const location = useLocation();
  const navigate = useNavigate();

  function clearForms() {
    setLoginForm({ ...emptyLoginForm });
    setRegisterForm({ ...emptyRegisterForm });
    setSubmitted(false);
    setError("");
  }

  // Clear forms when component mounts (after logout)
  useEffect(() => {
    setTimeout(() => clearForms(), 0);
  }, []);

  if (user) return <Navigate to="/" replace />;

  function switchMode() {
    setIsLogin((p) => !p);
    clearForms();
  }

  function getFieldError(name: string, value: string): string | null {
    if (!submitted) return null;

    switch (name) {
      case "login":
        if (!value.trim()) return "Введите email или username";
        break;
      case "email":
        if (!value) return "Введите email";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Неверный формат email";
        break;
      case "username":
        if (!value) return "Введите username";
        if (value.length < 5 || value.length > 32) return "Username должен быть 5-32 символа";
        break;
      case "password":
        if (!value) return "Введите пароль";
        if (value.length < 8) return "Пароль должен быть минимум 8 символов";
        break;
      case "confirmPassword":
        if (!value) return "Подтвердите пароль";
        if (value !== registerForm.password) return "Пароли не совпадают";
        break;
    }
    return null;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setError("");

    const { login, password } = loginForm;
    const { email, username, password: regPassword, confirmPassword, first_name, last_name } = registerForm;

    if (isLogin) {
      if (!login.trim() || !password) {
        return;
      }
      try {
        await signin(login.trim(), password);
        clearForms();
        navigate((location.state as { from?: string })?.from ?? "/", { replace: true });
      } catch {
        setError("Не удалось выполнить авторизацию. Проверьте данные.");
      }
    } else {
      // Registration validation
      if (!email || !username || !regPassword || !confirmPassword) {
        return;
      }
      if (regPassword !== confirmPassword) {
        setError("Пароли не совпадают.");
        return;
      }
      const passwordChecks = [
        regPassword.length >= 8,
        /[A-Z]/.test(regPassword),
        /[a-z]/.test(regPassword),
        /[0-9]/.test(regPassword),
        /[^A-Za-z0-9]/.test(regPassword),
      ];
      if (passwordChecks.filter(Boolean).length < 4) {
        setError("Пароль слишком слабый. Минимум 8 символов и 4 из 5 критериев сложности.");
        return;
      }

      try {
        await signup({
          email,
          username,
          password: regPassword,
          first_name: first_name.trim() || undefined,
          last_name: last_name.trim() || undefined,
        });
        clearForms();
        navigate((location.state as { from?: string })?.from ?? "/", { replace: true });
      } catch {
        setError("Не удалось выполнить регистрацию. Возможно, email или username уже заняты.");
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <form onSubmit={onSubmit} className={`${ui.card} w-full max-w-md space-y-4`}>
        <h1 className={ui.title}>{isLogin ? "Вход" : "Регистрация"}</h1>
        {isLogin ? (
          <div className="space-y-1">
            <input
              name="login"
              placeholder="Email или username"
              className={ui.input}
              value={loginForm.login}
              onChange={(e) => setLoginForm((f) => ({ ...f, login: e.target.value }))}
              autoComplete="username"
            />
            {getFieldError("login", loginForm.login) && (
              <p className="text-xs text-rose-500">{getFieldError("login", loginForm.login)}</p>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <input
                name="email"
                type="text"
                placeholder="Email"
                className={ui.input}
                value={registerForm.email}
                onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))}
              />
              {getFieldError("email", registerForm.email) && (
                <p className="text-xs text-rose-500">{getFieldError("email", registerForm.email)}</p>
              )}
            </div>
            <div className="space-y-1">
              <input
                name="username"
                placeholder="Username (5-32 символов)"
                className={ui.input}
                value={registerForm.username}
                onChange={(e) => setRegisterForm((f) => ({ ...f, username: e.target.value }))}
              />
              {getFieldError("username", registerForm.username) && (
                <p className="text-xs text-rose-500">{getFieldError("username", registerForm.username)}</p>
              )}
            </div>
            <input
              name="first_name"
              placeholder="Имя (необязательно)"
              className={ui.input}
              value={registerForm.first_name}
              onChange={(e) => setRegisterForm((f) => ({ ...f, first_name: e.target.value }))}
              maxLength={100}
            />
            <input
              name="last_name"
              placeholder="Фамилия (необязательно)"
              className={ui.input}
              value={registerForm.last_name}
              onChange={(e) => setRegisterForm((f) => ({ ...f, last_name: e.target.value }))}
              maxLength={100}
            />
          </>
        )}
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Пароль"
              className={ui.input}
              value={isLogin ? loginForm.password : registerForm.password}
              onChange={(e) => {
                if (isLogin) {
                  setLoginForm((f) => ({ ...f, password: e.target.value }));
                } else {
                  setRegisterForm((f) => ({ ...f, password: e.target.value }));
                }
              }}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            {getFieldError("password", isLogin ? loginForm.password : registerForm.password) && (
              <p className="text-xs text-rose-500">
                {getFieldError("password", isLogin ? loginForm.password : registerForm.password)}
              </p>
            )}
          </div>
          <button type="button" className={ui.button} onClick={() => setShowPassword((p) => !p)}>
            {showPassword ? "Скрыть" : "Показать"}
          </button>
        </div>
        {!isLogin && (
          <>
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Подтвердите пароль"
                  className={ui.input}
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                />
                {getFieldError("confirmPassword", registerForm.confirmPassword) && (
                  <p className="text-xs text-rose-500">
                    {getFieldError("confirmPassword", registerForm.confirmPassword)}
                  </p>
                )}
              </div>
              <button
                type="button"
                className={ui.button}
                onClick={() => setShowConfirmPassword((p) => !p)}
              >
                {showConfirmPassword ? "Скрыть" : "Показать"}
              </button>
            </div>
            <div className="rounded-xl border border-border bg-bg p-3 text-xs text-text/80">
              Надежный пароль: от 8 символов, заглавная, строчная, цифра и спецсимвол.
            </div>
          </>
        )}
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <button className={`${ui.buttonPrimary} w-full`} type="submit">
          {isLogin ? "Войти" : "Создать аккаунт"}
        </button>
        <button type="button" className={`${ui.button} w-full`} onClick={switchMode}>
          {isLogin ? "Перейти к регистрации" : "У меня уже есть аккаунт"}
        </button>
      </form>
    </div>
  );
}
