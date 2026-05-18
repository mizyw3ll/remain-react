import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from "react";

export type SettingsTab = "main" | "profile";

type SettingsUiContextValue = {
  openSettings: (tab?: SettingsTab) => void;
};

const SettingsUiContext = createContext<SettingsUiContextValue | null>(null);

export function SettingsUiProvider({
  children,
  openSettings,
}: {
  children: ReactNode;
  openSettings: (tab?: SettingsTab) => void;
}) {
  const value = useMemo(() => ({ openSettings }), [openSettings]);
  return <SettingsUiContext.Provider value={value}>{children}</SettingsUiContext.Provider>;
}

export function useSettingsUi() {
  const ctx = useContext(SettingsUiContext);
  if (!ctx) throw new Error("useSettingsUi must be used inside SettingsUiProvider");
  return ctx;
}

export function useSettingsModalState() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<SettingsTab>("main");

  const openModal = useCallback((nextTab: SettingsTab = "main") => {
    setTab(nextTab);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => setOpen(false), []);

  return { open, tab, openModal, closeModal };
}
