import { useState, useMemo, useEffect, useRef } from "react";
import { Plus, Check, Clock, Pencil, Bell, BellOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createTaxEventApi,
  updateTaxEventApi,
  getPendingNotificationsApi,
  markNotifiedApi,
  createNotificationApi,
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

const NOTIFY_OPTIONS = [
  { value: 0, label: "Не уведомлять" },
  { value: 15, label: "За 15 минут" },
  { value: 30, label: "За 30 минут" },
  { value: 60, label: "За 1 час" },
  { value: 120, label: "За 2 часа" },
  { value: 1440, label: "За 1 день" },
  { value: 2880, label: "За 2 дня" },
  { value: 10080, label: "За неделю" },
];

type FormState = {
  title: string;
  description: string;
  event_date: string;
  event_type: string;
  amount: string;
  notify_before: number;
};

function getLocalDatetimeStr() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function isoToDatetimeLocal(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso.slice(0, 16);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function formatEventDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNotifyLabel(minutes: number | null | undefined) {
  if (!minutes || minutes === 0) return null;
  return NOTIFY_OPTIONS.find((o) => o.value === minutes)?.label ?? null;
}

const emptyForm: FormState = {
  title: "",
  description: "",
  event_date: getLocalDatetimeStr(),
  event_type: "tax",
  amount: "",
  notify_before: 0,
};

export function TaxCalendarPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();
  const { data: events = [], isLoading } = useTaxEventsQuery();
  const [openForm, setOpenForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TaxEvent | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const notifiedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const pending = await getPendingNotificationsApi();
        for (const ev of pending) {
          if (notifiedRef.current.has(ev.id)) continue;
          notifiedRef.current.add(ev.id);
          toast(`🔔 ${ev.title} — событие начинается!`, { duration: 8000 });
          markNotifiedApi(ev.id).catch(() => {});
          createNotificationApi({
            title: ev.title,
            body: `Событие "${ev.title}" на ${new Date(ev.event_date).toLocaleString("ru-RU")}`,
            source_type: ev.event_type === "tax" ? "tax_event" : "tax_calendar",
            source_id: ev.id,
          }).catch(() => {});
        }
      } catch {
        /* ignore */
      }
    }, 30_000);
    return () => clearInterval(poll);
  }, []);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => new Date(e.event_date) >= now && !e.is_completed)
      .sort((a, b) => a.event_date.localeCompare(b.event_date));
  }, [events]);

  const completedEvents = useMemo(() => {
    return events.filter((e) => e.is_completed);
  }, [events]);

  function openNewForm() {
    setEditingEvent(null);
    setForm(emptyForm);
    setOpenForm(true);
  }

  function openEditForm(event: TaxEvent) {
    setEditingEvent(event);
    setForm({
      title: event.title,
      description: event.description || "",
      event_date: isoToDatetimeLocal(event.event_date),
      event_type: event.event_type,
      amount: event.amount ? String(event.amount) : "",
      notify_before: event.notify_before ?? 0,
    });
    setOpenForm(true);
  }

  async function submit() {
    if (!form.title.trim() || !form.event_date) return;
    const eventDate = new Date(form.event_date);
    if (isNaN(eventDate.getTime())) {
      toast.error("Некорректная дата");
      return;
    }
    try {
      if (editingEvent) {
        await updateTaxEventApi(editingEvent.id, {
          title: form.title,
          description: form.description || undefined,
          event_date: eventDate.toISOString(),
          event_type: form.event_type,
          amount: form.amount ? parseInt(form.amount) : undefined,
          notify_before: form.notify_before || null,
        });
        toast.success("Событие обновлено");
      } else {
        await createTaxEventApi({
          title: form.title,
          description: form.description || undefined,
          event_date: eventDate.toISOString(),
          event_type: form.event_type,
          amount: form.amount ? parseInt(form.amount) : undefined,
          notify_before: form.notify_before || null,
        });
        toast.success("Событие создано");
      }
      setOpenForm(false);
      setEditingEvent(null);
      setForm(emptyForm);
      await queryClient.invalidateQueries({ queryKey: queryKeys.taxEvents });
    } catch {
      toast.error(editingEvent ? "Ошибка при обновлении" : "Ошибка при создании");
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

  function getTypeLabel(type: string) {
    return EVENT_TYPES.find((t) => t.value === type)?.label || type;
  }

  function getTypeColor(type: string) {
    switch (type) {
      case "tax":
        return "#ef4444";
      case "insurance":
        return "#f59e0b";
      case "report":
        return "#3b82f6";
      case "payment":
        return "#10b981";
      default:
        return v("text-secondary");
    }
  }

  function renderEventCard(event: TaxEvent, isCompleted: boolean) {
    return (
      <div
        key={event.id}
        className={`flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 hover:-translate-y-0.5 ${isCompleted ? "opacity-50" : ""}`}
        style={{
          ...cardStyle("business", isDark),
          borderColor: isCompleted ? v("border-secondary") : v("border-primary"),
        }}
      >
        <button
          type="button"
          onClick={() => toggleComplete(event)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-200 hover:scale-110 hover:shadow-md"
          style={{
            borderColor: isCompleted ? "#10b981" : v("border-primary"),
            background: isCompleted ? "#10b981" : "transparent",
          }}
        >
          {isCompleted ? <Check size={14} color="#fff" /> : <Clock size={14} style={{ color: v("text-tertiary") }} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium truncate" style={{ color: v("text-primary") }}>
              {event.title}
            </p>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ background: getTypeColor(event.event_type), color: "#fff" }}
            >
              {getTypeLabel(event.event_type)}
            </span>
            {event.notify_before ? (
              <span title={`Уведомление: ${getNotifyLabel(event.notify_before)}`}>
                {isCompleted ? (
                  <BellOff size={14} style={{ color: v("text-tertiary") }} />
                ) : (
                  <Bell size={14} style={{ color: v("text-secondary") }} />
                )}
              </span>
            ) : null}
          </div>
          <p className="text-sm truncate" style={{ color: v("text-tertiary") }}>
            {formatEventDate(event.event_date)}
            {event.amount ? ` — ${event.amount.toLocaleString("ru-RU")} руб.` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEditForm(event)}
          className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
          style={{ color: v("text-secondary") }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = v("text-primary");
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = v("text-secondary");
          }}
        >
          <Pencil size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className={tw.pageContainer}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold" style={{ color: v("text-primary") }}>
          Налоговый календарь
        </h1>
        <button
          type="button"
          onClick={openNewForm}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105"
          style={buttonStyle("primary", isDark)}
        >
          <Plus size={16} />
          Добавить событие
        </button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-card h-16 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && events.length === 0 && (
        <div className="flex items-center justify-center min-h-[200px] animate-fade-in">
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: v("text-primary") }}>
              Нет событий
            </p>
            <p className="mt-1 text-xs" style={{ color: v("text-muted") }}>
              Добавьте первое событие
            </p>
          </div>
        </div>
      )}

      {upcomingEvents.length > 0 && (
        <div className="animate-fade-in">
          <h2 className="mb-3 text-lg font-semibold flex items-center gap-2" style={{ color: v("text-primary") }}>
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Предстоящие
          </h2>
          <div className="space-y-2">
            {upcomingEvents.map((event, i) => (
              <div key={event.id} className={`animate-fade-in stagger-${(i % 6) + 1}`}>
                {renderEventCard(event, false)}
              </div>
            ))}
          </div>
        </div>
      )}

      {completedEvents.length > 0 && (
        <div className="animate-fade-in">
          <h2 className="mb-3 text-lg font-semibold flex items-center gap-2" style={{ color: v("text-secondary") }}>
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-400" />
            Выполненные
          </h2>
          <div className="space-y-2">
            {completedEvents.map((event, i) => (
              <div key={event.id} className={`animate-fade-in stagger-${(i % 6) + 1}`}>
                {renderEventCard(event, true)}
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
              {editingEvent ? "Редактировать событие" : "Новое событие"}
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
              {!form.title.trim() && form.title !== "" && (
                <p className="text-xs" style={{ color: "#ef4444" }}>
                  Название обязательно
                </p>
              )}
              <input
                type="datetime-local"
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
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
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
              <select
                value={form.notify_before}
                onChange={(e) => setForm({ ...form, notify_before: parseInt(e.target.value) })}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={inputStyle(isDark)}
              >
                {NOTIFY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
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
                onClick={() => {
                  setOpenForm(false);
                  setEditingEvent(null);
                }}
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
                {editingEvent ? "Сохранить" : "Создать"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
