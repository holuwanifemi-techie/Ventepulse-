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
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  // Helper to ensure profile record exists in public.profiles table
  const syncUserProfile = async (currentUser: User) => {
    try {
      const isAdminUser = currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      await supabase.from('profiles').upsert(
        {
          id: currentUser.id,
          email: currentUser.email || '',
          full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User',
          is_admin: isAdminUser,
        },
        { onConflict: 'id' }
      );
    } catch (e) {
      console.warn('[AuthContext] Profile sync notice:', e);
    }
  };

  useEffect(() => {
    // 0. Inspect URL for recovery tokens or error params on initial mount
    try {
      const hashStr = window.location.hash ? window.location.hash.substring(1) : '';
      const searchStr = window.location.search ? window.location.search.substring(1) : '';
      const params = new URLSearchParams(hashStr || searchStr);

      if (params.get('error') || params.get('error_description') || params.get('error_code')) {
        const errorDesc = params.get('error_description')?.replace(/\+/g, ' ') || 'Password reset link is invalid or has expired.';
        setRecoveryError(errorDesc);
        // Clean URL to prevent repeated error trigger
        window.history.replaceState(null, '', window.location.pathname);
      } else if (params.get('type') === 'recovery' || hashStr.includes('type=recovery')) {
        setIsPasswordRecovery(true);
      }
    } catch (urlErr) {
      console.warn('[AuthContext] URL parse notice:', urlErr);
    }

    // 1. Fetch active session on initial mount
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          syncUserProfile(initialSession.user);
        }
      } catch (error) {
        console.error('Error fetching initial auth session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 2. Listen to real-time auth state changes (sign in, sign out, token refresh, password recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);
          // Clean hash so access tokens do not linger in address bar
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }
          return;
        }

        if (event === 'SIGNED_OUT') {
          setIsPasswordRecovery(false);
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        if (currentSession?.user) {
          syncUserProfile(currentSession.user);
        }
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
        options: {
          data: {
            full_name: cleanEmail.split('@')[0],
          },
        },
      });

      if (error) {
        return { session: null, error: new Error(formatAuthError(error)) };
      }

      if (data?.user) {
        await syncUserProfile(data.user);
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
          options: {
            data: {
              full_name: 'System Admin',
            },
          },
        });

        if (!signUpErr && signUpData?.user) {
          await syncUserProfile(signUpData.user);

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
              if (retry.data.session.user) {
                await syncUserProfile(retry.data.session.user);
              }
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
        if (data.session.user) {
          await syncUserProfile(data.session.user);
        }
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
      if (error) {
        return { error: new Error(formatAuthError(error)) };
      }
      setUser(null);
      setSession(null);
      return { error: null };
    } catch (err: any) {
      return { error: new Error(formatAuthError(err)) };
    }
  };

  // Update password (used during recovery or password reset)
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error: new Error(formatAuthError(error)) };
      }

      setIsPasswordRecovery(false);
      setRecoveryError(null);

      // Sign out the temporary recovery session so the user signs in fresh
      try {
        await supabase.auth.signOut();
      } catch (signOutErr) {
        console.warn('[AuthContext] Recovery signout notice:', signOutErr);
      }
      setUser(null);
      setSession(null);

      return { error: null };
    } catch (err: any) {
      return { error: new Error(formatAuthError(err)) };
    }
  };

  const clearPasswordRecovery = () => {
    setIsPasswordRecovery(false);
    setRecoveryError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isPasswordRecovery,
        recoveryError,
        signUp,
        signIn,
        signOut,
        updatePassword,
        clearPasswordRecovery,
      }}
    >
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
