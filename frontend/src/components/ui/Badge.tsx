import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'saffron' | 'maroon' | 'gold' | 'success' | 'error' | 'warning' | 'neutral';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'saffron',
  size = 'md',
  icon,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full select-none';

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 tracking-wide',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const variantStyles = {
    saffron: 'bg-[#FFEDD5] text-[#C2410C] border border-[#FDBA74]',
    maroon: 'bg-[#FEE2E2] text-[#8B1E1E] border border-[#FCA5A5]',
    gold: 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]',
    success: 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]',
    error: 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5]',
    warning: 'bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D]',
    neutral: 'bg-[#F6EDE1] text-[#6B625D] border border-[#E9DED1]',
  };

  return (
    <span
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
