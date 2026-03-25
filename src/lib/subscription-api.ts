import { supabase } from "./supabase";
import { Subscription } from "./types";

export async function fetchSubscriptions(): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching subscriptions:", error);
    throw new Error(error.message);
  }

  return (data ?? []) as Subscription[];
}

export async function createSubscription(
  payload: Omit<Subscription, "id" | "created_at">
): Promise<Subscription> {
  const { data, error } = await supabase
    .from("subscriptions")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error creating subscription:", error);
    throw new Error(error.message);
  }

  return data as Subscription;
}

export async function updateSubscription(
  id: string,
  payload: Partial<Subscription>
): Promise<Subscription> {
  const { data, error } = await supabase
    .from("subscriptions")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating subscription:", error);
    throw new Error(error.message);
  }

  return data as Subscription;
}

export async function deleteSubscription(id: string): Promise<void> {
  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting subscription:", error);
    throw new Error(error.message);
  }
}
