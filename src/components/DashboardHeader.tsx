import { Search, Plus, User } from "lucide-react";
import { motion } from "framer-motion";
interface DashboardHeaderProps {
  onAddClick: () => void;
}

export function DashboardHeader({ onAddClick }: DashboardHeaderProps) {
  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-16 flex items-center justify-between px-6 border-b border-white/[0.06]"
    >
      {/* Search */}
      <div className="relative w-80">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search subscriptions..."
          className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/5 border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Add Button */}
        <button
          onClick={onAddClick}
          className="h-9 px-5 rounded-lg text-sm font-semibold gradient-purple-blue text-primary-foreground flex items-center gap-2 hover:opacity-90 transition-opacity glow-purple"
        >
          <Plus size={16} />
          Add Subscription
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full gradient-purple-blue flex items-center justify-center">
          <User size={16} className="text-primary-foreground" />
        </div>
      </div>
    </motion.header>
  );
}
