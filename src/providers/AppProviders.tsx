import { AuthProvider } from "../features/auth/AuthContext";
import { ThemeProvider } from "../features/theme/ThemeContext";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
