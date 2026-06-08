import { useState, useMemo } from "react";
import { Plus, Trash2, Check, Clock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createTaxEventApi,
  updateTaxEventApi,
  deleteTaxEventApi,
  type TaxEvent,
} from "../api";
import { cardStyle, inputStyle, buttonStyle, tw, v } from "../shared/theme";
import { useTheme } from "../features/theme/ThemeContext";
import { useTaxEventsQuery } from "../hooks/useCachedData";
import { queryKeys } from "../lib/queryClient";

const EVENT_TYPES = [
  { value: "tax", label: "Налог" },
  { value: "insurance", label: "Страховые взносы" },
  { value: "report", label: "Отчётность" },
  { value: "payment", label: "Платёж" },
  { value: "other", label: "Другое" },
];

type FormState = {
  title: string;
  description: string;
  event_date: string;
  event_type: string;
  amount: string;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  event_date: new Date().toISOString().split("T")[0],
  event_type: "tax",
  amount: "",
};

export function TaxCalendarPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();
  const { data: events = [], isLoading } = useTaxEventsQuery();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return events
      .filter((e) => e.event_date >= today && !e.is_completed)
      .sort((a, b) => a.event_date.localeCompare(b.event_date));
  }, [events]);

  const completedEvents = useMemo(() => {
    return events.filter((e) => e.is_completed);
  }, [events]);

  async function submit() {
    if (!form.title.trim() || !form.event_date) return;
    try {
      await createTaxEventApi({
        title: form.title,
        description: form.description || undefined,
        event_date: form.event_date,
        event_type: form.event_type,
        amount: form.amount ? parseInt(form.amount) : undefined,
      });
      toast.success("Событие создано");
      setOpenForm(false);
      setForm(emptyForm);
      await queryClient.invalidateQueries({ queryKey: queryKeys.taxEvents });
    } catch {
      toast.error("Ошибка при создании события");
    }
  }

  async function toggleComplete(event: TaxEvent) {
    try {
      await updateTaxEventApi(event.id, { is_completed: !event.is_completed });
      await queryClient.invalidateQueries({ queryKey: queryKeys.taxEvents });
    } catch {
      toast.error("Ошибка при обновлении");
    }
  }

  async function remove(id: number) {
    try {
      await deleteTaxEventApi(id);
      toast.success("Событие удалено");
      await queryClient.invalidateQueries({ queryKey: queryKeys.taxEvents });
    } catch {
      toast.error("Ошибка при удалении");
    }
  }

  function getTypeLabel(type: string) {
    return EVENT_TYPES.find((t) => t.value === type)?.label || type;
  }

  function getTypeColor(type: string) {
    switch (type) {
      case "tax": return "#ef4444";
      case "insurance": return "#f59e0b";
      case "report": return "#3b82f6";
      case "payment": return "#10b981";
      default: return v("text-secondary");
    }
  }

  return (
    <div className={tw.pageContainer}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold" style={{ color: v("text-primary") }}>
          Налоговый календарь
        </h1>
        <button
          type="button"
          onClick={() => setOpenForm(true)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          style={buttonStyle("primary", isDark)}
        >
          <Plus size={16} />
          Добавить событие
        </button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl" style={{ background: v("bg-hover") }} />
          ))}
        </div>
      )}

      {!isLoading && upcomingEvents.length === 0 && completedEvents.length === 0 && (
        <p className="text-sm" style={{ color: v("text-tertiary") }}>
          Нет событий. Добавьте первое событие.
        </p>
      )}

      {upcomingEvents.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold" style={{ color: v("text-primary") }}>
            Предстоящие
          </h2>
          <div className="space-y-2">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 rounded-xl border p-3 transition hover:-translate-y-0.5"
                style={cardStyle("business", isDark)}
              >
                <button
                  type="button"
                  onClick={() => toggleComplete(event)}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border"
                  style={{ borderColor: v("border-primary") }}
                >
                  <Clock size={14} style={{ color: v("text-tertiary") }} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate" style={{ color: v("text-primary") }}>
                      {event.title}
                    </p>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs"
                      style={{ background: getTypeColor(event.event_type), color: "#fff" }}
                    >
                      {getTypeLabel(event.event_type)}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: v("text-tertiary") }}>
                    {event.event_date}
                    {event.amount ? ` — ${event.amount.toLocaleString("ru-RU")} руб.` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(event.id)}
                  className="p-1 transition-colors"
                  style={{ color: v("text-muted") }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = v("text-muted"); }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedEvents.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold" style={{ color: v("text-secondary") }}>
            Выполненные
          </h2>
          <div className="space-y-2">
            {completedEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 rounded-xl border p-3 opacity-60"
                style={cardStyle("business", isDark)}
              >
                <button
                  type="button"
                  onClick={() => toggleComplete(event)}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "#10b981" }}
                >
                  <Check size={14} color="#fff" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: v("text-primary") }}>
                    {event.title}
                  </p>
                  <p className="text-sm" style={{ color: v("text-tertiary") }}>
                    {event.event_date}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(event.id)}
                  className="p-1 transition-colors"
                  style={{ color: v("text-muted") }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {openForm && (
        <div className="fixed inset-0 z-[90] grid place-items-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="w-full max-w-lg rounded-2xl border p-4"
            style={{ background: v("bg-secondary"), borderColor: v("border-primary") }}
          >
            <h2 className="mb-4 text-lg font-semibold" style={{ color: v("text-primary") }}>
              Новое событие
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Название"
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={inputStyle(isDark)}
              />
              <input
                type="date"
                value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={inputStyle(isDark)}
              />
              <select
                value={form.event_type}
                onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={inputStyle(isDark)}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="Сумма (руб.)"
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={inputStyle(isDark)}
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Описание"
                rows={2}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={inputStyle(isDark)}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpenForm(false)}
                className="rounded-lg px-4 py-2 text-sm transition-colors"
                style={buttonStyle("secondary", isDark)}
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!form.title.trim()}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={buttonStyle("primary", isDark)}
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
