import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import CheckEmail from "./pages/CheckEmail.tsx";
import Index from "./pages/Index.tsx";
import AllSubscriptions from "./pages/AllSubscriptions.tsx";
import Analytics from "./pages/Analytics.tsx";
import Settings from "./pages/Settings.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import NotFound from "./pages/NotFound.tsx";
import { AdminAuthProvider } from "./lib/admin-auth-context.tsx";
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminGuard from "./components/AdminGuard.tsx";
import AdminLayout from "./components/AdminLayout.tsx";
import AdminOverview from "./pages/admin/AdminOverview.tsx";
import AdminClients from "./pages/admin/AdminClients.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AdminAuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/check-email" element={<CheckEmail />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route element={<AdminGuard />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminOverview />} />
                  <Route path="/admin/clients" element={<AdminClients />} />
                </Route>
              </Route>

              {/* Protected Client Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Index />} />
                <Route path="/subscriptions" element={<AllSubscriptions />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AdminAuthProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
