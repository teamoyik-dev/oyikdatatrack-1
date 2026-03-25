import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useState } from "react";
import { Currency } from "@/lib/types";

const Settings = () => {
  const [baseCurrency, setBaseCurrency] = useState<Currency>("USD");

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar />
      <div className="flex-1 ml-[240px] flex flex-col">
        <DashboardHeader
          baseCurrency={baseCurrency}
          onCurrencyToggle={() => setBaseCurrency((c) => (c === "USD" ? "GBP" : "USD"))}
          onAddClick={() => {}}
        />
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
          </div>
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">General</h2>
            <p className="text-muted-foreground text-sm">Settings page coming soon — notification preferences, payment methods, and team management.</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
