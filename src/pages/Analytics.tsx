import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SpendChart } from "@/components/SpendChart";
import { useState, useEffect } from "react";
import { Subscription } from "@/lib/types";
import { fetchSubscriptions } from "@/lib/subscription-api";
import { getSpendTrend } from "@/lib/subscription-utils";

const Analytics = () => {
  const [subs, setSubs] = useState<Subscription[]>([]);

  useEffect(() => {
    fetchSubscriptions().then(setSubs);
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar />
      <div className="flex-1 ml-[240px] flex flex-col">
        <DashboardHeader
          onAddClick={() => { }}
        />
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">Detailed spending insights and trends</p>
          </div>
          <SpendChart data={getSpendTrend(subs)} />
          <div className="glass-card rounded-xl p-6">
            <p className="text-muted-foreground text-sm">More analytics coming soon — category breakdowns, cost projections, and usage patterns.</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
