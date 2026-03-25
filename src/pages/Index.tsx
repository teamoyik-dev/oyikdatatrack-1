import { useState, useEffect } from "react";
import { Currency, Subscription } from "@/lib/types";
import {
  fetchSubscriptions,
  createSubscription,
  deleteSubscription,
  updateSubscription,
} from "@/lib/subscription-api";
import {
  getTotalMonthlySpend,
  getActiveCount,
  getUpcomingPayments,
  formatCurrency,
  getSpendTrend,
} from "@/lib/subscription-utils";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricCards } from "@/components/MetricCards";
import { SpendChart } from "@/components/SpendChart";
import { SubscriptionsTable } from "@/components/SubscriptionsTable";
import { AddSubscriptionModal } from "@/components/AddSubscriptionModal";
import { toast } from "sonner";

const Index = () => {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [baseCurrency, setBaseCurrency] = useState<Currency>("USD");
  const [modalOpen, setModalOpen] = useState(false);
  const [editSub, setEditSub] = useState<Subscription | null>(null);

  useEffect(() => {
    fetchSubscriptions().then(setSubs);
  }, []);

  const totalSpend = formatCurrency(getTotalMonthlySpend(subs, baseCurrency), baseCurrency);
  const activeCount = getActiveCount(subs);
  const upcomingCount = getUpcomingPayments(subs);

  const handleAdd = async (data: Omit<Subscription, "id" | "created_at">) => {
    if (editSub) {
      const updated = await updateSubscription(editSub.id, data);
      setSubs((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      toast.success("Subscription updated");
    } else {
      const newSub = await createSubscription(data);
      setSubs((prev) => [...prev, newSub]);
      toast.success("Subscription added");
    }
    setEditSub(null);
  };

  const handleDelete = async (id: string) => {
    await deleteSubscription(id);
    setSubs((prev) => prev.filter((s) => s.id !== id));
    toast.success("Subscription deleted");
  };

  const handleEdit = (sub: Subscription) => {
    setEditSub(sub);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar />
      <div className="flex-1 ml-[240px] flex flex-col">
        <DashboardHeader
          baseCurrency={baseCurrency}
          onCurrencyToggle={() => setBaseCurrency((c) => (c === "USD" ? "GBP" : "USD"))}
          onAddClick={() => { setEditSub(null); setModalOpen(true); }}
        />
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage all your AI & SaaS subscriptions
            </p>
          </div>
          <MetricCards
            totalSpend={totalSpend}
            activeCount={activeCount}
            upcomingCount={upcomingCount}
          />
          <SpendChart data={getSpendTrend(subs, baseCurrency)} />
          <SubscriptionsTable
            subscriptions={subs}
            baseCurrency={baseCurrency}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </main>
      </div>
      <AddSubscriptionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditSub(null); }}
        onSubmit={handleAdd}
        editData={editSub}
      />
    </div>
  );
};

export default Index;
