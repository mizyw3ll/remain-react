import type { ReactNode, CSSProperties } from "react";
import clsx from "clsx";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  accent?: "indigo" | "emerald" | "amber" | "rose" | "sky";
  hover?: boolean;
  onClick?: () => void;
  as?: "div" | "a" | "button";
  href?: string;
  padding?: "normal" | "compact" | "none";
};

const accentConfig: Record<string, { bar: string; glow: string; shadow: string; borderHover: string }> = {
  indigo: {
    bar: "linear-gradient(90deg, #6366f1, #a5b4fc, #6366f1)",
    glow: "radial-gradient(circle at 100% 0%, rgba(99,102,241,0.12), transparent 70%)",
    shadow: "hover:shadow-indigo-500/10",
    borderHover: "hover:border-indigo-500/30",
  },
  emerald: {
    bar: "linear-gradient(90deg, #10b981, #6ee7b7, #10b981)",
    glow: "radial-gradient(circle at 100% 0%, rgba(16,185,129,0.12), transparent 70%)",
    shadow: "hover:shadow-emerald-500/10",
    borderHover: "hover:border-emerald-500/30",
  },
  amber: {
    bar: "linear-gradient(90deg, #f59e0b, #fde68a, #f59e0b)",
    glow: "radial-gradient(circle at 100% 0%, rgba(245,158,11,0.12), transparent 70%)",
    shadow: "hover:shadow-amber-500/10",
    borderHover: "hover:border-amber-500/30",
  },
  rose: {
    bar: "linear-gradient(90deg, #f43f5e, #fda4af, #f43f5e)",
    glow: "radial-gradient(circle at 100% 0%, rgba(244,63,94,0.12), transparent 70%)",
    shadow: "hover:shadow-rose-500/10",
    borderHover: "hover:border-rose-500/30",
  },
  sky: {
    bar: "linear-gradient(90deg, #0ea5e9, #7dd3fc, #0ea5e9)",
    glow: "radial-gradient(circle at 100% 0%, rgba(14,165,233,0.12), transparent 70%)",
    shadow: "hover:shadow-sky-500/10",
    borderHover: "hover:border-sky-500/30",
  },
};

const paddingMap: Record<string, string> = {
  normal: "p-6",
  compact: "p-4",
  none: "p-0",
};

export function GlassCard({
  children,
  className,
  accent = "indigo",
  hover = true,
  onClick,
  as = "div",
  href,
  padding = "normal",
}: GlassCardProps) {
  const cfg = accentConfig[accent];

  const base = clsx(
    "relative rounded-xl border backdrop-blur-sm overflow-hidden",
    paddingMap[padding],
    hover && [
      "transition-all duration-300 ease-out",
      "hover:-translate-y-1",
      "hover:shadow-xl",
      cfg.shadow,
      cfg.borderHover,
      "cursor-pointer",
    ],
    className,
  );

  const style: CSSProperties = {
    background: "var(--bg-card)",
    borderColor: "var(--border-primary)",
  };

  const content = (
    <>
      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-80" style={{ background: cfg.bar }} />
      <div className="absolute inset-0 opacity-40" style={{ background: cfg.glow }} />
      <div className="relative z-10">{children}</div>
    </>
  );

  if (as === "a" && href) {
    return (
      <a href={href} className={base} style={style}>
        {content}
      </a>
    );
  }

  if (as === "button") {
    return (
      <button type="button" onClick={onClick} className={base} style={style}>
        {content}
      </button>
    );
  }

  return (
    <div onClick={onClick} className={base} style={style}>
      {content}
    </div>
  );
}
