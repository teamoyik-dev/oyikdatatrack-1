import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Bot,
  Workflow,
  Phone,
  MessageSquare,
  Globe,
  FileText,
  Brain,
  Palette,
  Database,
  Image,
} from "lucide-react";
import { Subscription } from "@/lib/types";
import { getDaysRemaining, formatPound } from "@/lib/subscription-utils";

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

interface SubscriptionsTableProps {
  subscriptions: Subscription[];

  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
}

export function SubscriptionsTable({
  subscriptions,

  onEdit,
  onDelete,
}: SubscriptionsTableProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="glass-card overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">All Subscriptions</h3>
        <span className="text-xs text-muted-foreground">{subscriptions.length} total</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-white/[0.04]">
              <th className="px-6 py-3 text-left font-medium">Platform</th>
              <th className="px-4 py-3 text-left font-medium">Amount</th>
              <th className="px-4 py-3 text-left font-medium">Billing Cycle</th>
              <th className="px-4 py-3 text-left font-medium">Days Left</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Plan</th>
              <th className="px-4 py-3 text-left font-medium">Payment Source</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => {
              const Icon = iconMap[sub.icon || ""] || Bot;
              const days = getDaysRemaining(sub.billing_day);
              const converted = sub.amount;

              return (
                <tr
                  key={sub.id}
                  className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors group"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <Icon size={16} className="text-muted-foreground" />
                      </div>
                      <span className="font-medium text-foreground">{sub.platform}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-foreground">
                    {formatPound(converted)}
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground capitalize">
                    {sub.billing_day}th of every month
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`font-semibold ${sub.status === "active" && days <= 3
                        ? "text-red-400 animate-glow-pulse"
                        : "text-muted-foreground"
                        }`}
                    >
                      {sub.status === "active" ? `${days} days` : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClasses[sub.status]}`}
                    >
                      {sub.status === "active" ? "Active" : "Canceled"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${planClasses[sub.plan_type]}`}
                    >
                      {sub.plan_type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground text-xs">{sub.payment_source}</td>
                  <td className="px-4 py-3.5 text-right relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === sub.id ? null : sub.id)}
                      className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                    >
                      <MoreHorizontal size={16} className="text-muted-foreground" />
                    </button>
                    <AnimatePresence>
                      {openMenu === sub.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-4 top-12 w-36 py-1 glass-card border border-white/10 rounded-lg shadow-2xl z-10"
                        >
                          <button
                            onClick={() => { onEdit(sub); setOpenMenu(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-white/5 transition-colors"
                          >
                            <Edit size={14} /> Edit
                          </button>
                          <button
                            onClick={() => { onDelete(sub.id); setOpenMenu(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
