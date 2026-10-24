import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  strokeWidth?: number;
}

// 1. Dashboard / Grid Icon
export const OverviewIcon: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

// 2. Opportunities / Target / Compass Icon
export const OpportunityIcon: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// 3. Signals / Voice / Layers Icon
export const SignalIcon: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M2 12h3M8 6h3M8 18h3M14 3h3M14 21h3M20 9h2M20 15h2" />
    <rect x="7" y="9" width="10" height="6" rx="2" />
  </svg>
);

// 4. Analytics / Trends Graph Icon
export const TrendsIcon: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M3 20h18" />
    <path d="M4 15l5-6 4 3 6-8" />
    <polyline points="15 4 19 4 19 8" />
  </svg>
);

// 5. Ingestion / Data Pipeline Icon
export const PipelineIcon: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
    <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
  </svg>
);

// 6. External Link / Arrow Icon
export const ArrowUpRightIcon: React.FC<IconProps> = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

// 7. Search Icon
export const SearchIcon: React.FC<IconProps> = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// 8. Refresh Icon
export const RefreshIcon: React.FC<IconProps> = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M21.5 2v6h-6M2.5 22v-6h6" />
    <path d="M19.5 13a7.5 7.5 0 0 1-13.4 3.7L2.5 16M4.5 11a7.5 7.5 0 0 1 13.4-3.7L21.5 8" />
  </svg>
);

// 9. Filter Icon
export const FilterIcon: React.FC<IconProps> = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="7" y1="12" x2="17" y2="12" />
    <line x1="10" y1="18" x2="14" y2="18" />
  </svg>
);

// 10. Check / Status Verified Icon
export const CheckIcon: React.FC<IconProps> = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

// 11. Quote Icon
export const QuoteIcon: React.FC<IconProps> = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M3 21c3 0 7-1 7-8V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h2c0 3-2 5-5 5" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h2c0 3-2 5-5 5" />
  </svg>
);

// 12. Arrow Left Icon
export const ArrowLeftIcon: React.FC<IconProps> = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

// 13. Chevron Right / Left
export const ChevronRightIcon: React.FC<IconProps> = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

// 14. Star / Bookmark Icon
export const BookmarkIcon: React.FC<IconProps & { filled?: boolean }> = ({ size = 16, filled = false, className = '', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// 15. Play / Action Icon
export const PlayIcon: React.FC<IconProps> = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className} {...props}>
    <polygon points="6 4 20 12 6 20 6 4" />
  </svg>
);

// 16. Alert / Warning Icon
export const AlertIcon: React.FC<IconProps> = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// 17. External Link Icon
export const ExternalLinkIcon: React.FC<IconProps> = ({ size = 14, className = '', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// 18. Close Icon
export const CloseIcon: React.FC<IconProps> = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

