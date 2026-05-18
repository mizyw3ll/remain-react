export type User = {
  id: number;
  email: string;
  username: string;
  first_name?: string | null;
  last_name?: string | null;
  is_active: boolean;
  is_verified: boolean;
};

export type FinancialChart = {
  id: number;
  user_id: number;
  title: string;
  description?: string | null;
  currency_id: number;
  is_active: boolean;
  chart_points: ChartPoint[];
};

export type Currency = {
  id: number;
  code: string;
  name: string;
  kind: string;
  is_active: boolean;
};

export type ChartPoint = {
  id: number;
  chart_id: number;
  date: string;
  type: "income" | "expense";
  amount: string;
  description?: string | null;
};

export type BusinessPlan = {
  id: number;
  user_id: number;
  title: string;
  description?: string | null;
  blocks: PlanBlock[];
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
