import { Subscription } from "./types";
import { mockSubscriptions } from "./mock-data";

// Simulated async CRUD – ready to replace with Supabase client
let subscriptions = [...mockSubscriptions];

export async function fetchSubscriptions(): Promise<Subscription[]> {
  await new Promise((r) => setTimeout(r, 300));
  return [...subscriptions];
}

export async function createSubscription(data: Omit<Subscription, "id" | "created_at">): Promise<Subscription> {
  await new Promise((r) => setTimeout(r, 200));
  const newSub: Subscription = {
    ...data,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  subscriptions.push(newSub);
  return newSub;
}

export async function updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription> {
  await new Promise((r) => setTimeout(r, 200));
  const idx = subscriptions.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Subscription not found");
  subscriptions[idx] = { ...subscriptions[idx], ...data };
  return subscriptions[idx];
}

export async function deleteSubscription(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 200));
  subscriptions = subscriptions.filter((s) => s.id !== id);
}
