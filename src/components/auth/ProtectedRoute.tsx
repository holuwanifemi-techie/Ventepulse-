import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthCard } from './AuthCard';
import { LandingPage } from '../landing/LandingPage';
import { OnboardingGuard } from '../onboarding/OnboardingGuard';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { user, loading, isPasswordRecovery, recoveryError, clearPasswordRecovery } = useAuth();
  const [showAuthScreen, setShowAuthScreen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset-password'>('login');
  const [activeView, setActiveView] = useState<'dashboard' | 'home'>('dashboard');
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);

  // When password recovery or recovery error is present, automatically open AuthCard
  useEffect(() => {
    if (isPasswordRecovery) {
      setShowAuthScreen(true);
      setAuthMode('reset-password');
    } else if (recoveryError) {
      setShowAuthScreen(true);
      setAuthMode('login');
    }
  }, [isPasswordRecovery, recoveryError]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Verifying Session...</p>
        </div>
      </div>
    );
  }

  // Intercept password recovery flow:
  // Supabase creates a temporary recovery session for the user; we MUST keep them on the Reset Password screen
  // and prevent premature routing into the onboarding guard or dashboard until the new password is set.
  if (isPasswordRecovery) {
    return (
      <AuthCard
        initialTab="reset-password"
        onBackToHome={() => {
          clearPasswordRecovery();
          setShowAuthScreen(false);
          setAuthMode('login');
        }}
        onResetCompleted={() => {
          clearPasswordRecovery();
          setShowAuthScreen(true);
          setAuthMode('login');
          setAuthSuccessMessage('Password updated successfully! Please sign in with your new password.');
        }}
      />
    );
  }

  // If user is NOT authenticated
  if (!user) {
    if (showAuthScreen) {
      return (
        <AuthCard
          initialTab={authMode}
          initialSuccessMessage={authSuccessMessage}
          onBackToHome={() => {
            setShowAuthScreen(false);
            setAuthSuccessMessage(null);
          }}
        />
      );
    }

    return (
      <LandingPage
        onNavigateToAuth={(mode) => {
          setAuthMode(mode);
          setAuthSuccessMessage(null);
          setShowAuthScreen(true);
        }}
      />
    );
  }

  // If user IS authenticated and viewing the public Home landing page
  if (activeView === 'home') {
    return (
      <LandingPage
        onNavigateToDashboard={() => setActiveView('dashboard')}
        onNavigateToAuth={(mode) => {
          setAuthMode(mode);
          setShowAuthScreen(true);
        }}
      />
    );
  }

  // Otherwise, render authenticated workspace
  return (
    <OnboardingGuard
      onNavigateToHome={() => setActiveView('home')}
    />
  );
};
