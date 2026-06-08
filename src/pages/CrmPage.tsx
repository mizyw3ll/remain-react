import { useState } from "react";
import { Plus, Trash2, Phone, Mail, Building2, User, DollarSign, Calendar, Target, TrendingUp, Users, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createContactApi,
  updateContactApi,
  deleteContactApi,
  createDealApi,
  updateDealApi,
  deleteDealApi,
  type Contact,
  type Deal,
} from "../api";
import { cardStyle, inputStyle, buttonStyle, tw, v } from "../shared/theme";
import { useTheme } from "../features/theme/ThemeContext";
import { useContactsQuery, useDealsQuery, usePipelineStatsQuery } from "../hooks/useCachedData";
import { queryKeys } from "../lib/queryClient";

const DEAL_STATUSES = [
  { value: "new", label: "Новая", color: "#3b82f6" },
  { value: "qualified", label: "Квалификация", color: "#eab308" },
  { value: "proposal", label: "Предложение", color: "#f97316" },
  { value: "negotiation", label: "Переговоры", color: "#a855f7" },
  { value: "won", label: "Выиграна", color: "#22c55e" },
  { value: "lost", label: "Проиграна", color: "#ef4444" },
];

const PRIORITIES = [
  { value: "low", label: "Низкий", color: "#9ca3af" },
  { value: "medium", label: "Средний", color: "#eab308" },
  { value: "high", label: "Высокий", color: "#ef4444" },
];

type Tab = "contacts" | "deals" | "pipeline";

export function CrmPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const qc = useQueryClient();
  const { data: contacts = [] } = useContactsQuery();
  const { data: deals = [] } = useDealsQuery();
  const { data: stats } = usePipelineStatsQuery();

  const [tab, setTab] = useState<Tab>("contacts");
  const [showContactForm, setShowContactForm] = useState(false);
  const [showDealForm, setShowDealForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const [cName, setCName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cCompany, setCCompany] = useState("");
  const [cPosition, setCPosition] = useState("");
  const [cNotes, setCNotes] = useState("");
  const [cIsLead, setCIsLead] = useState(false);

  const [dTitle, setDTitle] = useState("");
  const [dDescription, setDDescription] = useState("");
  const [dContactId, setDContactId] = useState("");
  const [dStatus, setDStatus] = useState("new");
  const [dValue, setDValue] = useState("");
  const [dCurrency, setDCurrency] = useState("RUB");
  const [dPriority, setDPriority] = useState("medium");
  const [dDueDate, setDDueDate] = useState("");

  const createContactMut = useMutation({
    mutationFn: () =>
      createContactApi({
        name: cName,
        email: cEmail || undefined,
        phone: cPhone || undefined,
        company: cCompany || undefined,
        position: cPosition || undefined,
        notes: cNotes || undefined,
        is_lead: cIsLead,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.contacts() });
      resetContactForm();
      setShowContactForm(false);
      toast.success("Контакт создан");
    },
    onError: () => toast.error("Ошибка при создании контакта"),
  });

  const updateContactMut = useMutation({
    mutationFn: () =>
      updateContactApi(editingContact!.id, {
        name: cName,
        email: cEmail || undefined,
        phone: cPhone || undefined,
        company: cCompany || undefined,
        position: cPosition || undefined,
        notes: cNotes || undefined,
        is_lead: cIsLead,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.contacts() });
      resetContactForm();
      setShowContactForm(false);
      setEditingContact(null);
      toast.success("Контакт обновлён");
    },
    onError: () => toast.error("Ошибка при обновлении"),
  });

  const deleteContactMut = useMutation({
    mutationFn: deleteContactApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.contacts() });
      toast.success("Контакт удалён");
    },
    onError: () => toast.error("Ошибка при удалении"),
  });

  const createDealMut = useMutation({
    mutationFn: () =>
      createDealApi({
        title: dTitle,
        description: dDescription || undefined,
        contact_id: dContactId ? Number(dContactId) : undefined,
        status: dStatus,
        value: dValue ? Number(dValue) : undefined,
        currency: dCurrency,
        priority: dPriority,
        due_date: dDueDate || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.deals() });
      qc.invalidateQueries({ queryKey: queryKeys.pipelineStats });
      resetDealForm();
      setShowDealForm(false);
      toast.success("Сделка создана");
    },
    onError: () => toast.error("Ошибка при создании сделки"),
  });

  const updateDealMut = useMutation({
    mutationFn: () =>
      updateDealApi(editingDeal!.id, {
        title: dTitle,
        description: dDescription || undefined,
        contact_id: dContactId ? Number(dContactId) : undefined,
        status: dStatus,
        value: dValue ? Number(dValue) : undefined,
        currency: dCurrency,
        priority: dPriority,
        due_date: dDueDate || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.deals() });
      qc.invalidateQueries({ queryKey: queryKeys.pipelineStats });
      resetDealForm();
      setShowDealForm(false);
      setEditingDeal(null);
      toast.success("Сделка обновлена");
    },
    onError: () => toast.error("Ошибка при обновлении"),
  });

  const deleteDealMut = useMutation({
    mutationFn: deleteDealApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.deals() });
      qc.invalidateQueries({ queryKey: queryKeys.pipelineStats });
      toast.success("Сделка удалена");
    },
    onError: () => toast.error("Ошибка при удалении"),
  });

  function resetContactForm() {
    setCName("");
    setCEmail("");
    setCPhone("");
    setCCompany("");
    setCPosition("");
    setCNotes("");
    setCIsLead(false);
  }

  function resetDealForm() {
    setDTitle("");
    setDDescription("");
    setDContactId("");
    setDStatus("new");
    setDValue("");
    setDCurrency("RUB");
    setDPriority("medium");
    setDDueDate("");
  }

  function openEditContact(c: Contact) {
    setEditingContact(c);
    setCName(c.name);
    setCEmail(c.email || "");
    setCPhone(c.phone || "");
    setCCompany(c.company || "");
    setCPosition(c.position || "");
    setCNotes(c.notes || "");
    setCIsLead(c.is_lead);
    setShowContactForm(true);
  }

  function openEditDeal(d: Deal) {
    setEditingDeal(d);
    setDTitle(d.title);
    setDDescription(d.description || "");
    setDContactId(d.contact_id?.toString() || "");
    setDStatus(d.status);
    setDValue(d.value?.toString() || "");
    setDCurrency(d.currency);
    setDPriority(d.priority);
    setDDueDate(d.due_date || "");
    setShowDealForm(true);
  }

  function getStatusColor(status: string) {
    return DEAL_STATUSES.find((s) => s.value === status)?.color || "#9ca3af";
  }

  function getPriorityColor(priority: string) {
    return PRIORITIES.find((p) => p.value === priority)?.color || "#9ca3af";
  }

  function getStatusLabel(status: string) {
    return DEAL_STATUSES.find((s) => s.value === status)?.label || status;
  }

  function getPriorityLabel(priority: string) {
    return PRIORITIES.find((p) => p.value === priority)?.label || priority;
  }

  return (
    <div className={tw.pageContainer}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: v("text-primary") }}>
          CRM
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { resetContactForm(); setEditingContact(null); setShowContactForm(true); }}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={buttonStyle("primary", isDark)}
          >
            <Plus size={16} />
            Контакт
          </button>
          <button
            type="button"
            onClick={() => { resetDealForm(); setEditingDeal(null); setShowDealForm(true); }}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={buttonStyle("primary", isDark)}
          >
            <Plus size={16} />
            Сделка
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(["contacts", "deals", "pipeline"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              ...(tab === t ? buttonStyle("primary", isDark) : buttonStyle("secondary", isDark)),
              ...(tab === t ? { background: v("bg-active") } : {}),
            }}
          >
            {t === "contacts" && <><Users size={16} /> Контакты ({contacts.length})</>}
            {t === "deals" && <><Target size={16} /> Сделки ({deals.length})</>}
            {t === "pipeline" && <><TrendingUp size={16} /> Воронка</>}
          </button>
        ))}
      </div>

      {tab === "contacts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact: Contact) => (
            <div
              key={contact.id}
              className="rounded-xl border p-4 transition hover:-translate-y-0.5"
              style={cardStyle("note", isDark)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: v("bg-tertiary") }}
                  >
                    <User size={18} style={{ color: v("text-muted") }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: v("text-primary") }}>{contact.name}</p>
                    {contact.company && (
                      <p className="text-sm flex items-center gap-1" style={{ color: v("text-muted") }}>
                        <Building2 size={12} /> {contact.company}
                      </p>
                    )}
                  </div>
                </div>
                {contact.is_lead && (
                  <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: "#3b82f6", color: "#fff" }}>
                    Лид
                  </span>
                )}
              </div>
              <div className="mt-3 space-y-1">
                {contact.email && (
                  <p className="text-sm flex items-center gap-1" style={{ color: v("text-muted") }}>
                    <Mail size={12} /> {contact.email}
                  </p>
                )}
                {contact.phone && (
                  <p className="text-sm flex items-center gap-1" style={{ color: v("text-muted") }}>
                    <Phone size={12} /> {contact.phone}
                  </p>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => openEditContact(contact)}
                  className="rounded-lg px-3 py-1 text-xs font-medium transition-colors"
                  style={buttonStyle("secondary", isDark)}
                >
                  Изменить
                </button>
                <button
                  type="button"
                  onClick={() => deleteContactMut.mutate(contact.id)}
                  className="rounded-lg px-3 py-1 text-xs font-medium transition-colors"
                  style={buttonStyle("danger", isDark)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "deals" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deals.map((deal: Deal) => (
            <div
              key={deal.id}
              className="rounded-xl border p-4 transition hover:-translate-y-0.5"
              style={cardStyle("note", isDark)}
            >
              <div>
                <p className="font-semibold" style={{ color: v("text-primary") }}>{deal.title}</p>
                <div className="flex gap-2 mt-1">
                  <span className="rounded-full px-2 py-0.5 text-xs text-white" style={{ background: getStatusColor(deal.status) }}>
                    {getStatusLabel(deal.status)}
                  </span>
                  <span className="rounded-full px-2 py-0.5 text-xs text-white" style={{ background: getPriorityColor(deal.priority) }}>
                    {getPriorityLabel(deal.priority)}
                  </span>
                </div>
              </div>
              {deal.value != null && (
                <p className="mt-2 text-sm font-medium flex items-center gap-1" style={{ color: v("text-primary") }}>
                  <DollarSign size={14} /> {deal.value.toLocaleString()} {deal.currency}
                </p>
              )}
              {deal.contact && (
                <p className="text-sm mt-1 flex items-center gap-1" style={{ color: v("text-muted") }}>
                  <User size={12} /> {deal.contact.name}
                </p>
              )}
              {deal.due_date && (
                <p className="text-sm mt-1 flex items-center gap-1" style={{ color: v("text-muted") }}>
                  <Calendar size={12} /> {deal.due_date}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => openEditDeal(deal)}
                  className="rounded-lg px-3 py-1 text-xs font-medium transition-colors"
                  style={buttonStyle("secondary", isDark)}
                >
                  Изменить
                </button>
                <button
                  type="button"
                  onClick={() => deleteDealMut.mutate(deal.id)}
                  className="rounded-lg px-3 py-1 text-xs font-medium transition-colors"
                  style={buttonStyle("danger", isDark)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "pipeline" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border p-4 text-center" style={cardStyle("business", isDark)}>
              <p className="text-2xl font-bold" style={{ color: v("text-primary") }}>{stats?.total_deals || 0}</p>
              <p className="text-sm" style={{ color: v("text-muted") }}>Всего сделок</p>
            </div>
            <div className="rounded-xl border p-4 text-center" style={cardStyle("business", isDark)}>
              <p className="text-2xl font-bold" style={{ color: v("text-primary") }}>
                {(stats?.total_value || 0).toLocaleString()} ₽
              </p>
              <p className="text-sm" style={{ color: v("text-muted") }}>Общая сумма</p>
            </div>
            {DEAL_STATUSES.slice(0, 4).map((s) => (
              <div key={s.value} className="rounded-xl border p-4 text-center" style={cardStyle("note", isDark)}>
                <div className="w-8 h-1 rounded mx-auto mb-2" style={{ background: s.color }} />
                <p className="text-2xl font-bold" style={{ color: v("text-primary") }}>
                  {stats?.by_status[s.value] || 0}
                </p>
                <p className="text-sm" style={{ color: v("text-muted") }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border p-4" style={cardStyle("note", isDark)}>
            <h3 className="mb-3 font-semibold" style={{ color: v("text-primary") }}>Воронка продаж</h3>
            <div className="space-y-3">
              {DEAL_STATUSES.map((s) => {
                const count = stats?.by_status[s.value] || 0;
                const total = stats?.total_deals || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={s.value}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: v("text-muted") }}>{s.label}</span>
                      <span style={{ color: v("text-primary") }}>{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded" style={{ background: v("bg-tertiary") }}>
                      <div className="h-2 rounded transition-all" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showContactForm && (
        <div className="fixed inset-0 z-[90] grid place-items-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="w-full max-w-lg rounded-2xl border p-4 max-h-[90vh] overflow-y-auto"
            style={{ background: v("bg-secondary"), borderColor: v("border-primary") }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: v("text-primary") }}>
                {editingContact ? "Редактировать контакт" : "Добавить контакт"}
              </h2>
              <button type="button" onClick={() => { setShowContactForm(false); setEditingContact(null); }} style={{ color: v("text-muted") }}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={cName}
                onChange={(e) => setCName(e.target.value)}
                placeholder="Имя *"
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={inputStyle(isDark)}
              />
              <input
                type="email"
                value={cEmail}
                onChange={(e) => setCEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={inputStyle(isDark)}
              />
              <input
                type="text"
                value={cPhone}
                onChange={(e) => setCPhone(e.target.value)}
                placeholder="Телефон"
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={inputStyle(isDark)}
              />
              <input
                type="text"
                value={cCompany}
                onChange={(e) => setCCompany(e.target.value)}
                placeholder="Компания"
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={inputStyle(isDark)}
              />
              <input
                type="text"
                value={cPosition}
                onChange={(e) => setCPosition(e.target.value)}
                placeholder="Должность"
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={inputStyle(isDark)}
              />
              <textarea
                value={cNotes}
                onChange={(e) => setCNotes(e.target.value)}
                placeholder="Заметки"
                rows={2}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={inputStyle(isDark)}
              />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={cIsLead} onChange={(e) => setCIsLead(e.target.checked)} />
                <span className="text-sm" style={{ color: v("text-muted") }}>Потенциальный клиент</span>
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setShowContactForm(false); setEditingContact(null); }}
                className="rounded-lg px-4 py-2 text-sm transition-colors"
                style={buttonStyle("secondary", isDark)}
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => editingContact ? updateContactMut.mutate() : createContactMut.mutate()}
                disabled={!cName || createContactMut.isPending || updateContactMut.isPending}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={buttonStyle("primary", isDark)}
              >
                {editingContact ? "Сохранить" : "Создать"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDealForm && (
        <div className="fixed inset-0 z-[90] grid place-items-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="w-full max-w-lg rounded-2xl border p-4 max-h-[90vh] overflow-y-auto"
            style={{ background: v("bg-secondary"), borderColor: v("border-primary") }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: v("text-primary") }}>
                {editingDeal ? "Редактировать сделку" : "Добавить сделку"}
              </h2>
              <button type="button" onClick={() => { setShowDealForm(false); setEditingDeal(null); }} style={{ color: v("text-muted") }}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={dTitle}
                onChange={(e) => setDTitle(e.target.value)}
                placeholder="Название сделки *"
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={inputStyle(isDark)}
              />
              <textarea
                value={dDescription}
                onChange={(e) => setDDescription(e.target.value)}
                placeholder="Описание"
                rows={2}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={inputStyle(isDark)}
              />
              <select
                value={dContactId}
                onChange={(e) => setDContactId(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={inputStyle(isDark)}
              >
                <option value="">Без контакта</option>
                {contacts.map((c: Contact) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                value={dStatus}
                onChange={(e) => setDStatus(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={inputStyle(isDark)}
              >
                {DEAL_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={dValue}
                  onChange={(e) => setDValue(e.target.value)}
                  placeholder="Сумма"
                  className="flex-1 rounded-xl border px-3 py-2 text-sm"
                  style={inputStyle(isDark)}
                />
                <select
                  value={dCurrency}
                  onChange={(e) => setDCurrency(e.target.value)}
                  className="rounded-xl border px-3 py-2 text-sm"
                  style={inputStyle(isDark)}
                >
                  <option value="RUB">RUB</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <select
                value={dPriority}
                onChange={(e) => setDPriority(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={inputStyle(isDark)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <input
                type="date"
                value={dDueDate}
                onChange={(e) => setDDueDate(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={inputStyle(isDark)}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setShowDealForm(false); setEditingDeal(null); }}
                className="rounded-lg px-4 py-2 text-sm transition-colors"
                style={buttonStyle("secondary", isDark)}
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => editingDeal ? updateDealMut.mutate() : createDealMut.mutate()}
                disabled={!dTitle || createDealMut.isPending || updateDealMut.isPending}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={buttonStyle("primary", isDark)}
              >
                {editingDeal ? "Сохранить" : "Создать"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
