import { Link } from "react-router-dom";
import { ScrollText, PiggyBank, FileText, BarChart3, Plus, ArrowRight, TrendingUp, Calendar } from "lucide-react";
import { v } from "../shared/theme";
import { useDashboardQuery } from "../hooks/useCachedData";
import { AnimatedCounter } from "../shared/components/AnimatedCounter";
import { GlassCard } from "../shared/components/GlassCard";

export function DashboardPage() {
  const { data: dashboard, isLoading } = useDashboardQuery();

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-48 skeleton rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-card h-28" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-card h-48" />
          ))}
        </div>
      </div>
    );
  }

  const planCount = dashboard?.plan_count ?? 0;
  const chartCount = dashboard?.chart_count ?? 0;
  const noteCount = dashboard?.note_count ?? 0;
  const blockCount = dashboard?.block_count ?? 0;

  const stats = [
    { label: "Бизнес-планы", value: planCount, icon: ScrollText, accent: "indigo", iconColor: "#818cf8" },
    { label: "Финансовые графики", value: chartCount, icon: PiggyBank, accent: "emerald", iconColor: "#34d399" },
    { label: "Заметки", value: noteCount, icon: FileText, accent: "amber", iconColor: "#fbbf24" },
    { label: "Всего блоков", value: blockCount, icon: BarChart3, accent: "rose", iconColor: "#fb7185" },
  ];

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: v("text-primary") }}>
          Дашборд
        </h1>
        <p className="mt-1 text-sm" style={{ color: v("text-muted") }}>
          Обзор ваших проектов и активности
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className={`animate-fade-in stagger-${i + 1}`}>
            <GlassCard accent={stat.accent as "indigo" | "emerald" | "amber" | "rose"}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl font-bold tracking-tight" style={{ color: v("text-primary") }}>
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <p className="mt-1.5 text-sm font-medium" style={{ color: v("text-secondary") }}>
                    {stat.label}
                  </p>
                </div>
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300"
                  style={{ background: `${stat.iconColor}15`, border: `1px solid ${stat.iconColor}25` }}
                >
                  <stat.icon size={22} style={{ color: stat.iconColor }} />
                </div>
              </div>
            </GlassCard>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="animate-fade-in stagger-5">
        <div className="flex flex-wrap gap-3">
          <Link
            to="/business-plans"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-400 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97]"
          >
            <Plus size={16} /> Новый бизнес-план
          </Link>
          <Link
            to="/financial-plans"
            className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[var(--bg-hover)] active:scale-[0.97]"
            style={{ borderColor: v("border-secondary"), color: v("text-secondary") }}
          >
            <Plus size={16} /> Новый финансовый график
          </Link>
          <Link
            to="/notes"
            className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[var(--bg-hover)] active:scale-[0.97]"
            style={{ borderColor: v("border-secondary"), color: v("text-secondary") }}
          >
            <Plus size={16} /> Новая заметка
          </Link>
        </div>
      </div>

      {/* Recent Items */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Plans */}
        <div className="animate-fade-in stagger-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold" style={{ color: v("text-primary") }}>
              <ScrollText size={18} style={{ color: "#818cf8" }} />
              Бизнес-планы
            </h2>
            <Link
              to="/business-plans"
              className="flex items-center gap-1 text-xs font-medium transition-colors duration-200 hover:text-indigo-400"
              style={{ color: v("text-muted") }}
            >
              Все <ArrowRight size={12} />
            </Link>
          </div>
          {dashboard?.recent_plans && dashboard.recent_plans.length > 0 ? (
            <div className="space-y-2">
              {dashboard.recent_plans.map(
                (plan: { id: number; title: string; block_count: number; created_at: string }, i: number) => (
                  <Link
                    key={plan.id}
                    to={`/business-plans/${plan.id}`}
                    className={`group block rounded-xl border p-4 backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-500/30 animate-fade-in stagger-${
                      i + 1
                    }`}
                    style={{ background: v("bg-card"), borderColor: v("border-primary") }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: v("text-primary") }}>
                          {plan.title}
                        </p>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="text-xs" style={{ color: v("text-muted") }}>
                            {plan.block_count} блоков
                          </span>
                          <span className="text-xs" style={{ color: v("text-muted") }}>
                            <Calendar size={10} className="mr-1 inline" />
                            {new Date(plan.created_at).toLocaleDateString("ru-RU")}
                          </span>
                        </div>
                      </div>
                      <ArrowRight
                        size={14}
                        className="ml-2 shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1"
                        style={{ color: v("accent-primary") }}
                      />
                    </div>
                  </Link>
                ),
              )}
            </div>
          ) : (
            <GlassCard hover={false}>
              <ScrollText size={24} className="mx-auto mb-2" style={{ color: v("text-muted") }} />
              <p className="text-sm text-center" style={{ color: v("text-muted") }}>
                Нет бизнес-планов
              </p>
            </GlassCard>
          )}
        </div>

        {/* Recent Charts */}
        <div className="animate-fade-in stagger-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold" style={{ color: v("text-primary") }}>
              <TrendingUp size={18} style={{ color: "#34d399" }} />
              Фин. графики
            </h2>
            <Link
              to="/financial-plans"
              className="flex items-center gap-1 text-xs font-medium transition-colors duration-200 hover:text-emerald-400"
              style={{ color: v("text-muted") }}
            >
              Все <ArrowRight size={12} />
            </Link>
          </div>
          {dashboard?.recent_charts && dashboard.recent_charts.length > 0 ? (
            <div className="space-y-2">
              {dashboard.recent_charts.map(
                (chart: { id: number; title: string; point_count: number; created_at: string }, i: number) => (
                  <Link
                    key={chart.id}
                    to={`/financial-plans/${chart.id}`}
                    className={`group block rounded-xl border p-4 backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-500/30 animate-fade-in stagger-${
                      i + 1
                    }`}
                    style={{ background: v("bg-card"), borderColor: v("border-primary") }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: v("text-primary") }}>
                          {chart.title}
                        </p>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="text-xs" style={{ color: v("text-muted") }}>
                            {chart.point_count} точек
                          </span>
                          <span className="text-xs" style={{ color: v("text-muted") }}>
                            <Calendar size={10} className="mr-1 inline" />
                            {new Date(chart.created_at).toLocaleDateString("ru-RU")}
                          </span>
                        </div>
                      </div>
                      <ArrowRight
                        size={14}
                        className="ml-2 shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1"
                        style={{ color: "#34d399" }}
                      />
                    </div>
                  </Link>
                ),
              )}
            </div>
          ) : (
            <GlassCard hover={false}>
              <TrendingUp size={24} className="mx-auto mb-2" style={{ color: v("text-muted") }} />
              <p className="text-sm text-center" style={{ color: v("text-muted") }}>
                Нет финансовых графиков
              </p>
            </GlassCard>
          )}
        </div>

        {/* Recent Notes */}
        <div className="animate-fade-in stagger-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold" style={{ color: v("text-primary") }}>
              <FileText size={18} style={{ color: "#fbbf24" }} />
              Заметки
            </h2>
            <Link
              to="/notes"
              className="flex items-center gap-1 text-xs font-medium transition-colors duration-200 hover:text-amber-400"
              style={{ color: v("text-muted") }}
            >
              Все <ArrowRight size={12} />
            </Link>
          </div>
          {dashboard?.recent_notes && dashboard.recent_notes.length > 0 ? (
            <div className="space-y-2">
              {dashboard.recent_notes.map((note: { id: number; title: string; created_at: string }, i: number) => (
                <Link
                  key={note.id}
                  to="/notes"
                  className={`group block rounded-xl border p-4 backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-amber-500/30 animate-fade-in stagger-${
                    i + 1
                  }`}
                  style={{ background: v("bg-card"), borderColor: v("border-primary") }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: v("text-primary") }}>
                        {note.title}
                      </p>
                      <div className="mt-1">
                        <span className="text-xs" style={{ color: v("text-muted") }}>
                          <Calendar size={10} className="mr-1 inline" />
                          {new Date(note.created_at).toLocaleDateString("ru-RU")}
                        </span>
                      </div>
                    </div>
                    <ArrowRight
                      size={14}
                      className="ml-2 shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1"
                      style={{ color: "#fbbf24" }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <GlassCard hover={false}>
              <FileText size={24} className="mx-auto mb-2" style={{ color: v("text-muted") }} />
              <p className="text-sm text-center" style={{ color: v("text-muted") }}>
                Нет заметок
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
