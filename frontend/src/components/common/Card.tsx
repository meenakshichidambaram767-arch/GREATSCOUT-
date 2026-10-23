import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#dbe7e7] rounded-[22px] p-6 shadow-[0_4px_16px_-2px_rgba(14,102,112,0.04)] transition-all duration-200 ${
        hoverEffect ? 'hover:border-[#0e6670] hover:shadow-[0_12px_28px_-4px_rgba(14,102,112,0.1)] hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
