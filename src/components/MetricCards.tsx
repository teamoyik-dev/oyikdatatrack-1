import { motion } from "framer-motion";
import { DollarSign, CreditCard, Clock } from "lucide-react";

interface MetricCardsProps {
  totalSpend: string;
  activeCount: number;
  upcomingCount: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  }),
};

export function MetricCards({ totalSpend, activeCount, upcomingCount }: MetricCardsProps) {
  const metrics = [
    {
      title: "Total Monthly Spend",
      value: totalSpend,
      icon: DollarSign,
      gradient: "from-primary to-secondary",
      glow: "glow-purple",
    },
    {
      title: "Active Subscriptions",
      value: activeCount.toString(),
      icon: CreditCard,
      gradient: "from-emerald-500 to-teal-400",
      glow: "",
    },
    {
      title: "Upcoming (7 days)",
      value: upcomingCount.toString(),
      icon: Clock,
      gradient: "from-amber-500 to-orange-400",
      glow: "",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {metrics.map((m, i) => (
        <motion.div
          key={m.title}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass-card-hover p-5 group"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {m.title}
              </p>
              <p className="text-3xl font-bold mt-1 text-foreground">{m.value}</p>
            </div>
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center`}
            >
              <m.icon size={20} className="text-white" />
            </div>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${m.gradient}`}
              style={{ width: "65%" }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
