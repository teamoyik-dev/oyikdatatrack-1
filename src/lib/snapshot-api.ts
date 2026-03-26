import { supabase } from "./supabase";
import { MonthlySnapshot, Subscription } from "./types";
import { getUKNow } from "./subscription-utils";

export async function fetchSnapshots(): Promise<MonthlySnapshot[]> {
    const { data, error } = await supabase
        .from("monthly_snapshots")
        .select("*")
        .order("month", { ascending: true });

    if (error) {
        console.error("Error fetching snapshots:", error);
        return [];
    }

    return (data ?? []) as MonthlySnapshot[];
}

export async function createSnapshot(
    snapshot: Omit<MonthlySnapshot, "id" | "created_at">
): Promise<MonthlySnapshot> {
    const { data, error } = await supabase
        .from("monthly_snapshots")
        .insert(snapshot)
        .select()
        .single();

    if (error) {
        console.error("Error creating snapshot:", error);
        throw new Error(error.message);
    }

    return data as MonthlySnapshot;
}

/**
 * Checks if a snapshot exists for the previous month.
 * If not, calculates the spend for that month and creates a snapshot.
 */
export async function ensurePreviousMonthSnapshot(subs: Subscription[]) {
    const now = getUKNow();
    // Get the first day of the current month, then subtract one hour to get last month
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthKey = lastMonthDate.toISOString().substring(0, 7); // "YYYY-MM"

    // 1. Check if snapshot already exists
    const { data: existing, error: checkError } = await supabase
        .from("monthly_snapshots")
        .select("id")
        .eq("month", monthKey)
        .maybeSingle();

    if (checkError) {
        console.error("Error checking for snapshot:", checkError);
        return;
    }

    if (existing) {
        // Already captured
        return;
    }

    // 2. Calculate spend for that specific month
    const monthEnd = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month

    const relevantSubs = subs.filter((s) => {
        const subDate = new Date(s.subscription_date);
        const startedByThen = subDate <= monthEnd;
        if (!startedByThen) return false;

        // Was it already canceled by then?
        if (s.status === "canceled" && s.canceled_date) {
            const canceledDate = new Date(s.canceled_date);
            if (canceledDate <= monthEnd) return false;
        }
        return true;
    });

    const totalSpend = relevantSubs.reduce((sum, s) => {
        const monthlyAmount = s.billing_cycle === "yearly" ? s.amount / 12 : s.amount;
        return sum + monthlyAmount;
    }, 0);

    // 3. Create the snapshot
    try {
        await createSnapshot({
            month: monthKey,
            total_spend: Math.round(totalSpend * 100) / 100,
            subscription_count: relevantSubs.length,
            snapshot_data: relevantSubs.map(s => ({
                platform: s.platform,
                amount: s.amount,
                billing_cycle: s.billing_cycle
            }))
        });
        console.log(`✅ Snapshot captured for ${monthKey}`);
    } catch (err) {
        console.error(`Failed to capture snapshot for ${monthKey}:`, err);
    }
}
