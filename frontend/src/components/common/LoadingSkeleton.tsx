import React from 'react';

export const LoadingSkeleton: React.FC<{ count?: number; height?: string }> = ({
  count = 3,
  height = 'h-24',
}) => {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`w-full ${height} bg-slate-800/40 border border-slate-700/30 rounded-xl animate-pulse`}
        />
      ))}
    </div>
  );
};
