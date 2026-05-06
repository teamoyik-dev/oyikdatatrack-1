import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { Organization } from './types';

type AuthContextType = {
  user: User | null;
  org: Organization | null;
  loading: boolean;
  orgLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, companyName: string, fullName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [orgLoading, setOrgLoading] = useState(false);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Safety timeout: If auth takes longer than 3 seconds (e.g. Supabase lock deadlock during HMR),
    // force loading to false so the app can recover and show the skeleton UI instead of a frozen spinner.
    const fallbackTimeout = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 3000);

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchOrg(session.user.id, false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Session check error:', error);
        if (mounted) setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (event === 'INITIAL_SESSION') {
        // Handled by checkSession to ensure token is fully ready and avoid race conditions
        return;
      }
      
      setUser(session?.user ?? null);
      if (session?.user) {
        // If we already have the org for this exact user, no need to refetch and cause a skeleton loader flash!
        if (currentUserIdRef.current === session.user.id) {
          setLoading(false);
          return;
        }
        await fetchOrg(session.user.id, false);
      } else {
        currentUserIdRef.current = null;
        setOrg(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(fallbackTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const fetchOrg = async (userId: string, isFromLogin: boolean = false) => {
    setOrgLoading(true);
    try {
      const queryPromise = supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', userId)
        .single();
        
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Auth Timeout')), 5000);
      });
      
      const response = await Promise.race([queryPromise, timeoutPromise]) as any;
      const { data, error } = response;
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching org:', error);
      }
      
      if (data) {
        if (!data.is_active) {
          await supabase.auth.signOut();
          setUser(null);
          setOrg(null);
          currentUserIdRef.current = null;
          const errorMsg = 'Your account has been suspended. Please contact support.';
          if (isFromLogin) {
            throw new Error(errorMsg);
          }
          return;
        }
        currentUserIdRef.current = userId;
        setOrg(data as Organization);
      } else {
        currentUserIdRef.current = null;
        setOrg(null);
      }
    } catch (err) {
      // Silently handle timeouts/errors to allow other triggers to take over
      console.error('Organization fetch error:', err);
    } finally {
      setOrgLoading(false);
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    if (data.user) {
      await fetchOrg(data.user.id, true);
    }
  };

  const signup = async (email: string, password: string, companyName: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: companyName,
          full_name: fullName,
        }
      }
    });
    if (error) throw error;

    if (data.user) {
      const { error: orgError } = await supabase.from('organizations').insert({
        name: companyName,
        owner_id: data.user.id,
        owner_email: email,
        plan: 'free',
        is_active: true,
        currency: 'GBP'
      });
      if (orgError) {
        console.error('Failed to create organization record:', orgError);
      }
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOrg(null);
    currentUserIdRef.current = null;
  };

  return (
    <AuthContext.Provider value={{ user, org, loading, orgLoading, login, signup, resetPassword, updatePassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
