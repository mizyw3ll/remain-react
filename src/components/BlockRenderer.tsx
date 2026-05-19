import { Link } from "react-router-dom";
import { normalizeSwotData } from "../lib/blockDefaults";
import { ru } from "../i18n/ru";
import { RichTextEditor } from "./RichTextEditor";
import { MarkdownPreview } from "./MarkdownPreview";
import { v } from "../shared/theme";
import type { PlanBlock, FinancialPlan } from "../api";

interface BlockRendererProps {
  block: PlanBlock;
  financialCharts: FinancialPlan[];
  isDark: boolean;
}

/* ─── SWOT ─── */
function SwotRenderer({ block }: { block: PlanBlock }) {
  const data = normalizeSwotData(block.rich_content);
  const quadrants: { key: keyof typeof data; label: string; color: string }[] = [
    { key: "strengths", label: ru.swot.strengths, color: "#16a34a" },
    { key: "weaknesses", label: ru.swot.weaknesses, color: "#dc2626" },
    { key: "opportunities", label: ru.swot.opportunities, color: "#2563eb" },
    { key: "threats", label: ru.swot.threats, color: "#ea580c" },
  ];
  return (
    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
      {quadrants.map(({ key, label, color }) => {
        const items = (data[key] ?? []).filter((i) => i.trim());
        return (
          <div key={key} className="rounded-xl border p-3" style={{ borderColor: v("border-primary"), background: v("bg-primary") }}>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color }}>{label}</p>
            {items.length === 0 ? (
              <p className="text-xs" style={{ color: v("text-muted") }}>{ru.blocks.empty.swot}</p>
            ) : (
              <ul className="list-disc pl-4 space-y-0.5">
                {items.map((item, i) => (
                  <li key={i} className="text-sm" style={{ color: v("text-secondary") }}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Timeline ─── */
function TimelineRenderer({ block }: { block: PlanBlock }) {
  const milestones = ((block.rich_content as { milestones?: { title: string; date: string; description: string }[] })?.milestones) ?? [];
  const valid = milestones.filter((m) => m.title.trim() || m.date);
  if (valid.length === 0) return <p className="mt-2 text-xs" style={{ color: v("text-muted") }}>{ru.blocks.empty.timeline}</p>;
  return (
    <div className="mt-2 relative pl-4">
      <div className="absolute left-1.5 top-2 bottom-2 w-px" style={{ background: v("border-secondary") }} />
      {valid.map((m, i) => (
        <div key={i} className="relative mb-3 pl-4">
          <div className="absolute left-[-13px] top-1.5 h-2.5 w-2.5 rounded-full border" style={{ borderColor: v("border-secondary"), background: v("bg-active") }} />
          <p className="text-sm font-medium" style={{ color: v("text-primary") }}>{m.title}</p>
          {m.date && <p className="text-xs" style={{ color: v("text-muted") }}>{new Date(m.date).toLocaleDateString()}</p>}
          {m.description && <p className="mt-0.5 text-xs" style={{ color: v("text-secondary") }}>{m.description}</p>}
        </div>
      ))}
    </div>
  );
}

/* ─── Metrics ─── */
function MetricsRenderer({ block }: { block: PlanBlock }) {
  const metrics = ((block.rich_content as { metrics?: { label: string; value: string; unit: string; change?: string }[] })?.metrics) ?? [];
  const valid = metrics.filter((m) => m.label.trim() || m.value.trim());
  if (valid.length === 0) return <p className="mt-2 text-xs" style={{ color: v("text-muted") }}>{ru.blocks.empty.metrics}</p>;
  return (
    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
      {valid.map((m, i) => (
        <div key={i} className="rounded-xl border p-3" style={{ borderColor: v("border-primary"), background: v("bg-primary") }}>
          <p className="text-xs" style={{ color: v("text-muted") }}>{m.label}</p>
          <p className="mt-1 text-lg font-semibold" style={{ color: v("text-primary") }}>
            {m.value} <span className="text-xs font-normal">{m.unit}</span>
          </p>
          {m.change && (
            <p className="mt-0.5 text-xs" style={{ color: m.change.startsWith("+") ? "#16a34a" : m.change.startsWith("-") ? "#dc2626" : v("text-secondary") }}>
              {m.change}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Chart Embed ─── */
function ChartEmbedRenderer({ block, financialCharts }: { block: PlanBlock; financialCharts: FinancialPlan[] }) {
  const linked = financialCharts.filter((c) => block.linked_financial_chart_ids.includes(c.id));
  if (linked.length === 0) return <p className="mt-2 text-xs" style={{ color: v("text-muted") }}>{ru.blocks.empty.charts}</p>;

  return (
    <div className="mt-2 grid gap-2 sm:grid-cols-2">
      {linked.map((chart) => (
        <Link
          key={chart.id}
          to={`/financial-plans/${chart.id}`}
          className="rounded-xl border p-3 transition hover:opacity-90"
          style={{ borderColor: v("border-primary"), background: v("bg-primary") }}
        >
          <p className="text-sm font-medium" style={{ color: v("text-primary") }}>{chart.title}</p>
          <p className="text-xs" style={{ color: v("text-muted") }}>{chart.description || ru.common.noDescription}</p>
        </Link>
      ))}
    </div>
  );
}

/* ─── Markdown ─── */
function MarkdownRenderer({ block }: { block: PlanBlock }) {
  const md = ((block.rich_content as { markdown?: string })?.markdown) ?? "";
  if (!md.trim()) return <p className="mt-2 text-xs" style={{ color: v("text-muted") }}>{ru.blocks.empty.markdown}</p>;
  return (
    <div className="mt-2">
      <MarkdownPreview content={md} />
    </div>
  );
}

/* ─── Checklist ─── */
function ChecklistRenderer({ block }: { block: PlanBlock }) {
  const items = ((block.rich_content as { items?: { text: string; checked: boolean }[] })?.items) ?? [];
  const valid = items.filter((i) => i.text.trim());
  if (valid.length === 0) return <p className="mt-2 text-xs" style={{ color: v("text-muted") }}>{ru.blocks.empty.checklist}</p>;
  return (
    <div className="mt-2 space-y-1">
      {valid.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input type="checkbox" checked={item.checked} readOnly className="shrink-0" />
          <span className={`text-sm ${item.checked ? "line-through" : ""}`} style={{ color: item.checked ? v("text-muted") : v("text-secondary") }}>
            {item.text}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Fallback / Rich / Plain ─── */
function DefaultRenderer({ block, isDark }: { block: PlanBlock; isDark: boolean }) {
  const hasRich = block.rich_content && Object.keys(block.rich_content as object).length > 0;
  if (hasRich) {
    return (
      <div className="mt-2">
        <RichTextEditor content={(block.rich_content as object) ?? null} onChange={() => {}} isDark={isDark} readOnly />
      </div>
    );
  }
  return (
    <p className="mt-2 text-sm whitespace-pre-wrap" style={{ color: v("text-secondary") }}>
      {block.content}
    </p>
  );
}

/* ─── Main dispatcher ─── */
export function BlockRenderer({ block, financialCharts, isDark }: BlockRendererProps) {
  switch (block.block_type) {
    case "swot":
      return <SwotRenderer block={block} />;
    case "timeline":
      return <TimelineRenderer block={block} />;
    case "metrics":
      return <MetricsRenderer block={block} />;
    case "chart_embed":
      return <ChartEmbedRenderer block={block} financialCharts={financialCharts} />;
    case "markdown":
      return <MarkdownRenderer block={block} />;
    case "checklist":
      return <ChecklistRenderer block={block} />;
    default:
      return <DefaultRenderer block={block} isDark={isDark} />;
  }
}
