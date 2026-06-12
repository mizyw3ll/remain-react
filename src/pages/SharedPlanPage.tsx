import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSharedPlanApi, type BusinessPlan } from "../api";
import { ru } from "../i18n/ru";
import { ExpandableText } from "../components/ExpandableText";
import { MarkdownPreview } from "../components/MarkdownPreview";
import { SortableBlock } from "../components/SortableBlock";
import { useChartEmbedPoints } from "../components/BlockRenderer";
import { useFinancialPlansQuery } from "../hooks/useCachedData";
import { v } from "../shared/theme";
import { useTheme } from "../features/theme/ThemeContext";

export function SharedPlanPage() {
  const { token } = useParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { data: financialPlansList = [] } = useFinancialPlansQuery();
  const { chartPointsById, chartPointsLoading } = useChartEmbedPoints(plan?.blocks ?? []);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(false);
    getSharedPlanApi(token)
      .then(setPlan)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="h-48 animate-pulse rounded-2xl" style={{ background: v("bg-hover") }} />;
  }

  if (error || !plan) {
    return (
      <section className="flex min-h-[50vh] items-center justify-center pb-8 pt-2">
        <div className="text-center">
          <p className="text-lg font-semibold" style={{ color: v("text-primary") }}>
            {ru.share.notFound}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 pb-8 pt-2">
      <article
        className="rounded-2xl border p-5"
        style={{
          borderColor: v("border-primary"),
          background: v("bg-secondary"),
        }}
      >
        <ExpandableText text={plan.title} fontSize="text-2xl" fontWeight="font-semibold" color="text-primary" />
        <div className="mt-2">
          <MarkdownPreview content={plan.description || ru.common.noDescription} />
        </div>
      </article>

      {plan.blocks && plan.blocks.length > 0 && (
        <article className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight" style={{ color: v("text-primary") }}>
            Блоки
          </h2>
          <div className="space-y-2">
            {plan.blocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                isDark={isDark}
                financialCharts={financialPlansList.filter((c) => c.is_active)}
                chartPointsById={chartPointsById}
                chartPointsLoading={chartPointsLoading}
                onEdit={() => {}}
                onDelete={() => {}}
                onComments={() => {}}
                onDuplicate={() => {}}
              />
            ))}
          </div>
        </article>
      )}
    </section>
  );
}
