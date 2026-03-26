import { motion } from "framer-motion";
import { Subscription } from "@/lib/types";
import {
    getActiveCount,
    getCanceledCount,
    getPremiumCount,
    getTrialCount
} from "@/lib/subscription-utils";

interface QuickStatsProps {
    subs: Subscription[];
}

export function QuickStats({ subs }: QuickStatsProps) {
    const stats = [
        { label: "Active", count: getActiveCount(subs), color: "bg-emerald-500" },
        { label: "Canceled", count: getCanceledCount(subs), color: "bg-red-500" },
        { label: "Premium", count: getPremiumCount(subs), color: "bg-blue-500" },
        { label: "Trial", count: getTrialCount(subs), color: "bg-amber-500" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="glass-card p-6"
        >
            <div className="mb-6">
                <h3 className="text-lg font-bold text-foreground">Quick Stats</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Subscription breakdown</p>
            </div>

            <div className="space-y-5">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                        className="flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${stat.color} shadow-[0_0_8px_rgba(var(--color-primary),0.5)]`} />
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                {stat.label}
                            </span>
                        </div>
                        <span className="text-lg font-bold text-foreground tabular-nums">
                            {stat.count}
                        </span>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
