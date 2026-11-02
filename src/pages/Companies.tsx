import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Company, Subscription } from "@/lib/types";
import {
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "@/lib/company-api";
import {
  fetchSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from "@/lib/subscription-api";
import { getCompanyStats, formatPound, getUKNow } from "@/lib/subscription-utils";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SubscriptionsTable } from "@/components/SubscriptionsTable";
import { AddSubscriptionModal } from "@/components/AddSubscriptionModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const Companies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editSub, setEditSub] = useState<Subscription | null>(null);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [companyTarget, setCompanyTarget] = useState<Company | null>(null);
  const { org, orgLoading, loading } = useAuth();

  useEffect(() => {
    if (!org) return;
    async function init() {
      try {
        const [c, s] = await Promise.all([
          fetchCompanies(org.id),
          fetchSubscriptions(org.id),
        ]);
        setCompanies(c);
        setSubs(s);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [org]);

  const stats = getCompanyStats(subs, companies);
  const selected = companies.find((c) => c.id === selectedId) || null;
  const companySubs = selected ? subs.filter((s) => s.company_id === selected.id) : [];

  const handleAddSub = async (data: Omit<Subscription, "id" | "created_at">) => {
    const payload = { ...data };

    if (editSub) {
      if (payload.status === "canceled" && editSub.status !== "canceled") {
        payload.canceled_date = getUKNow().toISOString();
      } else if (payload.status === "active") {
        payload.canceled_date = null;
      }
      const updated = await updateSubscription(editSub.id, payload, org!.id);
      setSubs((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      toast.success("Subscription updated");
    } else {
      if (payload.status === "canceled") {
        payload.canceled_date = getUKNow().toISOString();
      }
      const newSub = await createSubscription(payload, org!.id);
      setSubs((prev) => [...prev, newSub]);
      toast.success("Subscription added");
    }
    setEditSub(null);
  };

  const handleDeleteSub = async (id: string) => {
    await deleteSubscription(id, org!.id);
    setSubs((prev) => prev.filter((s) => s.id !== id));
    toast.success("Subscription deleted");
  };

  const handleSaveCompany = async (name: string) => {
    if (companyTarget) {
      const updated = await updateCompany(companyTarget.id, { name }, org!.id);
      setCompanies((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast.success("Company renamed");
    } else {
      const created = await createCompany(name, org!.id);
      setCompanies((prev) => [...prev, created]);
      toast.success("Company added");
    }
    setCompanyDialogOpen(false);
    setCompanyTarget(null);
  };

  const handleDeleteCompany = async (company: Company) => {
    if (!window.confirm(`Delete "${company.name}"? Its subscriptions will become Unassigned.`)) {
      return;
    }
    await deleteCompany(company.id, org!.id);
    // FK sets company_id to null; mirror it locally
    setSubs((prev) =>
      prev.map((s) => (s.company_id === company.id ? { ...s, company_id: null } : s))
    );
    setCompanies((prev) => prev.filter((c) => c.id !== company.id));
    if (selectedId === company.id) setSelectedId(null);
    toast.success("Company deleted — its subscriptions are now Unassigned");
  };

  return (
    <DashboardLayout
      headerContent={
        <DashboardHeader
          onAddClick={() => { setEditSub(null); setSubModalOpen(true); }}
        />
      }
    >
      <div className="space-y-6">
        {loading || orgLoading || !org || isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-white/5 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="h-36 bg-white/5 rounded-2xl" />
              <div className="h-36 bg-white/5 rounded-2xl" />
              <div className="h-36 bg-white/5 rounded-2xl" />
            </div>
          </div>
        ) : selected ? (
          <>
            <button
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} /> Back to companies
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 size={22} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{selected.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    {companySubs.length} subscription{companySubs.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setCompanyTarget(selected); setCompanyDialogOpen(true); }}
                  className="h-9 px-3 rounded-lg bg-white/5 border border-white/[0.08] text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Pencil size={14} /> Rename
                </button>
                <button
                  onClick={() => handleDeleteCompany(selected)}
                  className="h-9 px-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={14} /> Delete
                </button>
                <button
                  onClick={() => { setEditSub(null); setSubModalOpen(true); }}
                  className="h-9 px-4 rounded-lg text-sm font-semibold gradient-purple-blue text-primary-foreground flex items-center gap-2 hover:opacity-90 transition-opacity glow-purple"
                >
                  <Plus size={16} /> Add Subscription
                </button>
              </div>
            </div>

            {companySubs.length > 0 ? (
              <SubscriptionsTable
                subscriptions={companySubs}
                onEdit={(sub) => { setEditSub(sub); setSubModalOpen(true); }}
                onDelete={handleDeleteSub}
              />
            ) : (
              <div className="glass-card p-8 text-center text-sm text-muted-foreground">
                No subscriptions under {selected.name} yet.
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Companies</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Group your subscriptions by company
                </p>
              </div>
              <button
                onClick={() => { setCompanyTarget(null); setCompanyDialogOpen(true); }}
                className="h-9 px-4 rounded-lg text-sm font-semibold gradient-purple-blue text-primary-foreground flex items-center gap-2 hover:opacity-90 transition-opacity glow-purple"
              >
                <Plus size={16} /> Add Company
              </button>
            </div>

            {stats.length === 0 ? (
              <div className="glass-card p-8 text-center text-sm text-muted-foreground">
                No companies yet. Create one to start grouping subscriptions.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map(({ company, count, monthlySpend }, i) => (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedId(company.id)}
                    className="glass-card p-5 cursor-pointer hover:border-primary/30 hover:bg-white/[0.04] transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Building2 size={22} className="text-primary" />
                      </div>
                      <div
                        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => { setCompanyTarget(company); setCompanyDialogOpen(true); }}
                          className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                          title="Rename"
                        >
                          <Pencil size={14} className="text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(company)}
                          className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                    <p className="font-semibold text-foreground mt-4">{company.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {count} subscription{count === 1 ? "" : "s"}
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-3">
                      {formatPound(monthlySpend)}
                      <span className="text-xs font-normal text-muted-foreground">/mo active</span>
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <AddSubscriptionModal
        open={subModalOpen}
        onClose={() => { setSubModalOpen(false); setEditSub(null); }}
        onSubmit={handleAddSub}
        editData={editSub}
        companies={companies}
        defaultCompanyId={selectedId}
      />

      <CompanyDialog
        open={companyDialogOpen}
        initialName={companyTarget?.name}
        onClose={() => { setCompanyDialogOpen(false); setCompanyTarget(null); }}
        onSubmit={handleSaveCompany}
      />
    </DashboardLayout>
  );
};

function CompanyDialog({
  open,
  initialName,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initialName?: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName(initialName || "");
  }, [open, initialName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="glass-card border-white/10">
        <DialogHeader>
          <DialogTitle>{initialName ? "Rename Company" : "Add Company"}</DialogTitle>
          <DialogDescription>
            {initialName
              ? "Update the company name."
              : "Give the company a name, then add subscriptions under it."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. BM Estate"
            className="w-full h-10 px-3 rounded-lg bg-[#1a1f2e] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            required
          />
          <button
            type="submit"
            className="w-full h-11 rounded-lg text-sm font-semibold gradient-purple-blue text-primary-foreground hover:opacity-90 transition-opacity glow-purple"
          >
            {initialName ? "Save" : "Add Company"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default Companies;
