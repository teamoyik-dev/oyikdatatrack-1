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
      className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/[0.06] sticky top-0 bg-background/80 backdrop-blur-md z-20"
    >
      {/* Search - Shrinks significantly on small mobile */}
      <div className="relative flex-1 max-w-[100px] xs:max-w-[150px] sm:max-w-[200px] md:max-w-xs transition-all duration-300">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full h-9 sm:h-10 pl-9 sm:pl-10 pr-4 rounded-lg bg-white/5 border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-2">
        {/* Add Button */}
        <button
          onClick={onAddClick}
          className="h-9 px-3 sm:px-5 rounded-lg text-sm font-semibold gradient-purple-blue text-primary-foreground flex items-center gap-2 hover:opacity-90 transition-opacity glow-purple"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Subscription</span>
          <span className="sm:hidden text-xs">Add</span>
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full gradient-purple-blue flex items-center justify-center shrink-0">
          <User size={16} className="text-primary-foreground" />
        </div>
      </div>
    </motion.header>
  );
}
