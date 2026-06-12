import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  createFinancialPlanApi,
} from "../api";
import { useCurrenciesQuery, useFinancialPlansQuery } from "../hooks/useCachedData";
import { queryKeys } from "../lib/queryClient";
import { cardStyle, cardHoverStyle, inputStyle, buttonStyle, tw, v } from "../shared/theme";
import { ExpandableText } from "../components/ExpandableText";
import { GlassCard } from "../shared/components/GlassCard";
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
  const queryClient = useQueryClient();
  const { data: plans = [], isLoading: plansLoading, isError: plansError } = useFinancialPlansQuery();
  const { data: currencies = [], isLoading: currenciesLoading } = useCurrenciesQuery();
  const loading = plansLoading || currenciesLoading;
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (plansError) toast.error("Ошибка загрузки финансовых планов");
  }, [plansError]);

  const valid = useMemo(() => form.title.trim().length > 0 && form.currency_id > 0, [form]);

  async function submit() {
    if (!valid) return;
    try {
      await createFinancialPlanApi(form);
      toast.success("План создан");
      setOpenForm(false);
      await queryClient.invalidateQueries({ queryKey: queryKeys.financialPlans });
    } catch {
      toast.error("Ошибка сохранения финансового плана");
    }
  }

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold" style={{ color: v("text-primary") }}>Финансовые планы</h1>
        <div className="flex items-center gap-2">
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
      </div>

      {loading ? (
        <div className={tw.grid}>
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="skeleton-card h-44" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center animate-fade-in">
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
          {plans.map((plan, i) => (
            <Link
              key={plan.id}
              to={`/financial-plans/${plan.id}`}
              className={`animate-fade-in stagger-${(i % 6) + 1} block min-w-0`}
            >
              <GlassCard accent="emerald">
                <div className="mb-4 flex items-start gap-4">
                  <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(16,185,129,0.12)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 min-w-0">
                        <h2 className="text-lg font-semibold leading-tight truncate" style={{ color: v("text-primary") }}>
                          {plan.title}
                        </h2>
                        <span
                          className="shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-medium whitespace-nowrap"
                        style={plan.is_active
                          ? { background: "rgba(34, 197, 94, 0.15)", color: "#16a34a" }
                          : { background: v("bg-active"), color: v("text-muted") }
                        }
                      >
                        {plan.is_active ? "Активен" : "Неактивен"}
                      </span>
                    </div>
                    <ExpandableText text={plan.description || "Без описания"} expandable={false} className="mt-1.5" />
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-3 border-t" style={{ borderColor: "var(--border-muted)" }}>
                  <span className="text-xs" style={{ color: v("text-muted") }}>
                    {currencies.find((c) => c.id === plan.currency_id)?.code ?? `ID ${plan.currency_id}`}
                  </span>
                </div>
              </GlassCard>
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
              {!form.title.trim() && form.title !== "" && (
                <p className="text-xs" style={{ color: "#ef4444" }}>Название обязательно</p>
              )}
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
              {form.currency_id === 0 && (
                <p className="text-xs" style={{ color: "#ef4444" }}>Выберите валюту</p>
              )}
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
