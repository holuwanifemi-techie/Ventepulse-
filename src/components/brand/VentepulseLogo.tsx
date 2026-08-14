import React from 'react';

export interface VentepulseLogoProps {
  variant?: 'full' | 'icon' | 'wordmark';
  theme?: 'dark' | 'light' | 'auto';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  showWordmark?: boolean;
}

export const VentepulseLogo: React.FC<VentepulseLogoProps> = ({
  variant = 'full',
  theme = 'dark',
  size = 'md',
  className = '',
  showWordmark = true,
}) => {
  // Sizing map (in pixels)
  const getSizePx = (s: VentepulseLogoProps['size']) => {
    if (typeof s === 'number') return s;
    switch (s) {
      case 'xs':
        return 20;
      case 'sm':
        return 26;
      case 'md':
        return 34;
      case 'lg':
        return 42;
      case 'xl':
        return 50;
      default:
        return 34;
    }
  };

  const iconSize = getSizePx(size);

  // Typography scale relative to icon size
  const getFontSizeClass = (s: VentepulseLogoProps['size']) => {
    if (typeof s === 'number') {
      if (s <= 20) return 'text-xs font-bold';
      if (s <= 28) return 'text-sm font-bold';
      if (s <= 36) return 'text-base sm:text-lg font-bold';
      if (s <= 44) return 'text-xl font-extrabold';
      return 'text-2xl font-extrabold';
    }
    switch (s) {
      case 'xs':
        return 'text-xs font-bold';
      case 'sm':
        return 'text-sm font-bold';
      case 'md':
        return 'text-base sm:text-lg font-bold';
      case 'lg':
        return 'text-xl sm:text-2xl font-extrabold';
      case 'xl':
        return 'text-2xl sm:text-3xl font-extrabold';
      default:
        return 'text-base sm:text-lg font-bold';
    }
  };

  const isLight = theme === 'light';
  const displayWordmark = variant !== 'icon' && (variant === 'wordmark' || showWordmark);
  const displayIcon = variant !== 'wordmark';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* ---------------- 1. FRAMELESS PULSE WAVE ICON MARK ---------------- */}
      {displayIcon && (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 38 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform duration-200 hover:scale-105"
          aria-label="Ventepulse Logo Icon"
        >
          <defs>
            {/* Primary Pulse Wave Gradient */}
            <linearGradient id="vp-wave-primary" x1="2" y1="36" x2="36" y2="2" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="45%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>

            {/* Secondary Interlocking Signal Arc Gradient */}
            <linearGradient id="vp-wave-secondary" x1="6" y1="30" x2="32" y2="6" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#6EE7B7" />
            </linearGradient>

            {/* Apex Glow Filter */}
            <filter id="vp-apex-glow" x="0" y="0" width="38" height="38" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#10B981" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* 1. Main Continuous Upward Lead-Flow Pulse Wave */}
          <path
            d="M4 24C7.5 24 9.5 15 14 15C18.5 15 20.5 29 25 29C29.5 29 31.5 11 34 11"
            stroke="url(#vp-wave-primary)"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 2. Secondary Interlocking Signal Wave */}
          <path
            d="M8 13.5C12.5 13.5 14.5 21.5 19 21.5C23.5 21.5 25.5 7 29.5 7"
            stroke="url(#vp-wave-secondary)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.9"
          />

          {/* 3. Apex Conversion Node Spark */}
          <circle cx="34" cy="11" r="3.2" fill="#34D399" filter="url(#vp-apex-glow)" />
          <circle cx="34" cy="11" r="1.5" fill="#FFFFFF" />
        </svg>
      )}

      {/* ---------------- 2. WORDMARK ("Ventepulse") ---------------- */}
      {displayWordmark && (
        <span
          className={`tracking-tight font-sans ${getFontSizeClass(size)} ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          Vente<span className={isLight ? 'text-emerald-600' : 'text-emerald-400'}>pulse</span>
        </span>
      )}
    </div>
  );
};
