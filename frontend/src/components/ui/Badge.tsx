import React from 'react';

export type BadgeVariant =
  | 'saffron'
  | 'maroon'
  | 'slate'
  | 'green'
  | 'amber'
  | 'warning'
  | 'neutral'
  | 'error'
  | 'success';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'saffron',
  children,
  className = '',
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    saffron: 'bg-orange-50 text-orange-800 border-orange-200',
    maroon: 'bg-rose-50 text-rose-900 border-rose-200',
    slate: 'bg-stone-100 text-stone-700 border-stone-200',
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    neutral: 'bg-stone-100 text-stone-700 border-stone-200',
    error: 'bg-rose-50 text-rose-900 border-rose-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
