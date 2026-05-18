import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { domainApi } from "../shared/api/domainApi";
import type { BusinessPlan } from "../shared/types/models";
import { ui } from "../styles/ui";

export function PlansPage() {
  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const loadPlans = () => void domainApi.getPlans().then(setPlans);

  useEffect(() => {
    loadPlans();
  }, []);

  async function createPlan() {
    setError("");
    if (!title.trim()) {
      setError("Название плана обязательно.");
      return;
    }
    try {
      await domainApi.createPlan({ title: title.trim(), description: description.trim() || undefined });
      setTitle("");
      setDescription("");
      loadPlans();
    } catch {
      setError("Не удалось создать бизнес-план.");
    }
  }

  return (
    <section className="space-y-4">
      <h1 className={ui.title}>Бизнес-планы</h1>
      <article className={`${ui.card} space-y-3`}>
        <h2 className="text-lg font-semibold text-title">Создать бизнес-план</h2>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Название плана"
          className={ui.input}
          maxLength={100}
        />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Описание (необязательно)"
          className={`${ui.input} min-h-24`}
        />
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <button className={ui.buttonPrimary} type="button" onClick={createPlan}>
          Создать план
        </button>
      </article>
      <div className="grid gap-3 md:grid-cols-2">
        {plans.map((plan) => (
          <Link key={plan.id} to={`/plans/${plan.id}`} className={ui.card}>
            <h2 className="text-lg font-semibold text-title">{plan.title}</h2>
            <p className={ui.subtitle}>{plan.description || "Без описания"}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
