export const ui = {
  page: "min-h-screen bg-bg text-text transition-colors duration-300",
  card: "rounded-2xl border border-border bg-card p-4 shadow-soft",
  title: "text-xl font-semibold text-title",
  subtitle: "text-sm text-text/80",
  button:
    "rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-accent",
  buttonPrimary:
    "rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90",
  input:
    "w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm outline-none transition focus:border-accent",
  navItem:
    "rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/10 hover:text-accent",
  navItemActive: "bg-accent/15 text-accent",
} as const;
