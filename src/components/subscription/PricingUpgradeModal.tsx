import React, { useState } from 'react';
import { X, Zap, Crown, Shield, Check, ExternalLink } from 'lucide-react';
import { getBachsCheckoutUrl, CheckoutCurrency } from '../../lib/subscriptionService';

interface PricingUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  currentPlan?: string;
}

export const PricingUpgradeModal: React.FC<PricingUpgradeModalProps> = ({
  isOpen,
  onClose,
  userId,
  userEmail,
  currentPlan = 'free',
}) => {
  const [currency, setCurrency] = useState<CheckoutCurrency>('NGN');

  if (!isOpen) return null;

  const plans = [
    {
      key: 'free',
      name: 'Free',
      price: currency === 'NGN' ? '₦0' : '$0',
      period: 'forever',
      leads: 10,
      icon: Shield,
      iconColor: 'text-slate-400',
      iconBg: 'bg-slate-800',
      border: 'border-slate-800',
      badge: null,
      features: ['Up to 10 leads', 'Follow-up reminders', 'WhatsApp message preview'],
      cta: null,
      ctaStyle: '',
    },
    {
      key: 'pro_100',
      name: 'Pro 100',
      price: currency === 'NGN' ? '₦9,999' : '$7.52',
      period: '/month',
      leads: 100,
      icon: Zap,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      border: 'border-emerald-500/40',
      badge: 'Most Popular',
      features: ['Up to 100 leads', 'All Free features', 'Priority support', 'Lead import (CSV)'],
      cta: 'Upgrade to Pro 100',
      ctaStyle: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20',
    },
    {
      key: 'pro_500',
      name: 'Pro 500',
      price: currency === 'NGN' ? '₦19,999' : '$15.02',
      period: '/month',
      leads: 500,
      icon: Crown,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      border: 'border-amber-500/40',
      badge: 'Best Value',
      features: ['Up to 500 leads', 'All Pro 100 features', 'Bulk operations', 'Automation rules'],
      cta: 'Upgrade to Pro 500',
      ctaStyle: 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20',
    },
  ];

  const handleUpgrade = (planKey: 'pro_100' | 'pro_500') => {
    const url = getBachsCheckoutUrl(planKey, userEmail, userId, currency);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/80">
          <div>
            <h2 className="text-lg font-extrabold text-white">Upgrade Your Plan</h2>
            <p className="text-xs text-slate-400 mt-0.5">Choose a plan to unlock more leads and features</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setCurrency('NGN')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  currency === 'NGN'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ₦ NGN
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  currency === 'USD'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                $ USD
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = currentPlan === plan.key || (currentPlan === 'free' && plan.key === 'free');
              return (
                <div
                  key={plan.key}
                  className={`relative flex flex-col p-4 rounded-2xl border ${plan.border} bg-slate-950/60 space-y-4`}
                >
                  {plan.badge && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-[10px] font-bold px-3 py-1 bg-emerald-500 text-slate-950 rounded-full shadow">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl ${plan.iconBg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${plan.iconColor}`} />
                    </div>
                    <span className="text-sm font-bold text-white">{plan.name}</span>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-white">{plan.price}</span>
                      <span className="text-xs text-slate-400">{plan.period}</span>
                    </div>
                    <div className="text-xs text-slate-400">{plan.leads} leads included</div>
                  </div>

                  <ul className="space-y-1.5 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <div className="py-2 px-3 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold text-center">
                      Current Plan
                    </div>
                  ) : plan.cta ? (
                    <button
                      type="button"
                      onClick={() => handleUpgrade(plan.key as 'pro_100' | 'pro_500')}
                      className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${plan.ctaStyle}`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {plan.cta}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>

          <p className="text-center text-[10px] text-slate-500 mt-4">
            Secure payment checkout via Bachs. Subscription activates upon confirmed payment verification.
          </p>
        </div>
      </div>
    </div>
  );
};
