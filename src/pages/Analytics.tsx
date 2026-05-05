import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SpendChart } from "@/components/SpendChart";
import { useState, useEffect } from "react";
import { MonthlySnapshot, Subscription } from "@/lib/types";
import { fetchSubscriptions } from "@/lib/subscription-api";
import { getSpendTrend } from "@/lib/subscription-utils";
import { QuickStats } from "@/components/QuickStats";
import { fetchSnapshots, ensurePreviousMonthSnapshot } from "@/lib/snapshot-api";
import { MonthlyHistory } from "@/components/MonthlyHistory";
import { useAuth } from "@/lib/auth-context";

const Analytics = () => {
  const { org, orgLoading, loading } = useAuth();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [snapshots, setSnapshots] = useState<MonthlySnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      if (!org) return;
      
      try {
        const [s, sn] = await Promise.all([
          fetchSubscriptions(org.id),
          fetchSnapshots(org.id)
        ]);
        setSubs(s);
        setSnapshots(sn);

        // Auto-capture previous month if missing
        ensurePreviousMonthSnapshot(s, org.id);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (!orgLoading && org) {
      init();
    }
  }, [org, orgLoading]);

  return (
    <DashboardLayout 
      headerContent={
        <DashboardHeader
          onAddClick={() => { }}
        />
      }
    >
      <div className="space-y-6">
        {loading || orgLoading || isLoading || !org ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-white/5 rounded-lg" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-[300px] bg-white/5 rounded-2xl" />
              <div className="h-[300px] bg-white/5 rounded-2xl" />
            </div>
            <div className="h-24 bg-white/5 rounded-2xl" />
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
              <p className="text-sm text-muted-foreground mt-1">Detailed spending insights and trends</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SpendChart data={getSpendTrend(subs, snapshots)} />
              </div>
              <div>
                <QuickStats subs={subs} />
              </div>
            </div>

            <div>
              <MonthlyHistory snapshots={snapshots} />
            </div>

            <div className="glass-card rounded-xl p-6">
              <p className="text-muted-foreground text-sm">More analytics coming soon — category breakdowns, cost projections, and usage patterns.</p>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
