import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'badge';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  showSubtitle = true,
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 'w-9 h-9', text: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: 'w-11 h-11', text: 'text-xl', sub: 'text-[11px]' },
    xl: { icon: 'w-14 h-14', text: 'text-2xl', sub: 'text-xs' },
  };

  const currentSize = sizeMap[size];

  // Precision vector radar-compass mark matching the official GreatScout brand identity
  const LogoMark = (
    <div
      className={`${currentSize.icon} relative rounded-xl overflow-hidden shrink-0 shadow-sm border border-[#0e6670]/30 bg-[#072428] flex items-center justify-center`}
    >
      <img
        src="/greatscout-logo.jpg"
        alt="GreatScout"
        className="w-full h-full object-cover"
        onError={(e) => {
          // Graceful fallback to pure SVG mark if asset isn't loaded
          e.currentTarget.style.display = 'none';
        }}
      />
      {/* Precision geometric SVG compass overlay fallback */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-1 absolute inset-0 text-[#22b0c2]"
      >
        <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" />
        <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
        <circle cx="16" cy="16" r="3.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M16 2V7M16 25V30M2 16H7M25 16H30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 5L17.8 14.2L27 16L17.8 17.8L16 27L14.2 17.8L5 16L14.2 14.2L16 5Z" fill="#178996" fillOpacity="0.75" />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{LogoMark}</div>;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {LogoMark}
      <div className="flex flex-col min-w-0">
        <span className={`font-outfit font-extrabold tracking-tight text-[#1f2a2e] leading-tight ${currentSize.text}`}>
          GreatScout
        </span>
        {showSubtitle && (
          <span className={`font-mono uppercase tracking-[0.12em] font-semibold text-[#0e6670] ${currentSize.sub}`}>
            Market Intelligence
          </span>
        )}
      </div>
    </div>
  );
};
