// ============================================
// Neutral Theme Configuration - No Neon/Glow
// ============================================

export const theme = {
  colors: {
    // Dark theme - Deep charcoal
    dark: {
      bg: {
        body: "#0a0a0a",
        primary: "#0f0f0f",
        secondary: "#171717",
        tertiary: "#1f1f1f",
        card: "#171717",
        sidebar: "#171717",
        modal: "#1f1f1f",
        hover: "#2a2a2a",
        active: "#333333",
        input: "#1f1f1f",
      },
      text: {
        primary: "#ededed",
        secondary: "#a3a3a3",
        muted: "#737373",
        tertiary: "#525252",
      },
      border: {
        primary: "#2a2a2a",
        secondary: "#3a3a3a",
        muted: "#1f1f1f",
      },
      accent: {
        primary: "#f5f5f5",
        secondary: "#d4d4d4",
      },
    },

    // Light theme - Milk/Cream
    light: {
      bg: {
        body: "#fdfbf7",
        primary: "#fefaf5",
        secondary: "#ffffff",
        tertiary: "#faf8f5",
        card: "#ffffff",
        sidebar: "#ffffff",
        modal: "#ffffff",
        hover: "#f5f0e8",
        active: "#e8e2d9",
        input: "#ffffff",
      },
      text: {
        primary: "#1a1a1a",
        secondary: "#5c5c5c",
        muted: "#8a8a8a",
        tertiary: "#a3a3a3",
      },
      border: {
        primary: "#e8e2d9",
        secondary: "#d4ccc0",
        muted: "#f0ebe4",
      },
      accent: {
        primary: "#2c2c2c",
        secondary: "#4a4a4a",
      },
    },
  },

  // Card styles - NO gradients, NO glow
  cards: {
    business: {
      dark: {
        bg: "#171717",
        border: "#2a2a2a",
        hoverBorder: "#3a3a3a",
        hoverBg: "#1f1f1f",
      },
      light: {
        bg: "#ffffff",
        border: "#e8e2d9",
        hoverBorder: "#d4ccc0",
        hoverBg: "#faf8f5",
      },
    },
    financial: {
      dark: {
        bg: "#171717",
        border: "#2a2a2a",
        hoverBorder: "#3a3a3a",
        hoverBg: "#1f1f1f",
      },
      light: {
        bg: "#ffffff",
        border: "#e8e2d9",
        hoverBorder: "#d4ccc0",
        hoverBg: "#faf8f5",
      },
    },
    note: {
      dark: {
        bg: "#171717",
        border: "#2a2a2a",
        hoverBorder: "#3a3a3a",
        hoverBg: "#1f1f1f",
      },
      light: {
        bg: "#ffffff",
        border: "#e8e2d9",
        hoverBorder: "#d4ccc0",
        hoverBg: "#faf8f5",
      },
    },
  },

  // Block styles - NO gradients
  blocks: {
    business: {
      dark: {
        bg: "#171717",
        border: "#2a2a2a",
        hoverBg: "#1f1f1f",
      },
      light: {
        bg: "#ffffff",
        border: "#e8e2d9",
        hoverBg: "#faf8f5",
      },
    },
  },

  // Input styles
  inputs: {
    dark: { bg: "#1f1f1f", border: "#2a2a2a", text: "#ededed" },
    light: { bg: "#ffffff", border: "#e8e2d9", text: "#1a1a1a" },
  },

  // Button styles - Neutral only
  buttons: {
    primary: {
      dark: { bg: "#f5f5f5", text: "#0a0a0a" },
      light: { bg: "#2c2c2c", text: "#ffffff" },
    },
    secondary: {
      dark: { border: "#3a3a3a", text: "#a3a3a3" },
      light: { border: "#d4ccc0", text: "#5c5c5c" },
    },
    danger: {
      dark: { border: "rgba(220, 38, 38, 0.5)", text: "rgb(252, 165, 165)", bg: "rgba(220, 38, 38, 0.08)" },
      light: { border: "rgba(220, 38, 38, 0.4)", text: "rgb(220, 38, 38)", bg: "rgba(220, 38, 38, 0.05)" },
    },
  },
} as const;

// Helper to get CSS variable
export const v = (name: string) => `var(--${name})`;

// Common style objects for inline styles
export const styles = {
  pageTitle: { color: v("text-primary") },
  cardText: { color: v("text-secondary") },
  cardMuted: { color: v("text-muted") },
  input: {
    background: v("bg-secondary"),
    border: `1px solid ${v("border-primary")}`,
    color: v("text-primary"),
  },
} as const;

// Tailwind classes for common patterns
export const tw = {
  pageContainer: "space-y-4",
  pageTitle: "text-2xl font-semibold",
  grid: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
  cardBase: "group block rounded-2xl border p-4 transition hover:-translate-y-0.5",
  modalOverlay: "fixed inset-0 z-[90] grid place-items-center p-4",
  modalContent: "w-full max-w-lg rounded-2xl border p-4",
  inputBase: "w-full rounded-xl border px-3 py-2",
  buttonBase: "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
  buttonPrimary: "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
  buttonSecondary: "rounded-lg border px-4 py-2 text-sm transition-colors",
  buttonDanger: "rounded-lg border px-4 py-2 text-sm transition-colors",
} as const;

// Get card style object for inline styles - NO shadows
export function cardStyle(type: "business" | "financial" | "note", isDark: boolean) {
  const t = theme.cards[type][isDark ? "dark" : "light"];
  return {
    background: t.bg,
    border: `1px solid ${t.border}`,
  };
}

// Get card hover style object - NO glow effects
export function cardHoverStyle(type: "business" | "financial" | "note", isDark: boolean) {
  const t = theme.cards[type][isDark ? "dark" : "light"];
  return {
    background: t.hoverBg,
    border: `1px solid ${t.hoverBorder}`,
  };
}

// Get input style object
export function inputStyle(isDark: boolean) {
  const t = theme.inputs[isDark ? "dark" : "light"];
  return {
    background: t.bg,
    border: `1px solid ${t.border}`,
    color: t.text,
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
  // danger
  const t = theme.buttons.danger[mode];
  return {
    background: t.bg,
    border: `1px solid ${t.border}`,
    color: t.text,
  };
}

// Primary action button styles (for "Add", "Save", "Create" buttons)
export function primaryButtonStyle(disabled?: boolean) {
  return {
    background: v("text-primary"),
    color: v("bg-body"),
    opacity: disabled ? 0.5 : 1,
  };
}

// Primary button hover handlers
export function primaryButtonHandlers(canInteract: boolean) {
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      if (canInteract) e.currentTarget.style.opacity = "0.9";
    },
    onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
      if (canInteract) e.currentTarget.style.opacity = "1";
    },
  };
}
