import { Link } from "react-router-dom";
import { ScrollText, PiggyBank, FileText, BarChart3, Plus } from "lucide-react";
import { cardStyle, tw, v } from "../shared/theme";
import { useTheme } from "../features/theme/ThemeContext";
import { useDashboardQuery } from "../hooks/useCachedData";

export function DashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { data: dashboard, isLoading } = useDashboardQuery();

  if (isLoading) {
    return (
      <div className={tw.pageContainer}>
        <h1 className="text-2xl font-semibold" style={{ color: v("text-primary") }}>
          Дашборд
        </h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl"
              style={{ background: v("bg-hover") }}
            />
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
    { label: "Бизнес-планы", value: planCount, icon: ScrollText, color: "business" as const },
    { label: "Финансовые графики", value: chartCount, icon: PiggyBank, color: "financial" as const },
    { label: "Заметки", value: noteCount, icon: FileText, color: "note" as const },
    { label: "Всего блоков", value: blockCount, icon: BarChart3, color: "business" as const },
  ];

  return (
    <div className={tw.pageContainer}>
      <h1 className="text-2xl font-semibold" style={{ color: v("text-primary") }}>
        Дашборд
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border p-4 transition hover:-translate-y-0.5"
            style={cardStyle(stat.color, isDark)}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: v("bg-hover") }}
              >
                <stat.icon size={20} style={{ color: v("text-secondary") }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: v("text-primary") }}>
                  {stat.value}
                </p>
                <p className="text-sm" style={{ color: v("text-tertiary") }}>
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/business-plans"
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors"
          style={{ borderColor: v("border-secondary"), color: v("text-secondary") }}
          onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); e.currentTarget.style.color = v("text-primary"); }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = v("text-secondary"); }}
        >
          <Plus size={16} />
          Новый бизнес-план
        </Link>
        <Link
          to="/financial-plans"
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors"
          style={{ borderColor: v("border-secondary"), color: v("text-secondary") }}
          onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); e.currentTarget.style.color = v("text-primary"); }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = v("text-secondary"); }}
        >
          <Plus size={16} />
          Новый финансовый график
        </Link>
        <Link
          to="/notes"
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors"
          style={{ borderColor: v("border-secondary"), color: v("text-secondary") }}
          onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); e.currentTarget.style.color = v("text-primary"); }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = v("text-secondary"); }}
        >
          <Plus size={16} />
          Новая заметка
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <h2 className="mb-3 text-lg font-semibold" style={{ color: v("text-primary") }}>
            Последние бизнес-планы
          </h2>
          {dashboard?.recent_plans && dashboard.recent_plans.length > 0 ? (
            <div className="space-y-2">
              {dashboard.recent_plans.map((plan: { id: number; title: string; block_count: number }) => (
                <Link
                  key={plan.id}
                  to={`/business-plans/${plan.id}`}
                  className="block rounded-xl border p-3 transition hover:-translate-y-0.5"
                  style={cardStyle("business", isDark)}
                >
                  <p className="font-medium" style={{ color: v("text-primary") }}>
                    {plan.title}
                  </p>
                  <p className="text-sm" style={{ color: v("text-tertiary") }}>
                    {plan.block_count} блоков
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: v("text-tertiary") }}>
              Нет бизнес-планов
            </p>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold" style={{ color: v("text-primary") }}>
            Последние фин. графики
          </h2>
          {dashboard?.recent_charts && dashboard.recent_charts.length > 0 ? (
            <div className="space-y-2">
              {dashboard.recent_charts.map((chart: { id: number; title: string; point_count: number }) => (
                <Link
                  key={chart.id}
                  to={`/financial-plans/${chart.id}`}
                  className="block rounded-xl border p-3 transition hover:-translate-y-0.5"
                  style={cardStyle("financial", isDark)}
                >
                  <p className="font-medium" style={{ color: v("text-primary") }}>
                    {chart.title}
                  </p>
                  <p className="text-sm" style={{ color: v("text-tertiary") }}>
                    {chart.point_count} точек
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: v("text-tertiary") }}>
              Нет финансовых графиков
            </p>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold" style={{ color: v("text-primary") }}>
            Последние заметки
          </h2>
          {dashboard?.recent_notes && dashboard.recent_notes.length > 0 ? (
            <div className="space-y-2">
              {dashboard.recent_notes.map((note: { id: number; title: string }) => (
                <Link
                  key={note.id}
                  to="/notes"
                  className="block rounded-xl border p-3 transition hover:-translate-y-0.5"
                  style={cardStyle("note", isDark)}
                >
                  <p className="font-medium" style={{ color: v("text-primary") }}>
                    {note.title}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: v("text-tertiary") }}>
              Нет заметок
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
