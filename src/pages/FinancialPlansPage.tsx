import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  createFinancialPlanApi,
  getCurrenciesApi,
  getFinancialPlansApi,
  type Currency,
  type FinancialPlan,
} from "../api";
import { cardStyle, cardHoverStyle, inputStyle, buttonStyle, tw, v } from "../shared/theme";
import { ExpandableText } from "../components/ExpandableText";
import { useTheme } from "../features/theme/ThemeContext";

type FormState = {
  title: string;
  description: string;
  currency_id: number;
  is_active: boolean;
};

const emptyForm: FormState = { title: "", description: "", currency_id: 0, is_active: true };

export function FinancialPlansPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [plans, setPlans] = useState<FinancialPlan[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  async function fetchData() {
    try {
      setLoading(true);
      const [charts, currencyList] = await Promise.all([getFinancialPlansApi(), getCurrenciesApi()]);
      setPlans(charts);
      setCurrencies(currencyList);
    } catch {
      toast.error("Ошибка загрузки финансовых планов");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchData();
  }, []);

  const valid = useMemo(() => form.title.trim().length > 0 && form.currency_id > 0, [form]);

  async function submit() {
    if (!valid) return;
    try {
      await createFinancialPlanApi(form);
      toast.success("План создан");
      setOpenForm(false);
      await fetchData();
    } catch {
      toast.error("Ошибка сохранения финансового плана");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold" style={{ color: v("text-primary") }}>Финансовые планы</h1>
        <button
          className={`${tw.buttonPrimary} flex items-center gap-1.5`}
          style={buttonStyle("primary", isDark)}
          onClick={() => setOpenForm(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          <Plus size={16} />
          <span className="hidden sm:inline whitespace-nowrap">Создать</span>
        </button>
      </div>

      {loading ? (
        <div className={tw.grid}>
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="h-44 animate-pulse rounded-2xl"
              style={{ background: v("bg-hover") }}
            />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium" style={{ color: v("text-primary") }}>
              У вас пока нет финансовых графиков
            </p>
            <p className="mt-2 text-sm" style={{ color: v("text-muted") }}>
              Создайте первый график для отслеживания доходов и расходов
            </p>
            <button
              className="mt-4 rounded-lg border px-4 py-2 text-sm transition-colors"
              style={buttonStyle("primary", isDark)}
              onClick={() => setOpenForm(true)}
            >
              Создать график
            </button>
          </div>
        </div>
      ) : (
        <div className={tw.grid}>
          {plans.map((plan) => (
            <Link
              key={plan.id}
              to={`/financial-plans/${plan.id}`}
              className={`${tw.cardBase} overflow-hidden`}
              style={cardStyle("financial", isDark)}
              onMouseEnter={(e) => {
                const hover = cardHoverStyle("financial", isDark);
                e.currentTarget.style.border = hover.border;
                e.currentTarget.style.background = hover.background;
              }}
              onMouseLeave={(e) => {
                const base = cardStyle("financial", isDark);
                e.currentTarget.style.border = base.border;
                e.currentTarget.style.background = base.background;
              }}
            >
              <div className="mb-3 flex items-center justify-between gap-2 min-w-0">
                <h2
                  className="line-clamp-2 text-lg font-semibold"
                  style={{ color: v("text-primary") }}
                >{plan.title}</h2>
                <span
                  className="rounded-lg px-2 py-1 text-[10px] font-medium"
                  style={plan.is_active
                    ? { background: "rgba(34, 197, 94, 0.15)", color: "#16a34a" }
                    : { background: v("bg-active"), color: v("text-muted") }
                  }
                >
                  {plan.is_active ? "Активен" : "Неактивен"}
                </span>
              </div>
              <ExpandableText text={plan.description || "Без описания"} expandable={false} />
              <p className="mt-3 text-sm" style={{ color: v("text-secondary") }}>
                Валюта: {currencies.find((c) => c.id === plan.currency_id)?.code ?? `ID ${plan.currency_id}`}
              </p>
            </Link>
          ))}
        </div>
      )}

      {openForm && (
        <div
          className={tw.modalOverlay}
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div
            className={tw.modalContent}
            style={{
              background: v("bg-sidebar"),
              borderColor: v("border-primary"),
            }}
          >
            <h3 className="mb-3 text-lg font-semibold" style={{ color: v("text-primary") }}>
              Создать финансовый план
            </h3>
            <div className="space-y-3">
              <input
                className={tw.inputBase}
                style={inputStyle(isDark)}
                placeholder="Название"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              />
              <input
                className={tw.inputBase}
                style={inputStyle(isDark)}
                placeholder="Описание"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
              <select
                className={tw.inputBase}
                style={inputStyle(isDark)}
                value={form.currency_id}
                onChange={(e) => setForm((p) => ({ ...p, currency_id: Number(e.target.value) }))}
              >
                <option value={0}>Выберите валюту</option>
                {currencies.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm" style={{ color: v("text-secondary") }}>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                />
                Активный график
              </label>
              <div className="flex justify-end gap-2">
                <button
                  className={tw.buttonSecondary}
                  style={buttonStyle("secondary", isDark)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = v("bg-hover");
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                  onClick={() => setOpenForm(false)}
                >
                  Отмена
                </button>
                <button
                  className={tw.buttonPrimary}
                  disabled={!valid}
                  onClick={() => void submit()}
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
