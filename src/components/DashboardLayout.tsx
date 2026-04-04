import { useState, ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import oyikLogo from "@/assets/logo-white.png";

interface DashboardLayoutProps {
  children: ReactNode;
  headerContent?: ReactNode;
}

export function DashboardLayout({ children, headerContent }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row overflow-x-hidden">
      {/* Sidebar - Handles its own mobile/desktop logic */}
      <AppSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-4 h-16 border-b border-white/[0.06] sticky top-0 bg-background/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu size={24} />
            </button>
            <img src={oyikLogo} alt="Oyik.ai" className="h-8 w-auto" />
          </div>
        </div>

        {headerContent}
        
        <main className="flex-1 p-4 md:p-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
