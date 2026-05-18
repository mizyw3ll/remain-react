import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { ExpandableText } from "../components/ExpandableText";
import { CartesianGrid, Line, Area, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import toast from "react-hot-toast";
import {
  createChartPointApi,
  deleteChartPointApi,
  deleteFinancialPlanApi,
  getCurrenciesApi,
  getChartPointsApi,
  getFinancialPlanApi,
  updateFinancialPlanApi,
  updateChartPointApi,
  type ChartPoint,
  type Currency,
  type FinancialPlan,
} from "../api";
import { ConfirmModal } from "../components/ConfirmModal";
import { PointModal } from "../components/PointModal";
import { inputStyle, buttonStyle, tw, v } from "../shared/theme";
import { useTheme } from "../features/theme/ThemeContext";

type Timeframe = "1H" | "1D" | "1M" | "3M" | "1Y";

type PointFormState = {
  date: string;
  type: "income" | "expense";
  amount: string;
  description: string;
};

function getLocalDateTimeWithSeconds(date = new Date()) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 19);
}

type TimeframeConfig = {
  rangeMs: number;
  bucket: "hour" | "day" | "month";
};

type AggregatedPoint = {
  date: string;
  timestamp: number;
  income: number;
  expense: number;
  total: number;
};

const TIMEFRAME_CONFIG: Record<Timeframe, TimeframeConfig> = {
  "1H": { rangeMs: 60 * 60 * 1000, bucket: "hour" },
  "1D": { rangeMs: 24 * 60 * 60 * 1000, bucket: "hour" },
  "1M": { rangeMs: 30 * 24 * 60 * 60 * 1000, bucket: "day" },
  "3M": { rangeMs: 90 * 24 * 60 * 60 * 1000, bucket: "day" },
  "1Y": { rangeMs: 365 * 24 * 60 * 60 * 1000, bucket: "month" },
};

function getBucketDate(date: Date, bucket: TimeframeConfig["bucket"]) {
  if (bucket === "hour") {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
  }
  if (bucket === "day") {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getBucketLabel(date: Date, bucket: TimeframeConfig["bucket"]) {
  if (bucket === "hour") {
    return date.toLocaleString([], { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  }
  if (bucket === "day") {
    return date.toLocaleDateString();
  }
  return date.toLocaleString([], { month: "long", year: "numeric" });
}

function buildChartData(points: ChartPoint[], timeframe: Timeframe): AggregatedPoint[] {
  const now = Date.now();
  const { rangeMs, bucket } = TIMEFRAME_CONFIG[timeframe];
  const threshold = now - rangeMs;
  const filteredPoints = points.filter((point) => new Date(point.date).getTime() >= threshold);

  // Sort points by date chronologically
  const sortedPoints = filteredPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const aggregated = new Map<number, AggregatedPoint>();
  let runningTotal = 0;

  sortedPoints.forEach((point) => {
    const pointDate = new Date(point.date);
    const bucketDate = getBucketDate(pointDate, bucket);
    const bucketTimestamp = bucketDate.getTime();
    const amount = Number(point.amount);

    // Update running total
    if (point.type === "income") {
      runningTotal += amount;
    } else {
      runningTotal -= amount;
    }

    const existing = aggregated.get(bucketTimestamp);
    if (existing) {
      // Update existing bucket with new total
      existing.total = runningTotal;
    } else {
      // Create new bucket
      const base: AggregatedPoint = {
        date: getBucketLabel(bucketDate, bucket),
        timestamp: bucketTimestamp,
        income: point.type === "income" ? amount : 0,
        expense: point.type === "expense" ? amount : 0,
        total: runningTotal,
      };
      aggregated.set(bucketTimestamp, base);
    }
  });

  return Array.from(aggregated.values()).sort((a, b) => a.timestamp - b.timestamp);
}

export function FinancialPlanDetailsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { id } = useParams();
  const navigate = useNavigate();
  const chartId = Number(id);

  const [chart, setChart] = useState<FinancialPlan | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const [deleteTarget, setDeleteTarget] = useState<{ type: "chart" | "point"; id: number; title: string } | null>(
    null,
  );
  const [isEditingChart, setIsEditingChart] = useState(false);
  const [chartForm, setChartForm] = useState({
    title: "",
    description: "",
    currency_id: 0,
    is_active: true,
  });

  // Point modal state
  const [pointModalOpen, setPointModalOpen] = useState(false);
  const [editingPointId, setEditingPointId] = useState<number | null>(null);
  const [form, setForm] = useState<PointFormState>({
    date: getLocalDateTimeWithSeconds(),
    type: "income" as "income" | "expense",
    amount: "",
    description: "",
  });

  const isEditingPoint = editingPointId !== null;

  const chartData = useMemo(() => buildChartData(points, timeframe), [points, timeframe]);

  const fetchData = useCallback(async () => {
    if (!chartId) return;
    try {
      setLoading(true);
      const [chartData, pointsData, currenciesData] = await Promise.all([
        getFinancialPlanApi(chartId),
        getChartPointsApi(chartId),
        getCurrenciesApi(),
      ]);
      setChart(chartData);
      setChartForm({
        title: chartData.title,
        description: chartData.description ?? "",
        currency_id: chartData.currency_id,
        is_active: chartData.is_active,
      });
      setCurrencies(currenciesData);
      setPoints(pointsData);
    } catch {
      toast.error("Не удалось загрузить график");
    } finally {
      setLoading(false);
    }
  }, [chartId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  function openCreatePointModal() {
    setEditingPointId(null);
    setForm({
      date: getLocalDateTimeWithSeconds(),
      type: "income",
      amount: "",
      description: "",
    });
    setPointModalOpen(true);
  }

  function startEdit(point: ChartPoint) {
    setEditingPointId(point.id);
    setForm({
      date: getLocalDateTimeWithSeconds(new Date(point.date)),
      type: point.type,
      amount: String(point.amount),
      description: point.description || "",
    });
    setPointModalOpen(true);
  }

  function resetForm() {
    setForm({
      date: getLocalDateTimeWithSeconds(),
      type: "income",
      amount: "",
      description: "",
    });
    setEditingPointId(null);
    setPointModalOpen(false);
  }

  async function savePoint() {
    if (!chartId) return;
    const numAmount = Number(form.amount);
    if (!form.date || Number.isNaN(numAmount)) return;
    try {
      const payload = {
        date: new Date(form.date).toISOString(),
        type: form.type,
        amount: numAmount,
        description: form.description || undefined,
      };

      if (editingPointId) {
        await updateChartPointApi(chartId, editingPointId, payload);
      } else {
        await createChartPointApi(chartId, payload);
      }

      resetForm();
      await fetchData();
      toast.success(editingPointId ? "Точка обновлена" : "Финансовая точка добавлена");
    } catch {
      toast.error(editingPointId ? "Ошибка обновления точки" : "Ошибка добавления точки");
    }
  }

  function handleFormChange(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  async function confirmDelete() {
    if (!deleteTarget || !chartId) return;
    try {
      if (deleteTarget.type === "chart") {
        await deleteFinancialPlanApi(deleteTarget.id);
        toast.success("График удален");
        navigate("/financial-plans");
      } else {
        await deleteChartPointApi(chartId, deleteTarget.id);
        toast.success("Точка удалена");
        await fetchData();
      }
    } catch {
      toast.error("Ошибка удаления");
    } finally {
      setDeleteTarget(null);
    }
  }

  async function saveChart() {
    if (!chartId || !chart || !chartForm.title.trim()) return;
    try {
      const updated = await updateFinancialPlanApi(chartId, {
        title: chartForm.title.trim(),
        description: chartForm.description.trim() || undefined,
        currency_id: chartForm.currency_id,
        is_active: chartForm.is_active,
      });
      setChart(updated);
      setChartForm({
        title: updated.title,
        description: updated.description ?? "",
        currency_id: updated.currency_id,
        is_active: updated.is_active,
      });
      setIsEditingChart(false);
      toast.success("Финансовый план обновлен");
    } catch {
      toast.error("Ошибка обновления финансового плана");
    }
  }

  if (loading) return <div className="h-48 animate-pulse rounded-2xl" style={{ background: v("bg-hover") }} />;
  if (!chart) return <div style={{ color: v("text-secondary") }}>График не найден</div>;

  return (
    <section className="space-y-6 pb-8 pt-2">
      <article
        className="rounded-2xl border p-5"
        style={{
          borderColor: v("border-primary"),
          background: v("bg-secondary"),
        }}
      >
        <div className="space-y-3">
          {/* Title row with buttons */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              {isEditingChart ? (
                <input
                  className={tw.inputBase}
                  style={inputStyle(isDark)}
                  value={chartForm.title}
                  onChange={(e) => setChartForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              ) : (
                <ExpandableText
                  text={chart.title}
                  fontSize="text-2xl"
                  fontWeight="font-semibold"
                  color="text-primary"
                />
              )}
            </div>
            <div className="shrink-0 flex flex-wrap gap-2">
              {isEditingChart ? (
                <>
                  <button className={tw.buttonPrimary} onClick={() => void saveChart()}>
                    Сохранить
                  </button>
                  <button
                    className={tw.buttonSecondary}
                    style={buttonStyle("secondary", isDark)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    onClick={() => {
                      setChartForm({
                        title: chart.title,
                        description: chart.description ?? "",
                        currency_id: chart.currency_id,
                        is_active: chart.is_active,
                      });
                      setIsEditingChart(false);
                    }}
                  >
                    Отмена
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
                    style={buttonStyle("secondary", isDark)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    onClick={() => setIsEditingChart(true)}
                  >
                    <Pencil size={16} />
                    <span className="hidden sm:inline">Редактировать</span>
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
                    style={buttonStyle("danger", isDark)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(220, 38, 38, 0.2)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    onClick={() => setDeleteTarget({ type: "chart", id: chart.id, title: chart.title })}
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Удалить</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Description and details - full width */}
          {isEditingChart ? (
            <div className="space-y-2">
              <textarea
                className={tw.inputBase}
                style={inputStyle(isDark)}
                value={chartForm.description}
                onChange={(e) => setChartForm((prev) => ({ ...prev, description: e.target.value }))}
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <select
                  className={tw.inputBase}
                  style={inputStyle(isDark)}
                  value={chartForm.currency_id}
                  onChange={(e) => setChartForm((prev) => ({ ...prev, currency_id: Number(e.target.value) }))}
                >
                  <option value={0}>Выберите валюту</option>
                  {currencies.map((currency) => (
                    <option key={currency.id} value={currency.id}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
                <label
                  className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
                  style={{ borderColor: v("border-primary"), color: v("text-secondary") }}
                >
                  <input
                    type="checkbox"
                    checked={chartForm.is_active}
                    onChange={(e) => setChartForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  />
                  Активный график
                </label>
              </div>
            </div>
          ) : (
            <>
              <ExpandableText text={chart.description || "Без описания"} />
              <p className="text-sm" style={{ color: v("text-muted") }}>
                Валюта: {currencies.find((currency) => currency.id === chart.currency_id)?.code ?? `ID ${chart.currency_id}`} |
                Статус:
                <span style={{ color: chart.is_active ? "#16a34a" : v("text-muted") }}>
                  {chart.is_active ? " активен" : " неактивен"}
                </span>
              </p>
            </>
          )}
        </div>
      </article>

      <article
        className="rounded-2xl border p-5"
        style={{
          borderColor: v("border-primary"),
          background: v("bg-secondary"),
        }}
      >
        <div className="relative mb-3 flex flex-wrap gap-2">
          {(["1H", "1D", "1M", "3M", "1Y"] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              className="rounded-lg px-3 py-1.5 text-xs transition-colors"
              style={timeframe === tf
                ? { background: v("bg-active"), color: v("text-primary") }
                : { background: v("bg-secondary"), color: v("text-secondary") }
              }
              onClick={() => setTimeframe(tf)}
            >
              {tf === "1H" ? "1 час" : tf === "1D" ? "День" : tf === "1M" ? "Месяц" : tf === "3M" ? "3 месяца" : "Год"}
            </button>
          ))}
        </div>
        {/* Chart with horizontal scroll on mobile */}
        {points.length < 2 ? (
          <div
            className="flex h-80 items-center justify-center rounded-xl border p-6"
            style={{ borderColor: v("border-primary"), background: v("bg-hover") }}
          >
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: v("text-secondary") }}>
                Для отображения графика необходимо добавить минимум 2 точки
              </p>
              <button
                className="mt-3 rounded-lg border px-4 py-2 text-sm transition-colors"
                style={buttonStyle("primary", isDark)}
                onClick={openCreatePointModal}
              >
                Добавить точку
              </button>
            </div>
          </div>
        ) : (
          <div className="relative h-80 w-full overflow-x-auto overflow-y-hidden">
            <div className="h-full min-w-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isDark ? "#a3a3a3" : "#5c5c5c"} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={isDark ? "#a3a3a3" : "#5c5c5c"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <CartesianGrid stroke={isDark ? "#2a2a2a" : "#e8e2d9"} strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke={isDark ? "#525252" : "#a3a3a3"} />
                  <YAxis stroke={isDark ? "#525252" : "#a3a3a3"} />
                  <Tooltip
                    cursor={{ stroke: isDark ? "#3a3a3a" : "#d4ccc0", strokeWidth: 1 }}
                    contentStyle={{ background: "transparent", border: "none", boxShadow: "none" }}
                    labelStyle={{ color: "transparent" }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const item = payload[0]?.payload as AggregatedPoint;
                      return (
                        <div className="rounded-xl border p-3 text-xs" style={{ borderColor: v("border-secondary"), background: v("bg-secondary"), color: v("text-secondary") }}>
                          <p className="mb-2 font-medium" style={{ color: v("text-primary") }}>{label}</p>
                          <p>Доходы: {item.income.toFixed(2)}</p>
                          <p>Расходы: {item.expense.toFixed(2)}</p>
                          <p className="mt-1 font-semibold" style={{ color: v("text-primary") }}>Итог: {item.total.toFixed(2)}</p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="none"
                    fill="url(#chartGradient)"
                    fillOpacity={1}
                    isAnimationActive={true}
                    animationDuration={500}
                    animationEasing="ease-out"
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke={isDark ? "#a3a3a3" : "#5c5c5c"}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={500}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </article>

      <article className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight" style={{ color: v("text-primary") }}>Точки графика</h2>
          <button
            className={tw.buttonPrimary}
            onClick={openCreatePointModal}
          >
            Добавить точку
          </button>
        </div>
        {points.length === 0 ? (
          <div className="flex min-h-[150px] items-center justify-center rounded-xl border p-6" style={{ borderColor: v("border-primary"), background: v("bg-hover") }}>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: v("text-secondary") }}>
                У вас пока нет точек в этом графике
              </p>
              <p className="mt-1 text-xs" style={{ color: v("text-muted") }}>
                Добавьте минимум 2 точки для отображения графика
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {points.map((point) => (
              <div
                key={point.id}
                className="rounded-xl border p-3 transition overflow-hidden"
                style={{
                  borderColor: v("border-primary"),
                  background: v("bg-card"),
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = v("border-secondary");
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = v("border-primary");
                }}
              >
                <div className="min-w-0">
                  <p className="text-sm" style={{ color: v("text-secondary") }}>{new Date(point.date).toLocaleString()}</p>
                  <p className="text-xs" style={{ color: v("text-muted") }}>
                    {point.type === "income" ? "Доход" : "Расход"}: {point.amount}
                  </p>
                  {point.description && (
                    <ExpandableText text={point.description} className="mt-1" />
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="rounded-lg border px-3 py-1 text-xs transition-colors"
                    style={{ borderColor: v("border-secondary"), color: v("text-secondary") }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    onClick={() => startEdit(point)}
                  >
                    Редактировать
                  </button>
                  <button
                    className="rounded-lg border px-3 py-1 text-xs transition-colors"
                    style={buttonStyle("danger", isDark)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(220, 38, 38, 0.2)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    onClick={() =>
                      setDeleteTarget({
                        type: "point",
                        id: point.id,
                        title: `${new Date(point.date).toLocaleDateString()} ${point.amount}`,
                      })
                    }
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      <PointModal
        open={pointModalOpen}
        title={isEditingPoint ? "Редактировать точку" : "Добавить точку"}
        form={form}
        isDark={isDark}
        onFormChange={handleFormChange}
        onSave={savePoint}
        onCancel={resetForm}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Подтверждение удаления"
        description={
          deleteTarget
            ? `Вы действительно хотите удалить ${deleteTarget.type === "chart" ? "финансовый график" : "точку"} "${deleteTarget.title}"?`
            : ""
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </section>
  );
}
