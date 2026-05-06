import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

type AdminAuthContextType = {
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      
      if (session?.user && session.user.email === adminEmail) {
        setIsAdminAuthenticated(true);
      } else {
        setIsAdminAuthenticated(false);
      }
    };
    
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      if (session?.user && session.user.email === adminEmail) {
        setIsAdminAuthenticated(true);
      } else {
        setIsAdminAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    
    if (email !== adminEmail) {
      return false; // Not the admin email
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error || !data.user) {
      return false;
    }

    if (data.user.email === adminEmail) {
      setIsAdminAuthenticated(true);
      return true;
    }
    
    // Fallback security check (should theoretically never hit due to the first check)
    await supabase.auth.signOut();
    return false;
  };

  const adminLogout = async () => {
    await supabase.auth.signOut();
    setIsAdminAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAdminAuthenticated, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

