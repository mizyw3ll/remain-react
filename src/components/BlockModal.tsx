import { v, tw, inputStyle, buttonStyle } from "../shared/theme";
import type { FinancialPlan } from "../api";

interface BlockModalProps {
  open: boolean;
  title: string;
  form: {
    title: string;
    content: string;
    block_type: string;
    linked_financial_chart_ids: number[];
  };
  financialCharts: FinancialPlan[];
  isDark: boolean;
  onFormChange: (field: string, value: string | number[]) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function BlockModal({
  open,
  title,
  form,
  financialCharts,
  isDark,
  onFormChange,
  onSave,
  onCancel,
}: BlockModalProps) {
  if (!open) return null;

  const canSave = form.title.trim() && form.content.trim();

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div
        className="w-full max-h-[90vh] overflow-y-auto rounded-2xl border p-4 sm:max-w-lg sm:p-5"
        style={{
          background: v("bg-sidebar"),
          borderColor: v("border-primary"),
        }}
      >
        <h3 className="text-lg font-semibold" style={{ color: v("text-primary") }}>{title}</h3>

        <div className="mt-4 space-y-3">
          <input
            className={tw.inputBase}
            style={inputStyle(isDark)}
            value={form.title}
            onChange={(e) => onFormChange("title", e.target.value)}
            placeholder="Название блока"
          />

          <textarea
            className={tw.inputBase}
            style={inputStyle(isDark)}
            value={form.content}
            onChange={(e) => onFormChange("content", e.target.value)}
            placeholder="Содержание блока"
            rows={4}
          />

          <select
            className={tw.inputBase}
            style={inputStyle(isDark)}
            value={form.block_type}
            onChange={(e) => onFormChange("block_type", e.target.value)}
          >
            <option value="general">Общий</option>
            <option value="financial">Финансовый</option>
            <option value="marketing">Маркетинг</option>
            <option value="operations">Операции</option>
          </select>

          {financialCharts.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm" style={{ color: v("text-muted") }}>Привязанные финансовые графики:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {financialCharts.map((chart) => (
                  <label
                    key={chart.id}
                    className="flex items-start gap-2 rounded-lg border px-3 py-2 text-xs cursor-pointer min-w-0"
                    style={{ borderColor: v("border-secondary"), background: v("bg-primary") }}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 shrink-0"
                      checked={form.linked_financial_chart_ids.includes(chart.id)}
                      onChange={(e) => {
                        const newIds = e.target.checked
                          ? [...form.linked_financial_chart_ids, chart.id]
                          : form.linked_financial_chart_ids.filter((id) => id !== chart.id);
                        onFormChange("linked_financial_chart_ids", newIds);
                      }}
                    />
                    <span
                      className="line-clamp-2 break-all min-w-0"
                      style={{ color: v("text-secondary") }}
                      title={chart.title}
                    >
                      {chart.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col-reverse sm:flex-row justify-end gap-2">
          <button
            className="w-full sm:w-auto rounded-xl border px-4 py-2 text-sm transition-colors"
            style={{ borderColor: v("border-secondary"), color: v("text-secondary") }}
            onMouseEnter={(e) => { e.currentTarget.style.background = v("bg-hover"); }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            className="w-full sm:w-auto rounded-xl border px-4 py-2 text-sm transition-colors"
            style={buttonStyle("primary", isDark)}
            disabled={!canSave}
            onMouseEnter={(e) => { if (canSave) e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            onClick={onSave}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
