import React from 'react';

export interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  const normalized = Math.min(100, Math.max(0, Math.round(score)));

  let colorClass = 'text-[#0e6670] stroke-[#0e6670]';
  let labelText = 'High Potential';

  if (normalized < 60) {
    colorClass = 'text-[#b3261e] stroke-[#b3261e]';
    labelText = 'Low Signal';
  } else if (normalized < 75) {
    colorClass = 'text-[#d98a00] stroke-[#d98a00]';
    labelText = 'Moderate';
  } else if (normalized < 85) {
    colorClass = 'text-[#0e6670] stroke-[#0e6670]';
    labelText = 'Strong';
  }

  const dimensions = {
    sm: { size: 48, stroke: 4, font: 'text-sm' },
    md: { size: 68, stroke: 5, font: 'text-lg' },
    lg: { size: 96, stroke: 7, font: 'text-2xl' },
  }[size];

  const radius = (dimensions.size - dimensions.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalized / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={dimensions.size}
          height={dimensions.size}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={radius}
            className="stroke-[#e3eded]"
            strokeWidth={dimensions.stroke}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={radius}
            className={`${colorClass} transition-all duration-700 ease-out`}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <span className={`absolute font-bold font-mono ${dimensions.font} text-[#1f2a2e]`}>
          {normalized}
        </span>
      </div>
      {showLabel && (
        <span className="text-[11px] font-mono tracking-[0.08em] font-semibold mt-1 uppercase text-[#55696e]">
          {labelText}
        </span>
      )}
    </div>
  );
};
