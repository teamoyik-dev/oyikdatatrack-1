import { MonthlySnapshot } from "@/lib/types";
import { formatPound } from "@/lib/subscription-utils";
import { Calendar, TrendingUp, CreditCard } from "lucide-react";

interface MonthlyHistoryProps {
  snapshots: MonthlySnapshot[];
}

export function MonthlyHistory({ snapshots }: MonthlyHistoryProps) {
  // Sort snapshots by month descending (newest first)
  const sortedSnapshots = [...snapshots].sort((a, b) => b.month.localeCompare(a.month));

  if (snapshots.length === 0) {
    return null;
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-primary" />
          <h3 className="font-semibold text-foreground">Spending History</h3>
        </div>
        <p className="text-xs text-muted-foreground">Historical monthly snapshots</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left bg-white/[0.01]">
              <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Month</th>
              <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Spend</th>
              <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">Subscriptions</th>
              <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Captured</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {sortedSnapshots.map((snapshot) => {
              const date = new Date(snapshot.month + "-01");
              const monthLabel = date.toLocaleString("default", { month: "long", year: "numeric" });
              
              return (
                <tr key={snapshot.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar size={14} className="text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{monthLabel}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-foreground">
                      {formatPound(snapshot.total_spend)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                       <CreditCard size={14} className="text-muted-foreground" />
                       <span className="text-sm text-foreground">{snapshot.subscription_count}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs text-muted-foreground italic">
                      {new Date(snapshot.created_at).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
