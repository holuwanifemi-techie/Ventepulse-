import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthContextType } from '../types/auth';
import { formatAuthError } from '../lib/authErrorTranslator';
import { ADMIN_EMAIL } from '../lib/adminService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Fetch active session on initial mount
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (error) {
        console.error('Error fetching initial auth session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 2. Listen to real-time auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with email & password
  const signUp = async (email: string, password: string) => {
    const cleanEmail = email.trim();
    if (cleanEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      return {
        session: null,
        error: new Error('VentePulse@gmail.com is an administrator account. Please use the Sign In page directly.'),
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      });

      if (error) {
        return { session: null, error: new Error(formatAuthError(error)) };
      }

      // If user was created and session is returned, user is signed in
      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
      }

      return { session: data?.session ?? null, error: null };
    } catch (err: any) {
      return { session: null, error: new Error(formatAuthError(err)) };
    }
  };

  // Sign in with email & password
  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim();
    const isAdminAccount = cleanEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    try {
      let { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      // If admin logging in for the first time before manual backend creation, auto-provision on demand
      if (error && isAdminAccount) {
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });

        if (!signUpErr && signUpData?.user) {
          if (signUpData.session) {
            setSession(signUpData.session);
            setUser(signUpData.user);
            return { error: null };
          } else {
            const retry = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password,
            });
            if (retry.data?.session) {
              setSession(retry.data.session);
              setUser(retry.data.session.user);
              return { error: null };
            }
          }
        }
      }

      if (error) {
        return { error: new Error(formatAuthError(error)) };
      }

      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
      }

      return { error: null };
    } catch (err: any) {
      return { error: new Error(formatAuthError(err)) };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      return { error: error ? new Error(formatAuthError(error)) : null };
    } catch (err: any) {
      setUser(null);
      setSession(null);
      return { error: new Error(formatAuthError(err)) };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to consume AuthContext safely
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
