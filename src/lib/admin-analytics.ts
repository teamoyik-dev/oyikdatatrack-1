import { OrgWithStats } from './admin-types';

// Simple conversion rate for display purposes (since user requested GBP everywhere)
const USD_TO_GBP = 0.8;

/**
 * Converts a subscription amount to a monthly GBP value based on its cycle and currency
 */
export const normalizeToMonthlyGBP = (amount: number, cycle: string, currency: string) => {
  let normalizedAmount = amount;
  
  // Convert currency
  if (currency?.toLowerCase() === 'usd') {
    normalizedAmount = amount * USD_TO_GBP;
  }

  // Convert cycle to monthly
  switch (cycle?.toLowerCase()) {
    case 'yearly':
      return normalizedAmount / 12;
    case 'weekly':
      return (normalizedAmount * 52) / 12;
    case 'custom':
      // Assuming custom is monthly for now, or handle specifically if needed
      return normalizedAmount;
    case 'monthly':
    default:
      return normalizedAmount;
  }
};

/**
 * Calculates total Monthly Recurring Revenue (MRR) from all active subscriptions
 */
export const calculateMRR = (subscriptions: any[]): number => {
  return subscriptions.reduce((total, sub) => {
    if (sub.status !== 'active') return total;
    
    const currency = sub.organizations?.currency || 'gbp';
    const monthlyAmount = normalizeToMonthlyGBP(sub.amount, sub.billing_cycle, currency);
    
    return total + monthlyAmount;
  }, 0);
};

/**
 * Calculates subscription trends (new vs canceled per month) for the last 6 months
 */
export const calculateTrends = (subscriptions: any[]) => {
  const trendsMap = new Map<string, { month: string; newSubs: number; canceledSubs: number }>();
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    trendsMap.set(monthStr, { month: monthStr, newSubs: 0, canceledSubs: 0 });
  }

  subscriptions.forEach(sub => {
    const createdDate = new Date(sub.created_at);
    const createdMonthStr = createdDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (trendsMap.has(createdMonthStr)) {
      const current = trendsMap.get(createdMonthStr)!;
      trendsMap.set(createdMonthStr, { ...current, newSubs: current.newSubs + 1 });
    }

    if (sub.status === 'canceled' && sub.canceled_date) {
      const canceledDate = new Date(sub.canceled_date);
      const canceledMonthStr = canceledDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (trendsMap.has(canceledMonthStr)) {
        const current = trendsMap.get(canceledMonthStr)!;
        trendsMap.set(canceledMonthStr, { ...current, canceledSubs: current.canceledSubs + 1 });
      }
    }
  });

  return Array.from(trendsMap.values());
};

/**
 * Calculates MRR growth over time
 */
export const calculateMRRGrowth = (subscriptions: any[]) => {
  const growthMap = new Map<string, { month: string; mrr: number }>();
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    growthMap.set(monthStr, { month: monthStr, mrr: 0 });
  }

  // A very simplified MRR growth calculation
  // For a real app, you'd calculate MRR at the *end* of each month based on active status at that time.
  // Here we just assign MRR to the month it was created for visualization purposes.
  subscriptions.forEach(sub => {
    if (sub.status !== 'active') return;
    
    const createdDate = new Date(sub.created_at);
    const monthStr = createdDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (growthMap.has(monthStr)) {
      const current = growthMap.get(monthStr)!;
      const currency = sub.organizations?.currency || 'gbp';
      const monthlyAmount = normalizeToMonthlyGBP(sub.amount, sub.billing_cycle, currency);
      
      growthMap.set(monthStr, { ...current, mrr: current.mrr + monthlyAmount });
    }
  });

  // Make it cumulative
  let cumulativeMRR = 0;
  const result = Array.from(growthMap.values()).map(item => {
    cumulativeMRR += item.mrr;
    return { ...item, mrr: cumulativeMRR };
  });

  return result;
};

/**
 * Gets top spending clients
 */
export const calculateTopClients = (subscriptions: any[], orgs: OrgWithStats[]) => {
  const spendByOrg = new Map<string, number>();

  subscriptions.forEach(sub => {
    if (sub.status !== 'active') return;
    
    const orgId = sub.org_id;
    if (!orgId) return;

    const currency = sub.organizations?.currency || 'gbp';
    const monthlyAmount = normalizeToMonthlyGBP(sub.amount, sub.billing_cycle, currency);

    const currentSpend = spendByOrg.get(orgId) || 0;
    spendByOrg.set(orgId, currentSpend + monthlyAmount);
  });

  const sortedOrgs = Array.from(spendByOrg.entries())
    .map(([orgId, spend]) => {
      const org = orgs.find(o => o.id === orgId);
      return {
        id: orgId,
        name: org?.name || 'Unknown Client',
        plan: org?.plan || 'Unknown',
        spend,
      };
    })
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5); // Top 5

  return sortedOrgs;
};

/**
 * Downloads data as a CSV file
 */
export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(fieldName => {
        let value = row[fieldName];
        if (value === null || value === undefined) value = '';
        if (typeof value === 'object') value = JSON.stringify(value);
        // Escape quotes and wrap in quotes if there's a comma
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
