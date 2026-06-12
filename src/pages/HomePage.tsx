import { Link, Navigate } from "react-router-dom";
import { ScrollText, PiggyBank, FileText, LayoutGrid, Users, Calendar, ArrowRight } from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";

const features = [
  { icon: ScrollText, title: "Бизнес-планы", desc: "Создавайте и управляйте бизнес-планами с наглядной структурой" },
  { icon: PiggyBank, title: "Финансовые планы", desc: "Визуализируйте доходы и расходы на интерактивных графиках" },
  { icon: FileText, title: "Заметки", desc: "Ведите записи с поддержкой Markdown и Rich Text" },
  { icon: LayoutGrid, title: "Kanban-доски", desc: "Организуйте задачи по методологии Agile" },
  { icon: Users, title: "CRM", desc: "Управляйте контактами, сделками и воронкой продаж" },
  { icon: Calendar, title: "Календарь", desc: "Планируйте события и отслеживайте налоговые даты" },
];

export function HomePage({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Blob decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-blob-rotate rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        <div className="absolute -right-32 top-1/3 h-80 w-80 animate-blob-rotate rounded-full opacity-15 blur-3xl" style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)', animationDelay: '-7s' }} />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 animate-blob-rotate rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)', animationDelay: '-14s' }} />
      </div>

      {/* Nav */}
      <nav className="fixed left-4 top-4 z-40 flex items-center gap-2 rounded-xl border p-2" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
        {["Бизнес-планы", "Финансовые планы"].map((item) => (
          <Link key={item} to="#" className="rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-hover)]">{item}</Link>
        ))}
        <button type="button" onClick={onOpenAuth} className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200">
          Войти
        </button>
      </nav>

      {/* Hero section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="animate-fade-in max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm animate-fade-in" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-subtle" />
            Платформа для управления проектами
          </div>

          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Управляйте{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              бизнесом
            </span>{" "}
            эффективно
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-lg" style={{ color: 'var(--text-secondary)' }}>
            Современный инструмент для создания бизнес-планов, финансового моделирования,
            управления задачами и ведения CRM — всё в одном месте.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button type="button" onClick={onOpenAuth}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-400 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97]">
              Начать работу <ArrowRight size={16} />
            </button>
            <button type="button" onClick={onOpenAuth}
              className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--bg-hover)] active:scale-[0.97]"
              style={{ borderColor: 'var(--border-secondary)', color: 'var(--text-secondary)' }}>
              Узнать больше
            </button>
          </div>
        </div>

        {/* Preview cards */}
        <div className="mt-16 grid w-full max-w-5xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`group animate-slide-up rounded-2xl border p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-500/30 stagger-${i + 1}`}
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <f.icon size={20} style={{ color: '#818cf8' }} />
              </div>
              <h3 className="mb-1 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t px-6 py-8 text-center" style={{ borderColor: 'var(--border-primary)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>© 2026 Remain. Все права защищены.</p>
      </footer>
    </main>
  );
}
