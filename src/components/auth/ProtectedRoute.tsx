import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthCard } from './AuthCard';
import { LandingPage } from '../landing/LandingPage';
import { OnboardingGuard } from '../onboarding/OnboardingGuard';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const [showAuthScreen, setShowAuthScreen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeView, setActiveView] = useState<'dashboard' | 'home'>('dashboard');

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

  // If user is NOT authenticated
  if (!user) {
    if (showAuthScreen) {
      return (
        <AuthCard
          initialTab={authMode}
          onBackToHome={() => setShowAuthScreen(false)}
        />
      );
    }

    return (
      <LandingPage
        onNavigateToAuth={(mode) => {
          setAuthMode(mode);
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
