
export type SubscriptionStatus = "active" | "canceled";
export type PlanType = "premium" | "trial" | "trial_finished" | "basic";
export type BillingCycle = "monthly" | "yearly";

export interface Subscription {
  id: string;
  platform: string;
  icon?: string;
  amount: number;
  billing_cycle: BillingCycle;
  subscription_date: string; // ISO date string of first billing
  billing_day: number; // day of month
  status: SubscriptionStatus;
  plan_type: PlanType;
  payment_source: string;
  created_at: string;
  canceled_date?: string | null;
}

export interface SpendTrend {
  month: string;
  amount: number;
}

export interface MonthlySnapshot {
  id: string;
  month: string; // e.g. "2026-03"
  total_spend: number;
  subscription_count: number;
  snapshot_data: any; // per-subscription breakdown
  created_at: string;
}
