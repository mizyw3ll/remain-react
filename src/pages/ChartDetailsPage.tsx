import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { domainApi } from "../shared/api/domainApi";
import type { FinancialChart } from "../shared/types/models";
import { ui } from "../styles/ui";

export function ChartDetailsPage() {
  const { chartId = "" } = useParams();
  const [chart, setChart] = useState<FinancialChart | null>(null);

  useEffect(() => {
    if (!chartId) return;
    void domainApi.getChart(chartId).then(setChart);
  }, [chartId]);

  if (!chart) return <div className={ui.card}>Загрузка графика...</div>;

  return (
    <section className="space-y-4">
      <article className={ui.card}>
        <h1 className={ui.title}>{chart.title}</h1>
        <p className={ui.subtitle}>{chart.description || "Описание отсутствует"}</p>
      </article>
      <article className={ui.card}>
        <h2 className="mb-3 text-lg font-semibold text-title">Точки графика</h2>
        <div className="space-y-2">
          {chart.chart_points.map((point) => (
            <div key={point.id} className="rounded-xl border border-border p-3 text-sm">
              <p>{new Date(point.date).toLocaleString()}</p>
              <p>{point.type === "income" ? "Доход" : "Расход"}: {point.amount}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
