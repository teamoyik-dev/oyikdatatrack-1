import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
} from "lucide-react";
import oyikLogo from "@/assets/oyik-logo.png";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: CreditCard, label: "All Subscriptions", path: "/subscriptions" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed left-0 top-0 h-screen z-40 glass-card border-r border-white/[0.06] flex flex-col transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-[240px]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.06]">
        <img src={oyikLogo} alt="Oyik.ai" className="h-8 w-auto" />
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-muted border border-white/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
      >
        <ChevronLeft
          size={14}
          className={`text-muted-foreground transition-transform ${collapsed ? "rotate-180" : ""}`}
        />
      </button>

      {/* Nav Items */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "gradient-purple-blue text-primary-foreground glow-purple"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>



      {/* Help */}
      <div className="px-3 pb-4">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
          <HelpCircle size={20} className="shrink-0" />
          {!collapsed && <span>Help & Support</span>}
        </button>
      </div>
    </motion.aside>
  );
}
