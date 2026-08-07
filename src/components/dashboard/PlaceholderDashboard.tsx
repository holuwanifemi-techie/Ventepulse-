import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Business } from '../../types/database';
import { LogOut, ShieldCheck, User as UserIcon, Building2, Briefcase, Loader2, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  business: Business | null;
  onRecheckBusiness?: () => void;
}

export const PlaceholderDashboard: React.FC<DashboardProps> = ({ business }) => {
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
        
        {/* User Identity Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800/80">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <UserIcon className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Authenticated Account
            </div>
            <h2 className="text-base font-bold text-white truncate" title={user?.email || ''}>
              {user?.email}
            </h2>
          </div>
        </div>

        {/* Business Profile Summary Badge */}
        {business && (
          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-400" /> Business Profile
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
                <CheckCircle2 className="w-3 h-3" /> Onboarded
              </span>
            </div>

            <div className="space-y-1 pt-1">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {business.business_name}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                <span>Industry Vertical: <strong className="text-slate-200 font-medium">{business.business_type}</strong></span>
              </p>
            </div>
          </div>
        )}

        {/* Session 5 Status Summary */}
        <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Database Layer</span>
            <span className="text-emerald-400 font-medium">PostgreSQL + RLS Configured</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Business Table Record</span>
            <span className="font-mono text-slate-300 text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {business?.id ? `${business.id.substring(0, 8)}...` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Next Session Note */}
        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
            Session 5 Complete 🎉
          </div>
          <p className="text-slate-400 leading-relaxed">
            Data foundation & onboarding complete! Session 6 will build Lead Management & Pipeline stages.
          </p>
        </div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700/80 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {signingOut ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              <span>Signing out...</span>
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Sign Out</span>
            </>
          )}
        </button>
      </main>
    </div>
  );
};
