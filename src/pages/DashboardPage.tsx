import { useEffect, useState } from "react";
import { domainApi } from "../shared/api/domainApi";
import { ui } from "../styles/ui";

export function DashboardPage() {
  const [state, setState] = useState({ charts: 0, plans: 0, username: "" });

  useEffect(() => {
    void domainApi.getDashboard().then((data) => {
      setState({
        charts: data.charts.length,
        plans: data.plans.length,
        username: data.me.username,
      });
    });
  }, []);

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <article className={ui.card}>
        <p className={ui.subtitle}>Пользователь</p>
        <h2 className={ui.title}>{state.username || "..."}</h2>
      </article>
      <article className={ui.card}>
        <p className={ui.subtitle}>Финансовые графики</p>
        <h2 className={ui.title}>{state.charts}</h2>
      </article>
      <article className={ui.card}>
        <p className={ui.subtitle}>Бизнес-планы</p>
        <h2 className={ui.title}>{state.plans}</h2>
      </article>
    </section>
  );
}
