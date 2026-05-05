import { supabase } from "./supabase";
import { Subscription } from "./types";

export async function fetchSubscriptions(orgId: string): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching subscriptions:", error);
    throw new Error(error.message || "Failed to fetch subscriptions");
  }

  return (data ?? []) as Subscription[];
}

export async function createSubscription(
  data: Omit<Subscription, "id" | "created_at">,
  orgId: string
): Promise<Subscription> {
  const payload = { ...data, org_id: orgId };
  
  const { data: result, error } = await supabase
    .from("subscriptions")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error creating subscription:", error);
    throw new Error(error.message || "Failed to create subscription");
  }

  return result as Subscription;
}

export async function updateSubscription(
  id: string,
  data: Partial<Subscription>,
  orgId: string
): Promise<Subscription> {
  const { data: result, error } = await supabase
    .from("subscriptions")
    .update(data)
    .eq("id", id)
    .eq("org_id", orgId)
    .select()
    .single();

  if (error) {
    console.error("Error updating subscription:", error);
    throw new Error(error.message || "Failed to update subscription");
  }

  return result as Subscription;
}

export async function deleteSubscription(id: string, orgId: string): Promise<void> {
  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", id)
    .eq("org_id", orgId);

  if (error) {
    console.error("Error deleting subscription:", error);
    throw new Error(error.message || "Failed to delete subscription");
  }
}
