import { Subscription } from "./types";

export function getUKNow(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/London" }));
}

export function getNextBillingDate(billingDay: number): Date {
  const now = getUKNow();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), billingDay);
  if (thisMonth > now) return thisMonth;
  return new Date(now.getFullYear(), now.getMonth() + 1, billingDay);
}

export function getDaysRemaining(billingDay: number): number {
  const next = getNextBillingDate(billingDay);
  const now = getUKNow();
  const diff = next.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getTotalMonthlySpend(subs: Subscription[]): number {
  return subs
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + s.amount, 0);
}

export function getActiveCount(subs: Subscription[]): number {
  return subs.filter((s) => s.status === "active").length;
}

export function getCanceledCount(subs: Subscription[]): number {
  return subs.filter((s) => s.status === "canceled").length;
}

export function getPremiumCount(subs: Subscription[]): number {
  return subs.filter((s) => s.plan_type === "premium").length;
}

export function getTrialCount(subs: Subscription[]): number {
  return subs.filter((s) => s.plan_type === "trial").length;
}

export function getUpcomingPayments(subs: Subscription[]): number {
  return subs.filter((s) => s.status === "active" && getDaysRemaining(s.billing_day) <= 7).length;
}

export function formatPound(amount: number): string {
  return `£${amount.toFixed(2)}`;
}

export function getSpendTrend(subs: Subscription[]): { month: string; amount: number }[] {
  const now = getUKNow();

  const totalMonthsBack = 6;
  const showYear = false;
  const months: { month: string; amount: number }[] = [];

  for (let i = totalMonthsBack - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const isCurrentMonth = i === 0;

    const label = showYear
      ? monthStart.toLocaleString("default", { month: "short", year: "2-digit" })
      : monthStart.toLocaleString("default", { month: "short" });

    // For each month, sum up subscriptions that had started by that month.
    // Past months: include ALL subs (active + canceled) that existed then.
    // Current month: only count currently active subscriptions.
    const total = subs
      .filter((s) => {
        const subDate = new Date(s.subscription_date);
        const startedByThisMonth = subDate <= monthEnd;
        if (!startedByThisMonth) return false;

        if (s.status === "canceled" && s.canceled_date) {
          const canceledDate = new Date(s.canceled_date);
          if (canceledDate <= monthEnd) return false;
        }

        if (isCurrentMonth) return s.status === "active";
        return true;
      })
      .reduce((sum, s) => {
        const monthlyAmount =
          s.billing_cycle === "yearly" ? s.amount / 12 : s.amount;
        return sum + monthlyAmount;
      }, 0);

    months.push({ month: label, amount: Math.round(total * 100) / 100 });
  }

  return months;
}

