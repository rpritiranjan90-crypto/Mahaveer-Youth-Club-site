import React from 'react';
import { Badge, BadgeVariant } from '../ui/Badge';

export interface SectionHeaderProps {
  badge?: string;
  badgeVariant?: BadgeVariant;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  badgeVariant = 'saffron',
  title,
  subtitle,
  align = 'left',
  className = '',
}) => {
  const alignmentClass = {
    left: 'text-left items-start',
    center: 'text-center items-center mx-auto',
    right: 'text-right items-end ml-auto',
  }[align];

  return (
    <div className={`flex flex-col mb-8 sm:mb-12 max-w-3xl ${alignmentClass} ${className}`}>
      {badge && (
        <div className="mb-3">
          <Badge variant={badgeVariant}>{badge}</Badge>
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 sm:mt-3 text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
};
