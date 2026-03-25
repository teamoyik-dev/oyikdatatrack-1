import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SpendTrend } from "@/lib/types";

interface SpendChartProps {
  data: SpendTrend[];
}

export function SpendChart({ data }: SpendChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="glass-card p-6"
    >
      <h3 className="text-sm font-semibold text-foreground mb-1">Monthly Spend Trend</h3>
      <p className="text-xs text-muted-foreground mb-6">Last 6 months overview</p>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="month"
            tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(220, 17%, 10%)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: 13,
            }}
            formatter={(value: number) => [`$${value}`, "Spend"]}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="hsl(239, 84%, 67%)"
            strokeWidth={2.5}
            fill="url(#spendGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
