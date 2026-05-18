import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { ACCESS_TOKEN_KEY } from "../../shared/api/http";
import type { User } from "../../shared/types/models";
import * as authApi from "./authApi";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signin: (login: string, password: string) => Promise<void>;
  signup: (payload: {
    email: string;
    username: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }) => Promise<void>;
  signout: () => void;
  requestVerify: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  });

  const loadMe = useCallback(async () => {
    try {
      setUser(await authApi.me());
    } catch {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(ACCESS_TOKEN_KEY)) {
      return;
    }
    void loadMe();
  }, [loadMe]);

  const signin = useCallback(async (login: string, password: string) => {
    const token = await authApi.login({ username: login, password });
    localStorage.setItem(ACCESS_TOKEN_KEY, token.access_token);
    setUser(await authApi.me());
  }, []);

  const signup = useCallback(
    async (payload: {
      email: string;
      username: string;
      password: string;
      first_name?: string;
      last_name?: string;
    }) => {
      await authApi.register(payload);
      await signin(payload.email, payload.password);
    },
    [signin],
  );

  const signout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setUser(null);
  }, []);

  const requestVerify = useCallback(async () => {
    await authApi.requestVerification();
  }, []);

  const value = useMemo(
    () => ({ user, loading, signin, signup, signout, requestVerify }),
    [user, loading, signin, signup, signout, requestVerify],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
