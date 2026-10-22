import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'cyan' | 'amber' | 'rose' | 'indigo' | 'slate';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  glow?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  className = '',
  glow = false,
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-950/70 text-emerald-400 border-emerald-500/30' + (glow ? ' glow-emerald' : ''),
    cyan: 'bg-cyan-950/70 text-cyan-400 border-cyan-500/30' + (glow ? ' glow-cyan' : ''),
    amber: 'bg-amber-950/70 text-amber-400 border-amber-500/30' + (glow ? ' glow-amber' : ''),
    rose: 'bg-rose-950/70 text-rose-400 border-rose-500/30' + (glow ? ' glow-rose' : ''),
    indigo: 'bg-indigo-950/70 text-indigo-300 border-indigo-500/30',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wide',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-all ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
