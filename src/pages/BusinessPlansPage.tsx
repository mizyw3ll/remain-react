import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  createBusinessPlanApi,
  getBusinessPlansApi,
  type BusinessPlan,
} from "../api";
import { cardStyle, cardHoverStyle, inputStyle, buttonStyle, tw, v } from "../shared/theme";
import { ExpandableText } from "../components/ExpandableText";
import { useTheme } from "../features/theme/ThemeContext";

type FormState = {
  title: string;
  description: string;
};

const emptyForm: FormState = { title: "", description: "" };

export function BusinessPlansPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  async function fetchData() {
    try {
      setLoading(true);
      setPlans(await getBusinessPlansApi());
    } catch {
      toast.error("Ошибка загрузки бизнес-планов");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchData();
  }, []);

  const valid = useMemo(() => form.title.trim().length > 0, [form.title]);

  function startCreate() {
    setForm(emptyForm);
    setOpenForm(true);
  }

  async function submit() {
    if (!valid) return;
    try {
      await createBusinessPlanApi(form);
      toast.success("План создан");
      setOpenForm(false);
      await fetchData();
    } catch {
      toast.error("Ошибка сохранения плана");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold" style={{ color: v("text-primary") }}>Бизнес-планы</h1>
        <button
          onClick={startCreate}
          className={`${tw.buttonPrimary} flex items-center gap-1.5`}
          style={{
            background: v("text-primary"),
            color: v("bg-body"),
          }}
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
              У вас пока нет бизнес-планов
            </p>
            <p className="mt-2 text-sm" style={{ color: v("text-muted") }}>
              Создайте первый план, чтобы начать работу
            </p>
            <button
              className="mt-4 rounded-lg border px-4 py-2 text-sm transition-colors"
              style={buttonStyle("primary", isDark)}
              onClick={() => setOpenForm(true)}
            >
              Создать план
            </button>
          </div>
        </div>
      ) : (
        <div className={tw.grid}>
          {plans.map((plan) => (
            <Link
              key={plan.id}
              to={`/business-plans/${plan.id}`}
              className={`${tw.cardBase} overflow-hidden`}
              style={cardStyle("business", isDark)}
              onMouseEnter={(e) => {
                const hover = cardHoverStyle("business", isDark);
                e.currentTarget.style.border = hover.border;
                e.currentTarget.style.background = hover.background;
              }}
              onMouseLeave={(e) => {
                const base = cardStyle("business", isDark);
                e.currentTarget.style.border = base.border;
                e.currentTarget.style.background = base.background;
              }}
            >
              <div className="mb-2 min-w-0">
                <h2
                  className="line-clamp-2 text-lg font-semibold"
                  style={{ color: v("text-primary") }}
                >{plan.title}</h2>
              </div>
              <ExpandableText text={plan.description || "Без описания"} expandable={false} />
              <p className="mt-3 text-xs" style={{ color: v("text-muted") }}>
                Создан: {new Date(plan.created_at).toLocaleDateString()}
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
            <h3 className="mb-3 text-lg font-semibold" style={{ color: v("text-primary") }}>Создать план</h3>
            <div className="space-y-3">
              <input
                className={tw.inputBase}
                style={inputStyle(isDark)}
                placeholder="Название"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              />
              <textarea
                className={tw.inputBase}
                style={inputStyle(isDark)}
                placeholder="Описание"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
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
