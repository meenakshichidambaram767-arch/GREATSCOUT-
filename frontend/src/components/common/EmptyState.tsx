import React from 'react';
import { SearchIcon } from './Icons';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  showGhost?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'Try adjusting your search query, changing filters, or triggering an ingestion pipeline.',
  icon,
  actionLabel,
  onAction,
  showGhost = true,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[20px] border border-dashed border-[#dbe7e7] bg-white my-6 shadow-sm">
      {/* Ghost skeleton placeholders */}
      {showGhost && (
        <div className="w-full max-w-sm mb-6 p-4 rounded-xl bg-[#f8fafb] border border-[#e3eded] space-y-3 opacity-80 pointer-events-none">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg border border-[#e3eded] flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#e3eded]" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="h-2 bg-[#e3eded] rounded w-1/2" />
              <div className="h-2 bg-[#e3eded] rounded w-3/4" />
            </div>
          </div>
          <div className="h-2 bg-[#e3eded] rounded w-full" />
          <div className="h-2 bg-[#e3eded] rounded w-5/6" />
        </div>
      )}

      <div className="w-10 h-10 rounded-xl bg-[#eaf3f3] text-[#0e6670] flex items-center justify-center mb-3 border border-[#dbe7e7]">
        {icon || <SearchIcon size={20} />}
      </div>
      <h3 className="text-base font-bold text-[#1f2a2e] mb-1 font-outfit">{title}</h3>
      <p className="text-xs sm:text-sm text-[#55696e] max-w-md mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
