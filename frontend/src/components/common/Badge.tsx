import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'cyan' | 'amber' | 'rose' | 'indigo' | 'slate' | 'teal' | 'solid-teal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  glow?: boolean; // kept for interface compatibility
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  className = '',
}) => {
  const variantStyles: Record<string, string> = {
    emerald: 'bg-[#eaf3f3] text-[#0e6670] border-[#dbe7e7]',
    teal: 'bg-[#eaf3f3] text-[#0e6670] border-[#dbe7e7]',
    'solid-teal': 'bg-[#0e6670] text-white border-transparent shadow-sm',
    cyan: 'bg-[#eaf3f3] text-[#0e6670] border-[#dbe7e7]',
    amber: 'bg-[#fef7e6] text-[#d98a00] border-[#fbe1b3]',
    rose: 'bg-[#fdf2f2] text-[#b3261e] border-[#f8cfcb]',
    indigo: 'bg-[#eaf3f3] text-[#0e6670] border-[#dbe7e7]',
    slate: 'bg-[#f4f8f8] text-[#55696e] border-[#dbe7e7]',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 tracking-[0.08em] font-medium',
    md: 'text-[12px] px-3 py-1 tracking-[0.08em] font-semibold',
    lg: 'text-sm px-4 py-1.5 font-semibold',
  };

  const style = variantStyles[variant] || variantStyles.slate;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono uppercase transition-colors ${style} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
