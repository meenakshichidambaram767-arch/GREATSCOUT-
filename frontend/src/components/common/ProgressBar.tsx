import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showValue?: boolean;
  color?: 'emerald' | 'cyan' | 'amber' | 'indigo' | 'rose' | 'teal';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showValue = true,
  color = 'teal',
  className = '',
}) => {
  const normalized = Math.min(100, Math.max(0, value));

  const colorStyles: Record<string, string> = {
    emerald: 'bg-[#0e6670]',
    teal: 'bg-[#0e6670]',
    cyan: 'bg-[#178996]',
    amber: 'bg-[#d98a00]',
    indigo: 'bg-[#0e6670]',
    rose: 'bg-[#b3261e]',
  };

  const barColor = colorStyles[color] || 'bg-[#0e6670]';

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5 text-xs">
          {label && <span className="text-[#55696e] font-medium">{label}</span>}
          {showValue && <span className="text-[#1f2a2e] font-mono font-semibold">{normalized.toFixed(1)}%</span>}
        </div>
      )}
      <div className="w-full h-2.5 bg-[#e3eded] rounded-full overflow-hidden p-0.5 border border-[#dbe7e7]">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
};
