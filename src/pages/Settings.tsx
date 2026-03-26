import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { LogOut } from "lucide-react";

const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar />
      <div className="flex-1 ml-[240px] flex flex-col">
        <DashboardHeader
          onAddClick={() => { }}
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
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Account</h2>
            <p className="text-muted-foreground text-sm mb-3">Sign out of your current session.</p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all duration-200"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
