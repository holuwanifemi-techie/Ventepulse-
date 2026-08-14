import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { VentepulseLogo } from '../brand/VentepulseLogo';
import { ArrowLeft } from 'lucide-react';

interface AuthCardProps {
  initialTab?: 'login' | 'register';
  onBackToHome?: () => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  initialTab = 'login',
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative">
      
      {/* Back to Landing Page Link */}
      {onBackToHome && (
        <button
          type="button"
          onClick={onBackToHome}
          className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </button>
      )}

      {/* Mobile Card Container */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
        
        {/* Branding Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <VentepulseLogo size="lg" theme="dark" />
          <p className="text-xs text-slate-400 pt-1">
            Never lose a lead. Never miss a follow-up.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}

      </div>
    </div>
  );
};
