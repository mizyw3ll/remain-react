import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { domainApi } from "../shared/api/domainApi";
import type { Currency, FinancialChart } from "../shared/types/models";
import { ui } from "../styles/ui";

export function ChartsPage() {
  const [charts, setCharts] = useState<FinancialChart[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currencyId, setCurrencyId] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  const loadCharts = () => void domainApi.getCharts().then(setCharts);

  useEffect(() => {
    loadCharts();
    void domainApi.getCurrencies().then((data) => {
      setCurrencies(data);
      if (data.length > 0) setCurrencyId(data[0].id);
    });
  }, []);

  async function createChart() {
    setError("");
    if (!title.trim()) {
      setError("Название графика обязательно.");
      return;
    }
    if (!currencyId) {
      setError("Выберите валюту.");
      return;
    }
    try {
      await domainApi.createChart({
        title: title.trim(),
        description: description.trim() || undefined,
        currency_id: currencyId,
        is_active: isActive,
      });
      setTitle("");
      setDescription("");
      loadCharts();
    } catch {
      setError("Не удалось создать финансовый график.");
    }
  }

  return (
    <section className="space-y-4">
      <h1 className={ui.title}>Финансовые графики</h1>
      <article className={`${ui.card} space-y-3`}>
        <h2 className="text-lg font-semibold text-title">Создать финансовый график</h2>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Название графика"
          className={ui.input}
          maxLength={100}
        />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Описание (необязательно)"
          className={`${ui.input} min-h-24`}
        />
        <select
          className={ui.input}
          value={currencyId}
          onChange={(event) => setCurrencyId(Number(event.target.value))}
        >
          {currencies.map((currency) => (
            <option key={currency.id} value={currency.id}>
              {currency.code} - {currency.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
          Активный график
        </label>
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <button className={ui.buttonPrimary} type="button" onClick={createChart}>
          Создать график
        </button>
      </article>
      <div className="grid gap-3 md:grid-cols-2">
        {charts.map((chart) => (
          <Link key={chart.id} to={`/charts/${chart.id}`} className={ui.card}>
            <h2 className="text-lg font-semibold text-title">{chart.title}</h2>
            <p className={ui.subtitle}>{chart.description || "Без описания"}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
