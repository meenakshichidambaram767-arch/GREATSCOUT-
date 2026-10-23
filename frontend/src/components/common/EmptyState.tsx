import React from 'react';
import { SearchX } from 'lucide-react';
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
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[22px] border border-dashed border-[#dbe7e7] bg-white my-6 shadow-sm">
      {/* Ghost skeleton placeholders in #e3eded */}
      {showGhost && (
        <div className="w-full max-w-sm mb-6 p-4 rounded-xl bg-[#f4f8f8] border border-[#e3eded] space-y-3 opacity-80 pointer-events-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#e3eded] flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#e3eded]" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 bg-[#e3eded] rounded w-1/2" />
              <div className="h-2 bg-[#e3eded] rounded w-3/4" />
            </div>
          </div>
          <div className="h-2 bg-[#e3eded] rounded w-full" />
          <div className="h-2 bg-[#e3eded] rounded w-5/6" />
        </div>
      )}

      <div className="w-12 h-12 rounded-full bg-[#eaf3f3] text-[#0e6670] flex items-center justify-center mb-4">
        {icon || <SearchX className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-bold text-[#1f2a2e] mb-1 font-outfit">{title}</h3>
      <p className="text-xs sm:text-sm text-[#3b4d52] max-w-md mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
