export type OrgWithStats = {
  id: string;
  name: string;
  owner_id: string;
  plan: 'free' | 'pro' | 'enterprise';
  is_active: boolean;
  currency: string;
  created_at: string;
  owner_email?: string;
  subscription_count?: number;
  total_monthly_spend?: number;
};

export type AdminStats = {
  total_orgs: number;
  active_orgs: number;
  suspended_orgs: number;
  total_subscriptions: number;
};
