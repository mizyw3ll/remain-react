// ============================================
// Glassmorphism Theme — Indigo + Emerald
// ============================================

export const theme = {
  colors: {
    dark: {
      bg: {
        body: "#0c0a1d",
        primary: "#110f24",
        secondary: "#18162b",
        tertiary: "#1f1d35",
        card: "rgba(24, 22, 43, 0.8)",
        sidebar: "#110f24",
        modal: "rgba(31, 29, 53, 0.95)",
        hover: "rgba(99, 102, 241, 0.08)",
        active: "rgba(99, 102, 241, 0.15)",
        input: "rgba(31, 29, 53, 0.6)",
      },
      text: {
        primary: "#f0eeff",
        secondary: "#a5a0d0",
        muted: "#6b6599",
        tertiary: "#4a4570",
      },
      border: {
        primary: "rgba(99, 102, 241, 0.15)",
        secondary: "rgba(99, 102, 241, 0.25)",
        muted: "rgba(99, 102, 241, 0.08)",
      },
      accent: {
        primary: "#818cf8",
        secondary: "#6366f1",
      },
    },

    light: {
      bg: {
        body: "#f5f3ff",
        primary: "#ffffff",
        secondary: "#faf9ff",
        tertiary: "#f0eeff",
        card: "rgba(255, 255, 255, 0.85)",
        sidebar: "#ffffff",
        modal: "rgba(255, 255, 255, 0.98)",
        hover: "rgba(99, 102, 241, 0.06)",
        active: "rgba(99, 102, 241, 0.12)",
        input: "rgba(255, 255, 255, 0.8)",
      },
      text: {
        primary: "#1e1b4b",
        secondary: "#4338ca",
        muted: "#6366f1",
        tertiary: "#818cf8",
      },
      border: {
        primary: "rgba(99, 102, 241, 0.12)",
        secondary: "rgba(99, 102, 241, 0.2)",
        muted: "rgba(99, 102, 241, 0.06)",
      },
      accent: {
        primary: "#4f46e5",
        secondary: "#4338ca",
      },
    },
  },

  cards: {
    business: {
      dark: {
        bg: "rgba(24, 22, 43, 0.8)",
        border: "rgba(99, 102, 241, 0.15)",
        hoverBorder: "rgba(99, 102, 241, 0.35)",
        hoverBg: "rgba(99, 102, 241, 0.08)",
      },
      light: {
        bg: "rgba(255, 255, 255, 0.85)",
        border: "rgba(99, 102, 241, 0.12)",
        hoverBorder: "rgba(99, 102, 241, 0.3)",
        hoverBg: "rgba(99, 102, 241, 0.06)",
      },
    },
    financial: {
      dark: {
        bg: "rgba(24, 22, 43, 0.8)",
        border: "rgba(16, 185, 129, 0.15)",
        hoverBorder: "rgba(16, 185, 129, 0.35)",
        hoverBg: "rgba(16, 185, 129, 0.08)",
      },
      light: {
        bg: "rgba(255, 255, 255, 0.85)",
        border: "rgba(16, 185, 129, 0.12)",
        hoverBorder: "rgba(16, 185, 129, 0.3)",
        hoverBg: "rgba(16, 185, 129, 0.06)",
      },
    },
    note: {
      dark: {
        bg: "rgba(24, 22, 43, 0.8)",
        border: "rgba(245, 158, 11, 0.15)",
        hoverBorder: "rgba(245, 158, 11, 0.35)",
        hoverBg: "rgba(245, 158, 11, 0.08)",
      },
      light: {
        bg: "rgba(255, 255, 255, 0.85)",
        border: "rgba(245, 158, 11, 0.12)",
        hoverBorder: "rgba(245, 158, 11, 0.3)",
        hoverBg: "rgba(245, 158, 11, 0.06)",
      },
    },
  },

  blocks: {
    business: {
      dark: {
        bg: "rgba(24, 22, 43, 0.8)",
        border: "rgba(99, 102, 241, 0.15)",
        hoverBg: "rgba(99, 102, 241, 0.08)",
      },
      light: {
        bg: "rgba(255, 255, 255, 0.85)",
        border: "rgba(99, 102, 241, 0.12)",
        hoverBg: "rgba(99, 102, 241, 0.06)",
      },
    },
  },

  inputs: {
    dark: {
      bg: "rgba(31, 29, 53, 0.6)",
      border: "rgba(99, 102, 241, 0.15)",
      text: "#f0eeff",
    },
    light: {
      bg: "rgba(255, 255, 255, 0.8)",
      border: "rgba(99, 102, 241, 0.12)",
      text: "#1e1b4b",
    },
  },

  buttons: {
    primary: {
      dark: { bg: "#6366f1", text: "#ffffff" },
      light: { bg: "#4f46e5", text: "#ffffff" },
    },
    secondary: {
      dark: { border: "rgba(99, 102, 241, 0.3)", text: "#a5a0d0" },
      light: { border: "rgba(99, 102, 241, 0.25)", text: "#4338ca" },
    },
    danger: {
      dark: {
        border: "rgba(239, 68, 68, 0.4)",
        text: "#fca5a5",
        bg: "rgba(239, 68, 68, 0.1)",
      },
      light: {
        border: "rgba(239, 68, 68, 0.3)",
        text: "#dc2626",
        bg: "rgba(239, 68, 68, 0.06)",
      },
    },
  },

  // Gradient accents
  gradients: {
    primary: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
    success: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    warning: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    danger: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
    glass: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)",
  },
} as const;

// Helper to get CSS variable
export const v = (name: string) => `var(--${name})`;

// Common style objects for inline styles
export const styles = {
  pageTitle: { color: v("text-primary"), fontFamily: "'Poppins', sans-serif" },
  cardText: { color: v("text-secondary") },
  cardMuted: { color: v("text-muted") },
  input: {
    background: v("bg-input"),
    border: `1px solid ${v("border-primary")}`,
    color: v("text-primary"),
    borderRadius: "12px",
    transition: "all 0.2s ease-out",
  },
} as const;

// Tailwind classes for common patterns
export const tw = {
  pageContainer: "space-y-6",
  pageTitle: "text-2xl font-semibold tracking-tight",
  grid: "grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
  cardBase:
    "group block rounded-xl border p-6 backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg cursor-pointer",
  modalOverlay: "fixed inset-0 z-[90] grid place-items-center p-4 backdrop-blur-sm bg-black/40",
  modalContent: "w-full max-w-lg rounded-2xl border p-6 backdrop-blur-xl",
  inputBase:
    "w-full rounded-xl border px-4 py-2.5 backdrop-blur-sm transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400",
  buttonBase: "rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 ease-out active:scale-[0.97]",
  buttonPrimary:
    "rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 ease-out hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.97]",
  buttonSecondary:
    "rounded-xl border px-5 py-2.5 text-sm font-medium transition-all duration-200 ease-out hover:bg-indigo-500/5 active:scale-[0.97]",
  buttonDanger:
    "rounded-xl border px-5 py-2.5 text-sm font-medium transition-all duration-200 ease-out hover:bg-red-500/5 active:scale-[0.97]",
} as const;

// Get card style object for inline styles — glassmorphism with depth
export function cardStyle(type: "business" | "financial" | "note", isDark: boolean) {
  const t = theme.cards[type][isDark ? "dark" : "light"];
  return {
    background: isDark
      ? `linear-gradient(145deg, ${t.bg}, rgba(24,22,43,0.65))`
      : `linear-gradient(145deg, ${t.bg}, rgba(255,255,255,0.7))`,
    border: `1px solid ${t.border}`,
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxShadow: isDark
      ? "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)"
      : "0 2px 12px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)",
  };
}

// Get card hover style object
export function cardHoverStyle(type: "business" | "financial" | "note", isDark: boolean) {
  const t = theme.cards[type][isDark ? "dark" : "light"];
  return {
    background: isDark
      ? `linear-gradient(145deg, ${t.hoverBg}, rgba(24,22,43,0.55))`
      : `linear-gradient(145deg, ${t.hoverBg}, rgba(255,255,255,0.6))`,
    border: `1px solid ${t.hoverBorder}`,
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxShadow: isDark
      ? `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)`
      : `0 8px 32px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.7)`,
  };
}

// Get input style object
export function inputStyle(isDark: boolean) {
  const t = theme.inputs[isDark ? "dark" : "light"];
  return {
    backgroundColor: t.bg,
    border: `1px solid ${t.border}`,
    color: t.text,
    borderRadius: "12px",
    transition: "all 0.2s ease-out",
  };
}

// Get button style object
export function buttonStyle(variant: "primary" | "secondary" | "danger", isDark: boolean) {
  const mode = isDark ? "dark" : "light";
  if (variant === "primary") {
    const t = theme.buttons.primary[mode];
    return {
      background: t.bg,
      color: t.text,
    };
  }
  if (variant === "secondary") {
    const t = theme.buttons.secondary[mode];
    return {
      border: `1px solid ${t.border}`,
      color: t.text,
    };
  }
  const t = theme.buttons.danger[mode];
  return {
    background: t.bg,
    border: `1px solid ${t.border}`,
    color: t.text,
  };
}

// Primary action button styles
export function primaryButtonStyle(disabled?: boolean) {
  return {
    background: theme.gradients.primary,
    color: "#ffffff",
    opacity: disabled ? 0.5 : 1,
    boxShadow: disabled ? "none" : "0 4px 14px rgba(99, 102, 241, 0.35)",
  };
}

// Primary button hover handlers
export function primaryButtonHandlers(canInteract: boolean) {
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      if (canInteract) {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(99, 102, 241, 0.4)";
      }
    },
    onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
      if (canInteract) {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 14px rgba(99, 102, 241, 0.35)";
      }
    },
  };
}
