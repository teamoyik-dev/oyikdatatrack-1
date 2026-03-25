import { Subscription, Currency } from "./types";

const EXCHANGE_RATES: Record<string, number> = {
  "USD_GBP": 0.8,
  "GBP_USD": 1.25,
  "USD_USD": 1,
  "GBP_GBP": 1,
};

export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  const key = `${from}_${to}`;
  return amount * (EXCHANGE_RATES[key] ?? 1);
}

export function getNextBillingDate(billingDay: number): Date {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), billingDay);
  if (thisMonth > now) return thisMonth;
  return new Date(now.getFullYear(), now.getMonth() + 1, billingDay);
}

export function getDaysRemaining(billingDay: number): number {
  const next = getNextBillingDate(billingDay);
  const now = new Date();
  const diff = next.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getTotalMonthlySpend(subs: Subscription[], baseCurrency: Currency): number {
  return subs
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + convertCurrency(s.amount, s.currency, baseCurrency), 0);
}

export function getActiveCount(subs: Subscription[]): number {
  return subs.filter((s) => s.status === "active").length;
}

export function getUpcomingPayments(subs: Subscription[]): number {
  return subs.filter((s) => s.status === "active" && getDaysRemaining(s.billing_day) <= 7).length;
}

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = currency === "USD" ? "$" : "£";
  return `${symbol}${amount.toFixed(2)}`;
}

export const currencySymbol = (c: Currency) => (c === "USD" ? "$" : "£");
