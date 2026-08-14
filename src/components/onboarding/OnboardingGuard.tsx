import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBusinessProfile } from '../../lib/businessService';
import { ADMIN_EMAIL } from '../../lib/adminService';
import { Business } from '../../types/database';
import { BusinessSetupForm } from './BusinessSetupForm';
import { LeadList } from '../leads/LeadList';
import { AdminDashboard } from '../admin/AdminDashboard';
import { Loader2 } from 'lucide-react';

interface OnboardingGuardProps {
  onNavigateToHome?: () => void;
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ onNavigateToHome }) => {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewAdmin, setViewAdmin] = useState<boolean>(false);

  const isAdminUser = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const checkOnboarding = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await getBusinessProfile(user.id);
    setBusiness(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (isAdminUser) {
      setViewAdmin(true);
    }
    checkOnboarding();
  }, [checkOnboarding, isAdminUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  // If user requested or qualified for Admin View
  if (viewAdmin && isAdminUser) {
    return <AdminDashboard onBackToApp={() => setViewAdmin(false)} />;
  }

  // If user has not created a business profile yet, show Business Setup screen
  if (!business) {
    return <BusinessSetupForm onComplete={checkOnboarding} />;
  }

  // Otherwise, render Lead Management module
  return (
    <LeadList
      business={business}
      onOpenAdmin={() => setViewAdmin(true)}
      onNavigateToHome={onNavigateToHome}
    />
  );
};
