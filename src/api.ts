import axios from "axios";

export const TOKEN_KEY = "remain.accessToken";

export type User = {
  id: number;
  email: string;
  username: string;
  first_name?: string | null;
  last_name?: string | null;
};

export type BusinessPlan = {
  id: number;
  user_id?: number;
  title: string;
  description?: string | null;
  blocks?: PlanBlock[];
  created_at: string;
  updated_at?: string;
};

export type FinancialPlan = {
  id: number;
  user_id?: number;
  title: string;
  description?: string | null;
  currency_id: number;
  is_active: boolean;
  chart_points?: ChartPoint[];
  created_at: string;
  updated_at?: string;
};

export type Currency = {
  id: number;
  code: string;
  name: string;
  kind: string;
  is_active: boolean;
};

export type PlanBlock = {
  id: number;
  business_plan_id: number;
  title: string;
  content: string;
  block_type: string;
  linked_financial_chart_ids: number[];
  has_unpublished_draft: boolean;
  draft_saved_at?: string | null;
};

export type ChartPoint = {
  id: number;
  chart_id: number;
  date: string;
  type: "income" | "expense";
  amount: string;
  description?: string | null;
};

export const api = axios.create({
  baseURL: "/api/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function loginApi(login: string, password: string) {
  const body = new URLSearchParams();
  body.set("username", login);
  body.set("password", password);
  const { data } = await api.post<{ access_token: string; token_type: string }>(
    "/auth/login",
    body,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
  );
  return data;
}

export async function registerApi(payload: {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
}) {
  const { data } = await api.post<User>("/auth/register", payload);
  return data;
}

export async function meApi() {
  const { data } = await api.get<User>("/users/me");
  return data;
}

export async function deleteUserApi(userId: number) {
  await api.delete(`/users/${userId}`);
}

export async function getBusinessPlansApi() {
  const { data } = await api.get<BusinessPlan[]>("/business/plans");
  return data;
}

export async function createBusinessPlanApi(payload: {
  title: string;
  description?: string;
}) {
  const { data } = await api.post<BusinessPlan>("/business/plans", payload);
  return data;
}

export async function updateBusinessPlanApi(
  id: number,
  payload: Partial<Pick<BusinessPlan, "title" | "description">>,
) {
  const { data } = await api.patch<BusinessPlan>(`/business/plans/${id}`, payload);
  return data;
}

export async function deleteBusinessPlanApi(id: number) {
  await api.delete(`/business/plans/${id}`);
}

export async function getBusinessPlanApi(id: number) {
  const { data } = await api.get<BusinessPlan>(`/business/plans/${id}`);
  return data;
}

export async function getPlanBlocksApi(planId: number) {
  const { data } = await api.get<PlanBlock[]>(`/business/plans/${planId}/blocks`);
  return data;
}

export async function createPlanBlockApi(
  planId: number,
  payload: { title: string; content: string; block_type: string; linked_financial_chart_ids?: number[] },
) {
  const { data } = await api.post<PlanBlock>(`/business/plans/${planId}/blocks`, {
    rich_content: {},
    media_attachments: [],
    linked_financial_chart_ids: payload.linked_financial_chart_ids ?? [],
    ...payload,
  });
  return data;
}

export async function updatePlanBlockApi(
  planId: number,
  blockId: number,
  payload: { title?: string; content?: string; block_type?: string; linked_financial_chart_ids?: number[] },
) {
  const { data } = await api.patch<PlanBlock>(`/business/plans/${planId}/blocks/${blockId}`, payload);
  return data;
}

export async function deletePlanBlockApi(planId: number, blockId: number) {
  await api.delete(`/business/plans/${planId}/blocks/${blockId}`);
}

export async function reorderPlanBlocksApi(planId: number, newOrder: number[]) {
  await api.patch(`/business/plans/${planId}/blocks/reorder`, { new_order: newOrder });
}

export async function getFinancialPlansApi() {
  const { data } = await api.get<FinancialPlan[]>("/financial/charts");
  return data;
}

export async function createFinancialPlanApi(payload: {
  title: string;
  description?: string;
  currency_id: number;
  is_active: boolean;
}) {
  const { data } = await api.post<FinancialPlan>("/financial/charts", payload);
  return data;
}

export async function updateFinancialPlanApi(
  id: number,
  payload: Partial<Pick<FinancialPlan, "title" | "description" | "currency_id" | "is_active">>,
) {
  const { data } = await api.patch<FinancialPlan>(`/financial/charts/${id}`, payload);
  return data;
}

export async function deleteFinancialPlanApi(id: number) {
  await api.delete(`/financial/charts/${id}`);
}

export async function getFinancialPlanApi(id: number) {
  const { data } = await api.get<FinancialPlan>(`/financial/charts/${id}`);
  return data;
}

export async function getChartPointsApi(chartId: number) {
  const { data } = await api.get<ChartPoint[]>(`/financial/${chartId}/points`);
  return data;
}

export async function createChartPointApi(
  chartId: number,
  payload: { date: string; type: "income" | "expense"; amount: number; description?: string },
) {
  const { data } = await api.post<ChartPoint>(`/financial/${chartId}/points`, payload);
  return data;
}

export async function updateChartPointApi(
  chartId: number,
  pointId: number,
  payload: Partial<{ date: string; type: "income" | "expense"; amount: number; description: string }>,
) {
  const { data } = await api.patch<ChartPoint>(`/financial/${chartId}/points/${pointId}`, payload);
  return data;
}

export async function deleteChartPointApi(chartId: number, pointId: number) {
  await api.delete(`/financial/${chartId}/points/${pointId}`);
}

export async function getCurrenciesApi() {
  const { data } = await api.get<Currency[]>("/financial/currencies");
  return data;
}
