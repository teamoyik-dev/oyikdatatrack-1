import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
} from "lucide-react";
import oyikLogo from "@/assets/logo-white.png";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: CreditCard, label: "All Subscriptions", path: "/subscriptions" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{ 
          x: (typeof isOpen !== 'undefined' && !isLargeScreen) 
            ? (isOpen ? 0 : -280) // Mobile drawer positioning
            : 0, // Desktop fixed
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed inset-y-0 left-0 z-50 glass-card border-r border-whitebox shrink-0 flex flex-col transition-[width] duration-300 ${
          collapsed ? "w-[72px]" : "w-[240px]"
        } ${typeof isOpen !== 'undefined' ? "lg:translate-x-0" : "hidden lg:flex"}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-20 border-b border-white/[0.06]">
          <img
            src={oyikLogo}
            alt="Oyik.ai"
            className={`transition-all duration-300 object-contain origin-left ${collapsed ? "w-8 h-8 object-left" : "w-36 h-auto max-h-12"}`}
          />
        </div>

        {/* Collapse toggle (Desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-muted border border-white/10 hidden lg:flex items-center justify-center hover:bg-primary/20 transition-colors z-50"
        >
          <ChevronLeft
            size={14}
            className={`text-muted-foreground transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>

        {/* Nav Items */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const showLabel = !collapsed || (typeof isOpen !== 'undefined' && !isLargeScreen);
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={onClose}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                  ? "gradient-purple-blue text-primary-foreground glow-purple"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
              >
                <item.icon size={20} className="shrink-0" />
                {showLabel && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Help */}
        <div className="px-3 pb-4">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
            <HelpCircle size={20} className="shrink-0" />
            {(!collapsed || (typeof isOpen !== 'undefined' && !isLargeScreen)) && <span>Help & Support</span>}
          </button>
        </div>
      </motion.aside>

      {/* Desktop Spacer to push content */}
      <div className={`hidden lg:block shrink-0 transition-all duration-300 ${collapsed ? "w-[72px]" : "w-[240px]"}`} />
    </>
  );
}
