import { createContext } from "react";

export type SettingsTab = "main" | "profile";

type SettingsUiContextValue = {
  openSettings: (tab?: SettingsTab) => void;
};

export const SettingsUiContext = createContext<SettingsUiContextValue | null>(null);
