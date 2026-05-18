import { http } from "./http";
import type {
  BusinessPlan,
  Currency,
  FinancialChart,
  PlanBlock,
  User,
} from "../types/models";

export const domainApi = {
  getDashboard: async () => {
    const [charts, plans, me] = await Promise.all([
      http.get<FinancialChart[]>("/financial/charts"),
      http.get<BusinessPlan[]>("/business/plans"),
      http.get<User>("/users/me"),
    ]);
    return { charts: charts.data, plans: plans.data, me: me.data };
  },
  getCharts: async () => (await http.get<FinancialChart[]>("/financial/charts")).data,
  getChart: async (chartId: string) =>
    (await http.get<FinancialChart>(`/financial/charts/${chartId}`)).data,
  createChart: async (payload: {
    title: string;
    description?: string;
    currency_id: number;
    is_active: boolean;
  }) => (await http.post<FinancialChart>("/financial/charts", payload)).data,
  getCurrencies: async () => (await http.get<Currency[]>("/financial/currencies")).data,
  getPlans: async () => (await http.get<BusinessPlan[]>("/business/plans")).data,
  getPlan: async (planId: string) => (await http.get<BusinessPlan>(`/business/plans/${planId}`)).data,
  createPlan: async (payload: { title: string; description?: string }) =>
    (await http.post<BusinessPlan>("/business/plans", payload)).data,
  getBlocks: async (planId: string) =>
    (await http.get<PlanBlock[]>(`/business/plans/${planId}/blocks`)).data,
  reorderBlocks: async (planId: string, newOrder: number[]) =>
    http.patch(`/business/plans/${planId}/blocks/reorder`, { new_order: newOrder }),
};
