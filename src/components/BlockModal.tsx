import { RichTextEditor } from "./RichTextEditor";
import { SwotEditor, TimelineEditor, MetricsEditor, MarkdownEditor, ChecklistEditor } from "./SmartBlockEditors";
import { isRichTextBlockType } from "../lib/blockDefaults";
import { ru } from "../i18n/ru";
import { v, tw, inputStyle, buttonStyle } from "../shared/theme";
import type { FinancialPlan } from "../api";

interface BlockModalProps {
  open: boolean;
  title: string;
  form: {
    title: string;
    content: string;
    block_type: string;
    rich_content: object;
    linked_financial_chart_ids: number[];
  };
  financialCharts: FinancialPlan[];
  isDark: boolean;
  onFormChange: (field: string, value: string | number[] | object) => void;
  onSave: () => void;
  onCancel: () => void;
}

const BLOCK_TYPES = [
  { value: "general", label: ru.blocks.types.general },
  { value: "financial", label: ru.blocks.types.financial },
  { value: "marketing", label: ru.blocks.types.marketing },
  { value: "operations", label: ru.blocks.types.operations },
  { value: "swot", label: ru.blocks.types.swot },
  { value: "timeline", label: ru.blocks.types.timeline },
  { value: "metrics", label: ru.blocks.types.metrics },
  { value: "chart_embed", label: ru.blocks.types.chart_embed },
  { value: "markdown", label: ru.blocks.types.markdown },
  { value: "checklist", label: ru.blocks.types.checklist },
] as const;

function isRichBlock(type: string) {
  return isRichTextBlockType(type);
}

function canSaveBlock(form: BlockModalProps["form"]): boolean {
  if (!form.title.trim()) return false;
  if (isRichBlock(form.block_type)) {
    return true;
  }
  if (form.block_type === "swot") {
    const data = form.rich_content as { strengths?: string[]; weaknesses?: string[]; opportunities?: string[]; threats?: string[] };
    return Object.values(data ?? {}).some((arr) => arr?.some((s) => s.trim()));
  }
  if (form.block_type === "timeline") {
    const data = form.rich_content as { milestones?: { title?: string }[] };
    return data?.milestones?.some((m) => m.title?.trim()) ?? false;
  }
  if (form.block_type === "metrics") {
    const data = form.rich_content as { metrics?: { label?: string; value?: string }[] };
    return data?.metrics?.some((m) => m.label?.trim() || m.value?.trim()) ?? false;
  }
  if (form.block_type === "chart_embed") {
    if (form.linked_financial_chart_ids.length > 0) return true;
    return false;
  }
  if (form.block_type === "markdown") {
    return ((form.rich_content as { markdown?: string })?.markdown ?? "").trim().length > 0;
  }
  if (form.block_type === "checklist") {
    const data = form.rich_content as { items?: { text?: string }[] };
    return data?.items?.some((i) => i.text?.trim()) ?? false;
  }
  return form.content.trim().length > 0;
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

  const canSave = canSaveBlock(form);

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div
        className="w-full max-h-[90vh] overflow-y-auto rounded-2xl border p-4 sm:max-w-xl sm:p-5"
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
            placeholder={ru.blocks.blockTitle}
          />

          <select
            className={tw.inputBase}
            style={inputStyle(isDark)}
            value={form.block_type}
            onChange={(e) => onFormChange("block_type", e.target.value)}
          >
            {BLOCK_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          {isRichBlock(form.block_type) && (
            <RichTextEditor
              content={form.rich_content}
              onChange={(json) => onFormChange("rich_content", json)}
              isDark={isDark}
              placeholder={ru.editor.placeholder}
            />
          )}

          {form.block_type === "swot" && (
            <SwotEditor value={form.rich_content} onChange={(v) => onFormChange("rich_content", v)} isDark={isDark} />
          )}

          {form.block_type === "timeline" && (
            <TimelineEditor value={form.rich_content} onChange={(v) => onFormChange("rich_content", v)} isDark={isDark} />
          )}

          {form.block_type === "metrics" && (
            <MetricsEditor value={form.rich_content} onChange={(v) => onFormChange("rich_content", v)} isDark={isDark} />
          )}

          {form.block_type === "chart_embed" && (
            financialCharts.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm" style={{ color: v("text-muted") }}>{ru.blocks.chartEmbed.select}</p>
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
                      <span className="line-clamp-2 break-all min-w-0" style={{ color: v("text-secondary") }} title={chart.title}>
                        {chart.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm rounded-xl border p-3" style={{ borderColor: v("border-secondary"), color: v("text-muted") }}>
                {ru.blocks.chartEmbed.noCharts}
              </p>
            )
          )}

          {form.block_type === "markdown" && (
            <MarkdownEditor value={form.rich_content} onChange={(v) => onFormChange("rich_content", v)} isDark={isDark} />
          )}

          {form.block_type === "checklist" && (
            <ChecklistEditor value={form.rich_content} onChange={(v) => onFormChange("rich_content", v)} isDark={isDark} />
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
            {ru.common.cancel}
          </button>
          <button
            className="w-full sm:w-auto rounded-xl border px-4 py-2 text-sm transition-colors"
            style={buttonStyle("primary", isDark)}
            disabled={!canSave}
            onMouseEnter={(e) => { if (canSave) e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            onClick={onSave}
          >
            {ru.common.save}
          </button>
        </div>
      </div>
    </div>
  );
}
