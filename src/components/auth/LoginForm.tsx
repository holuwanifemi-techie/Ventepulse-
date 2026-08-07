import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { isValidEmail, formatAuthError } from '../../lib/authErrorTranslator';
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // Handle Password Reset Request
    if (isResetMode) {
      setLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}`,
        });
        setLoading(false);

        if (error) {
          setErrorMessage(formatAuthError(error));
        } else {
          setSuccessMessage('Password reset link sent! Please check your email inbox.');
        }
      } catch (err: any) {
        setLoading(false);
        setErrorMessage(formatAuthError(err));
      }
      return;
    }

    // Handle Regular Sign In
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    const { error } = await signIn(cleanEmail, password);
    setLoading(false);

    if (error) {
      setErrorMessage(formatAuthError(error));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Mode Header */}
      {isResetMode && (
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-slate-200">Reset Password</span>
          <button
            type="button"
            onClick={() => {
              setIsResetMode(false);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Sign In
          </button>
        </div>
      )}

      {/* Email Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-300">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=""
            required
            className="w-full pl-9 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Password Input (Hidden in Reset Mode) */}
      {!isResetMode && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300">
              Password
            </label>
            <button
              type="button"
              onClick={() => {
                setIsResetMode(true);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              required={!isResetMode}
              className="w-full pl-9 pr-10 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1 cursor-pointer"
              title={showPassword ? 'Hide Password' : 'Show Password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 font-bold text-sm text-slate-950 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{isResetMode ? 'Sending Link...' : 'Signing in...'}</span>
          </>
        ) : (
          <span>{isResetMode ? 'Send Password Reset Link' : 'Sign In to Dashboard'}</span>
        )}
      </button>
    </form>
  );
};
