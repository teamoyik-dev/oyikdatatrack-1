import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import oyikLogo from "@/assets/logo-white.png";
import { useAdminAuth } from "@/lib/admin-auth-context";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/admin" },
  { icon: Building2, label: "Clients", path: "/admin/clients" },
];

const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const location = useLocation();
  const navigate = useNavigate();
  const { adminLogout } = useAdminAuth();

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{ 
          x: 0,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed inset-y-0 left-0 z-50 bg-[#161b22] border-r border-blue-500/20 border-t-4 border-t-blue-500 shrink-0 flex flex-col transition-[width] duration-300 ${
          collapsed ? "w-[72px]" : "w-[240px]"
        }`}
      >
        {/* Logo & Badge */}
        <div className="flex flex-col justify-center px-5 h-24 border-b border-white/[0.06] overflow-hidden">
          <div className="flex items-center gap-2">
            <img
              src={oyikLogo}
              alt="Logo"
              className={`transition-all duration-300 object-contain shrink-0 ${collapsed ? "w-8 h-8" : "w-8 h-8"}`}
            />
            {!collapsed && (
              <span className="text-xl font-bold text-white tracking-tight">
                oyik.ai
              </span>
            )}
          </div>
          {!collapsed && (
            <div className="mt-1.5 px-1.5 py-0.5 w-max rounded bg-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-widest">
              Admin Panel
            </div>
          )}
        </div>

        {/* Collapse toggle (Desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-[#161b22] border border-blue-500/20 hidden lg:flex items-center justify-center hover:bg-blue-500/20 transition-colors z-50"
        >
          <ChevronLeft
            size={14}
            className={`text-blue-400 transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>

        {/* Nav Items */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500/20 to-transparent text-blue-400 border-l-2 border-blue-500"
                    : "text-muted-foreground hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                }`}
              >
                <item.icon size={20} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4 border-t border-white/[0.06] pt-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
          >
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? "ml-[72px]" : "ml-[240px]"}`}>
        <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
