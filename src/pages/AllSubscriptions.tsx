import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Workflow, Phone, MessageSquare, Globe, FileText, Brain, Palette, Database, Image,
  Calendar, CreditCard, Tag, Clock, ArrowLeft, Edit, Trash2, X,
} from "lucide-react";
import { Subscription } from "@/lib/types";
import { fetchSubscriptions, createSubscription, deleteSubscription, updateSubscription } from "@/lib/subscription-api";
import { getDaysRemaining, formatPound } from "@/lib/subscription-utils";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AddSubscriptionModal } from "@/components/AddSubscriptionModal";
import { toast } from "sonner";

const iconMap: Record<string, React.ElementType> = {
  Bot, Workflow, Phone, MessageSquare, Globe, FileText, Brain, Palette, Database, Image,
};

const statusClasses: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  canceled: "bg-red-500/15 text-red-400 border-red-500/20",
};

const planClasses: Record<string, string> = {
  premium: "bg-primary/15 text-primary border-primary/20",
  trial: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  trial_finished: "bg-white/10 text-muted-foreground border-white/10",
  basic: "bg-secondary/15 text-secondary border-secondary/20",
};

const AllSubscriptions = () => {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSub, setEditSub] = useState<Subscription | null>(null);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  useEffect(() => { fetchSubscriptions().then(setSubs); }, []);

  const handleAdd = async (data: Omit<Subscription, "id" | "created_at">) => {
    if (editSub) {
      const updated = await updateSubscription(editSub.id, data);
      setSubs((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      if (selectedSub?.id === updated.id) setSelectedSub(updated);
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
    if (selectedSub?.id === id) setSelectedSub(null);
    toast.success("Subscription deleted");
  };

  const handleEdit = (sub: Subscription) => { setEditSub(sub); setModalOpen(true); };

  return (
    <DashboardLayout 
      headerContent={
        <DashboardHeader
          onAddClick={() => { setEditSub(null); setModalOpen(true); }}
        />
      }
    >
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {selectedSub ? (
            <SubscriptionDetail
              key="detail"
              sub={selectedSub}
              onBack={() => setSelectedSub(null)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">All Subscriptions</h1>
                  <p className="text-sm text-muted-foreground mt-1">Click a platform to see details</p>
                </div>
                <span className="text-sm text-muted-foreground">{subs.length} total subscriptions</span>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-6">
                {subs.map((sub, i) => {
                  const Icon = iconMap[sub.icon || ""] || Bot;
                  const amount = sub.amount;
                  return (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedSub(sub)}
                      className="glass-card p-5 cursor-pointer hover:border-primary/30 hover:bg-white/[0.04] transition-all group"
                    >
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Icon size={22} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{sub.platform}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatPound(amount)}/mo
                          </p>
                        </div>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusClasses[sub.status]}`}>
                          {sub.status === "active" ? "Active" : "Canceled"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AddSubscriptionModal open={modalOpen} onClose={() => { setModalOpen(false); setEditSub(null); }} onSubmit={handleAdd} editData={editSub} />
    </DashboardLayout>
  );
};

function SubscriptionDetail({
  sub,
  onBack,
  onEdit,
  onDelete,
}: {
  sub: Subscription;
  onBack: () => void;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
}) {
  const Icon = iconMap[sub.icon || ""] || Bot;
  const days = getDaysRemaining(sub.billing_day);

  const details = [
    { icon: CreditCard, label: "Amount", value: `${formatPound(sub.amount)} / month` },
    { icon: Calendar, label: "Billing Day", value: `${sub.billing_day}th of every month` },
    { icon: Clock, label: "Days Until Renewal", value: sub.status === "active" ? `${days} days` : "—" },
    { icon: Tag, label: "Plan Type", value: sub.plan_type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) },
    { icon: CreditCard, label: "Payment Source", value: sub.payment_source },
    { icon: Calendar, label: "Subscription Date", value: new Date(sub.subscription_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
    { icon: Calendar, label: "Billing Cycle", value: sub.billing_cycle.charAt(0).toUpperCase() + sub.billing_cycle.slice(1) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back to all subscriptions
      </button>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon size={28} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{sub.platform}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClasses[sub.status]}`}>
                  {sub.status === "active" ? "Active" : "Canceled"}
                </span>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${planClasses[sub.plan_type]}`}>
                  {sub.plan_type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(sub)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
            >
              <Edit size={14} /> Edit
            </button>
            <button
              onClick={() => onDelete(sub.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {details.map((d, i) => (
            <motion.div
              key={d.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <d.icon size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{d.label}</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{d.value}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default AllSubscriptions;
