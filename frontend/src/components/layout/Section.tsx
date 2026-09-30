import React from 'react';
import { Container } from './Container';

export interface SectionProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  align?: 'left' | 'center';
  background?: 'default' | 'white' | 'warm' | 'muted';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  eyebrow,
  title,
  description,
  align = 'left',
  background = 'default',
  size = 'md',
  className = '',
  children,
}) => {
  const bgClasses = {
    default: 'bg-transparent',
    white: 'bg-white border-y border-stone-200/80',
    warm: 'bg-[#FFF8EE] border-y border-[#FFEDD5]',
    muted: 'bg-stone-50 border-y border-stone-200/80',
  };

  const pyClasses = {
    sm: 'py-8 sm:py-10',
    md: 'py-12 sm:py-16',
    lg: 'py-16 sm:py-24',
    xl: 'py-20 sm:py-32',
  };

  const alignClasses = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <section className={`${pyClasses[size]} ${bgClasses[background]} ${className}`}>
      <Container size="lg">
        {(eyebrow || title || description) && (
          <div className={`max-w-3xl mb-8 sm:mb-12 ${alignClasses}`}>
            {eyebrow && (
              <p className="text-xs font-bold tracking-widest text-orange-600 uppercase mb-2">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm sm:text-base text-stone-600 mt-3 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
};
