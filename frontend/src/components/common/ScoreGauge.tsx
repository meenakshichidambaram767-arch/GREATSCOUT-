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

  let colorClass = 'text-emerald-400 stroke-emerald-500';
  let bgClass = 'stroke-emerald-950/50';
  let glowClass = 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]';
  let labelText = 'High Potential';

  if (normalized < 60) {
    colorClass = 'text-rose-400 stroke-rose-500';
    bgClass = 'stroke-rose-950/50';
    glowClass = 'drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]';
    labelText = 'Low Signal';
  } else if (normalized < 75) {
    colorClass = 'text-amber-400 stroke-amber-500';
    bgClass = 'stroke-amber-950/50';
    glowClass = 'drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]';
    labelText = 'Moderate';
  } else if (normalized < 85) {
    colorClass = 'text-cyan-400 stroke-cyan-500';
    bgClass = 'stroke-cyan-950/50';
    glowClass = 'drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]';
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
            className={bgClass}
            strokeWidth={dimensions.stroke}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={radius}
            className={`${colorClass} ${glowClass} transition-all duration-1000 ease-out`}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <span className={`absolute font-bold font-mono ${dimensions.font} ${colorClass}`}>
          {normalized}
        </span>
      </div>
      {showLabel && (
        <span className={`text-[11px] font-medium tracking-wide mt-1 uppercase ${colorClass}`}>
          {labelText}
        </span>
      )}
    </div>
  );
};
