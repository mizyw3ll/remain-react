import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Download, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  getCalendarEventsApi,
  createCalendarEventApi,
  deleteCalendarEventApi,
  getCalendarExportUrl,
  type CalendarEvent,
} from "../api";
import { buttonStyle, inputStyle, tw, v } from "../shared/theme";
import { useTheme } from "../features/theme/ThemeContext";

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Окторябрь", "Ноябрь", "Декабрь",
];

const DAYS_OF_WEEK = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  const startPad = (firstDay.getDay() + 6) % 7;

  for (let i = 0; i < startPad; i++) {
    days.push(null);
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

export function CalendarPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState(formatDate(today));
  const [newDesc, setNewDesc] = useState("");

  async function fetchEvents() {
    try {
      const firstDay = formatDate(new Date(year, month, 1));
      const lastDay = formatDate(new Date(year, month + 1, 0));
      const data = await getCalendarEventsApi(firstDay, lastDay);
      setEvents(data);
    } catch {
      toast.error("Ошибка загрузки событий");
    }
  }

  useEffect(() => {
    void fetchEvents();
  }, [year, month]);

  const days = getMonthDays(year, month);

  function prevMonth() {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  }

  function getEventsForDate(d: Date | null) {
    if (!d) return [];
    const ds = formatDate(d);
    return events.filter((e) => e.event_date === ds);
  }

  async function handleCreate() {
    if (!newTitle.trim()) return;
    try {
      await createCalendarEventApi({
        title: newTitle.trim(),
        description: newDesc || undefined,
        event_date: newDate,
      });
      toast.success("Событие создано");
      setShowCreate(false);
      setNewTitle("");
      setNewDesc("");
      setNewDate(formatDate(today));
      await fetchEvents();
    } catch {
      toast.error("Ошибка создания события");
    }
  }

  async function handleDelete(eventId: number) {
    try {
      await deleteCalendarEventApi(eventId);
      toast.success("Событие удалено");
      await fetchEvents();
    } catch {
      toast.error("Ошибка удаления события");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold" style={{ color: v("text-primary") }}>Календарь</h1>
        <div className="flex items-center gap-2">
          <a
            href={getCalendarExportUrl()}
            download
            className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: v("border-secondary"), color: v("text-secondary") }}
          >
            <Download size={16} />
            .ics
          </a>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm"
            style={buttonStyle("primary", isDark)}
          >
            <Plus size={16} />
            Событие
          </button>
        </div>
      </div>

      <div className="rounded-2xl border p-4" style={{ borderColor: v("border-primary"), background: v("bg-secondary") }}>
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold" style={{ color: v("text-primary") }}>
            {MONTHS[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS_OF_WEEK.map((d) => (
            <div key={d} className="text-center text-xs font-medium py-1" style={{ color: v("text-muted") }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            const dayEvents = getEventsForDate(d);
            const isToday = d && formatDate(d) === formatDate(today);
            const isOtherMonth = d && d.getMonth() !== month;

            return (
              <div
                key={i}
                className={`min-h-[80px] rounded-lg border p-1 ${
                  isToday ? "border-blue-500 dark:border-blue-400" : "border-transparent"
                }`}
                style={{
                  background: d ? (isToday ? "rgba(59,130,246,0.1)" : v("bg-card")) : "transparent",
                }}
              >
                {d && (
                  <>
                    <p
                      className={`text-xs font-medium mb-1 ${
                        isOtherMonth ? "opacity-40" : ""
                      }`}
                      style={{ color: v("text-secondary") }}
                    >
                      {d.getDate()}
                    </p>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <div
                          key={ev.id}
                          className="group flex items-center gap-0.5"
                        >
                          <div
                            className="flex-1 truncate rounded px-1 py-0.5 text-[10px] leading-tight cursor-pointer"
                            style={{
                              background: "rgba(59,130,246,0.15)",
                              color: v("text-primary"),
                            }}
                            title={ev.title}
                          >
                            {ev.title}
                          </div>
                          <button
                            onClick={() => void handleDelete(ev.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 shrink-0"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <p className="text-[10px]" style={{ color: v("text-muted") }}>
                          +{dayEvents.length - 3}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event list for selected date */}
      <div className="rounded-2xl border p-4" style={{ borderColor: v("border-primary") }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: v("text-primary") }}>
          Все события месяца
        </h3>
        {events.length === 0 ? (
          <p className="text-sm" style={{ color: v("text-muted") }}>Нет событий</p>
        ) : (
          <div className="space-y-2">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between rounded-lg border p-3"
                style={{ borderColor: v("border-secondary"), background: v("bg-card") }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium" style={{ color: v("text-primary") }}>{ev.title}</p>
                  <p className="text-xs" style={{ color: v("text-muted") }}>
                    {new Date(ev.event_date).toLocaleDateString()}
                    {ev.description ? ` — ${ev.description}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => void handleDelete(ev.id)}
                  className="p-1 text-gray-400 hover:text-red-500 shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[120] grid place-items-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-w-md rounded-2xl border p-4 sm:p-5" style={{ background: v("bg-sidebar"), borderColor: v("border-primary") }}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: v("text-primary") }}>Новое событие</h3>
            <div className="space-y-3">
              <input
                className={tw.inputBase}
                style={inputStyle(isDark)}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Название"
              />
              <input
                type="date"
                className={tw.inputBase}
                style={inputStyle(isDark)}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
              <textarea
                className={tw.inputBase}
                style={inputStyle(isDark)}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Описание (необязательно)"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-xl border px-4 py-2 text-sm"
                style={{ borderColor: v("border-secondary"), color: v("text-secondary") }}
                onClick={() => setShowCreate(false)}
              >
                Отмена
              </button>
              <button
                className="rounded-xl border px-4 py-2 text-sm"
                style={buttonStyle("primary", isDark)}
                disabled={!newTitle.trim()}
                onClick={() => void handleCreate()}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}