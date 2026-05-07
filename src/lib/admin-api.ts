import { supabase } from './supabase';
import { OrgWithStats, AdminStats } from './admin-types';

export async function fetchAllOrgs(): Promise<OrgWithStats[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*, subscriptions(count)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch organizations: ${error.message}`);
  }

  return data.map((org: any) => ({
    ...org,
    subscription_count: org.subscriptions ? org.subscriptions[0]?.count : 0,
  })) as OrgWithStats[];
}

export async function fetchOrgSubscriptions(orgId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch subscriptions: ${error.message}`);
  }

  return data;
}

export async function fetchAllSubscriptionsWithOrgs(): Promise<any[]> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, organizations(*)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch subscriptions with orgs: ${error.message}`);
  }

  return data;
}

export async function suspendOrg(orgId: string): Promise<void> {
  const { error } = await supabase
    .from('organizations')
    .update({ is_active: false })
    .eq('id', orgId);

  if (error) {
    throw new Error(`Failed to suspend organization: ${error.message}`);
  }
}

export async function activateOrg(orgId: string): Promise<void> {
  const { error } = await supabase
    .from('organizations')
    .update({ is_active: true })
    .eq('id', orgId);

  if (error) {
    throw new Error(`Failed to activate organization: ${error.message}`);
  }
}

export async function updateOrgPlan(orgId: string, plan: string): Promise<void> {
  const { error } = await supabase
    .from('organizations')
    .update({ plan })
    .eq('id', orgId);

  if (error) {
    throw new Error(`Failed to update organization plan: ${error.message}`);
  }
}

export async function deleteOrg(orgId: string): Promise<void> {
  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', orgId);

  if (error) {
    throw new Error(`Failed to delete organization: ${error.message}`);
  }
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const [
    { count: totalOrgs, error: totalOrgsErr },
    { count: activeOrgs, error: activeOrgsErr },
    { count: suspendedOrgs, error: suspendedOrgsErr },
    { count: totalSubs, error: totalSubsErr }
  ] = await Promise.all([
    supabase.from('organizations').select('*', { count: 'exact', head: true }),
    supabase.from('organizations').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('organizations').select('*', { count: 'exact', head: true }).eq('is_active', false),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }),
  ]);

  if (totalOrgsErr) throw new Error(`Failed to count total orgs: ${totalOrgsErr.message}`);
  if (activeOrgsErr) throw new Error(`Failed to count active orgs: ${activeOrgsErr.message}`);
  if (suspendedOrgsErr) throw new Error(`Failed to count suspended orgs: ${suspendedOrgsErr.message}`);
  if (totalSubsErr) throw new Error(`Failed to count total subscriptions: ${totalSubsErr.message}`);

  return {
    total_orgs: totalOrgs || 0,
    active_orgs: activeOrgs || 0,
    suspended_orgs: suspendedOrgs || 0,
    total_subscriptions: totalSubs || 0,
  };
}
