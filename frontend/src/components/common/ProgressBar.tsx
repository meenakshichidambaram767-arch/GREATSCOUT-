import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showValue?: boolean;
  color?: 'emerald' | 'cyan' | 'amber' | 'indigo' | 'rose';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showValue = true,
  color = 'emerald',
  className = '',
}) => {
  const normalized = Math.min(100, Math.max(0, value));

  const colorStyles = {
    emerald: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]',
    cyan: 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]',
    amber: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]',
    indigo: 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]',
    rose: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1 text-xs">
          {label && <span className="text-slate-400 font-medium">{label}</span>}
          {showValue && <span className="text-slate-200 font-mono font-semibold">{normalized.toFixed(1)}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorStyles[color]}`}
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
};
