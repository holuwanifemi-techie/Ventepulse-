import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createBusinessProfile } from '../../lib/businessService';
import { BusinessType } from '../../types/database';
import { Building2, Briefcase, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

const BUSINESS_TYPE_OPTIONS: BusinessType[] = [
  'Real Estate',
  'Car Dealership',
  'High-Ticket Closer',
  'Insurance',
  'Financial Services',
  'Other',
];

interface BusinessSetupFormProps {
  onComplete: () => void;
}

export const BusinessSetupForm: React.FC<BusinessSetupFormProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('Real Estate');
  const [customBusinessType, setCustomBusinessType] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user) {
      setErrorMessage('User session expired. Please sign in again.');
      return;
    }

    if (!businessName.trim()) {
      setErrorMessage('Please enter your business or agency name.');
      return;
    }

    const finalType = businessType === 'Other' && customBusinessType.trim()
      ? (customBusinessType.trim() as BusinessType)
      : businessType;

    setLoading(true);
    const { error } = await createBusinessProfile(user.id, businessName.trim(), finalType);
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      {/* Mobile Form Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
        
        {/* Onboarding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-inner mb-1">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Setup Your Business
          </h1>
          <p className="text-xs text-slate-400">
            Enter your business details to configure your dashboard.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Business Name Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Business / Agency Name <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Business Name"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Business Type Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Business Type <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
              >
                {BUSINESS_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option} className="bg-slate-900 text-slate-100">
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Business Type Input (Displayed when "Other" is selected) */}
          {businessType === 'Other' && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="block text-xs font-semibold text-slate-300">
                Specify Custom Business Type <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                value={customBusinessType}
                onChange={(e) => setCustomBusinessType(e.target.value)}
                placeholder="Specify your business type"
                required
                className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 font-bold text-sm text-slate-950 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <span>Complete Setup & Go to Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
