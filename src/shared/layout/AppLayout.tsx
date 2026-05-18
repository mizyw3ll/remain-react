import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useTheme } from "../../features/theme/ThemeContext";
import { ui } from "../../styles/ui";

const navItems = [
  { to: "/", label: "Дашборд" },
  { to: "/charts", label: "Финансовые графики" },
  { to: "/plans", label: "Бизнес-планы" },
  { to: "/profile", label: "Профиль" },
];

export function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { toggleTheme, theme } = useTheme();

  return (
    <div className={ui.page}>
      <div className="mx-auto flex min-h-screen w-full max-w-7xl">
        <div className="flex-1 p-4 md:p-6">
          <header className="mb-6 flex items-center justify-between gap-2">
            <button className={ui.button} onClick={() => setIsMenuOpen((p) => !p)}>
              Меню
            </button>
            <button className={ui.button} onClick={toggleTheme}>
              Тема: {theme === "light" ? "Светлая" : "Темная"}
            </button>
          </header>
          <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Outlet />
          </motion.main>
        </div>

        <motion.aside
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={clsx(
            "fixed inset-y-0 right-0 z-30 border-l border-border bg-card p-4 transition-all md:static md:translate-x-0",
            isCollapsed ? "w-20" : "w-72",
            isMenuOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
          )}
        >
          <div className="mb-6 flex items-center justify-between gap-2">
            {!isCollapsed && (
              <Link to="/" className="block text-xl font-bold text-title">
                Remain UI
              </Link>
            )}
            <button className={ui.button} onClick={() => setIsCollapsed((p) => !p)}>
              {isCollapsed ? ">" : "<"}
            </button>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  clsx(ui.navItem, isActive && ui.navItemActive, "block")
                }
              >
                {isCollapsed ? item.label.charAt(0) : item.label}
              </NavLink>
            ))}
          </nav>
        </motion.aside>
      </div>
      {isMenuOpen && (
        <button
          aria-label="close menu"
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
}
