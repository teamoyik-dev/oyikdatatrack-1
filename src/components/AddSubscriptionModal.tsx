import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Subscription, BillingCycle, SubscriptionStatus, PlanType } from "@/lib/types";

interface AddSubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Subscription, "id" | "created_at">) => void;
  editData?: Subscription | null;
}

export function AddSubscriptionModal({ open, onClose, onSubmit, editData }: AddSubscriptionModalProps) {
  const getDefaultForm = (data?: Subscription | null) => ({
    platform: data?.platform || "",
    amount: data?.amount?.toString() || "",

    billing_cycle: (data?.billing_cycle || "monthly") as BillingCycle,
    billing_day: data?.billing_day?.toString() || "1",
    status: (data?.status || "active") as SubscriptionStatus,
    plan_type: (data?.plan_type || "basic") as PlanType,
    payment_source: data?.payment_source || "",
    subscription_date: data?.subscription_date || new Date().toISOString().slice(0, 10),
  });

  const [form, setForm] = useState(getDefaultForm(editData));

  useEffect(() => {
    if (open) {
      setForm(getDefaultForm(editData));
    }
  }, [open, editData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      platform: form.platform,
      amount: parseFloat(form.amount),

      billing_cycle: form.billing_cycle,
      billing_day: parseInt(form.billing_day),
      status: form.status,
      plan_type: form.plan_type,
      payment_source: form.payment_source,
      subscription_date: form.subscription_date,
      canceled_date: editData?.canceled_date || null,
    });
    onClose();
  };

  const inputClass =
    "w-full h-10 px-3 rounded-lg bg-[#1a1f2e] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all";
  const selectClass =
    "w-full h-10 px-3 rounded-lg bg-[#1a1f2e] border border-white/[0.08] text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all [&>option]:bg-[#1a1f2e] [&>option]:text-foreground";
  const labelClass = "block text-xs font-medium text-muted-foreground mb-1.5";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg glass-card border border-white/10 p-6 rounded-2xl shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                {editData ? "Edit Subscription" : "Add Subscription"}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
              >
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Platform Name</label>
                  <input
                    className={inputClass}
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                    placeholder="e.g. ChatGPT"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Amount</label>
                  <input
                    className={inputClass}
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="20.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className={labelClass}>Billing Cycle</label>
                  <select
                    className={selectClass}
                    value={form.billing_cycle}
                    onChange={(e) => setForm({ ...form, billing_cycle: e.target.value as BillingCycle })}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Billing Day</label>
                  <input
                    className={inputClass}
                    type="number"
                    min="1"
                    max="31"
                    value={form.billing_day}
                    onChange={(e) => setForm({ ...form, billing_day: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    className={selectClass}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as SubscriptionStatus })}
                  >
                    <option value="active">Active</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Plan Type</label>
                  <select
                    className={selectClass}
                    value={form.plan_type}
                    onChange={(e) => setForm({ ...form, plan_type: e.target.value as PlanType })}
                  >
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="trial">Trial</option>
                    <option value="trial_finished">Trial Finished</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Payment Source</label>
                <input
                  className={inputClass}
                  value={form.payment_source}
                  onChange={(e) => setForm({ ...form, payment_source: e.target.value })}
                  placeholder="e.g. Company Capital Card"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Subscription Start Date</label>
                <input
                  className={inputClass}
                  type="date"
                  value={form.subscription_date}
                  onChange={(e) => setForm({ ...form, subscription_date: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-lg text-sm font-semibold gradient-purple-blue text-primary-foreground hover:opacity-90 transition-opacity mt-2 glow-purple"
              >
                {editData ? "Update Subscription" : "Add Subscription"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
