import React from 'react';
import { Loader2, ArrowUpRight } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  showArrow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  showArrow,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-outfit font-medium rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6670] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variantStyles = {
    primary: 'bg-[#0b0f10] hover:bg-[#0e6670] text-white shadow-sm hover:shadow-md min-h-[44px]',
    secondary: 'bg-white hover:bg-[#f4f8f8] text-[#1f2a2e] border border-[#dbe7e7] hover:border-[#0e6670] shadow-sm',
    outline: 'bg-white hover:bg-[#eaf3f3] text-[#0e6670] border border-[#0e6670] hover:border-[#0a4e56]',
    ghost: 'bg-transparent hover:bg-[#eaf3f3] text-[#55696e] hover:text-[#1f2a2e]',
    danger: 'bg-[#b3261e] hover:bg-[#8f1e18] text-white shadow-sm',
  };

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-sm px-5 py-2.5 min-h-[44px] gap-2',
    lg: 'text-base px-6 py-3 min-h-[48px] gap-2.5',
  };

  // Primary buttons feature a small top-right arrow icon unless explicitly disabled
  const shouldRenderArrow = showArrow !== undefined ? showArrow : (variant === 'primary' && !loading);

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
      {shouldRenderArrow && !loading && (
        <ArrowUpRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      )}
    </button>
  );
};
