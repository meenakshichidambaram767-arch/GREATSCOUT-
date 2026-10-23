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
          className={`w-full ${height} bg-white border border-[#dbe7e7] rounded-[20px] p-6 animate-pulse flex flex-col justify-between`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#e3eded] shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-[#e3eded] rounded w-1/3" />
              <div className="h-3 bg-[#e3eded] rounded w-2/3" />
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <div className="h-2.5 bg-[#e3eded] rounded w-full" />
            <div className="h-2.5 bg-[#e3eded] rounded w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
};
